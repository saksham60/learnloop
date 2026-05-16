from __future__ import annotations

from app.agents.orchestrator import AgentOrchestrator
from app.agents.registry import AgentRegistry
from app.agents.state import AgentContext, AgentLoopInput, AgentLoopResult, ToolObservation
from app.agents.tracing.trace_service import TraceService
from app.core.constants import AgentStage, EventType
from app.core.exceptions import RuleViolationError


class AgentLoop:
    def __init__(
        self,
        *,
        trace_service: TraceService,
        orchestrator: AgentOrchestrator,
        registry: AgentRegistry,
        event_logger=None,
    ) -> None:
        self._trace_service = trace_service
        self._orchestrator = orchestrator
        self._registry = registry
        self._event_logger = event_logger

    async def run(self, request: AgentLoopInput, *, services: dict) -> AgentLoopResult:
        context = AgentContext(request=request, services=services)
        run = await self._trace_service.start_run(
            user_id=request.user_id,
            role=request.role,
            session_id=request.session_id,
            request_type=request.request_type,
            metadata=request.metadata,
        )
        try:
            agent = await self._orchestrator.choose_specialist(context)

            plan = await agent.plan(context)
            context.plan = plan
            await self._trace_service.log_step(
                agent_run_id=run.id,
                step_name=AgentStage.PLAN.value,
                agent_name=agent.name,
                input_payload=request.metadata,
                output_payload=plan,
            )

            tool_calls = await agent.act(context)
            await self._trace_service.log_step(
                agent_run_id=run.id,
                step_name=AgentStage.ACT.value,
                agent_name=agent.name,
                input_payload={"user_message": request.user_message},
                output_payload={"tool_calls": [tool_call.tool_name for tool_call in tool_calls]},
            )

            observations: list[ToolObservation] = []
            for tool_call in tool_calls:
                tool = self._registry.get_tool(tool_call.tool_name)
                result = await tool.execute(context, tool_call.payload)
                observation = ToolObservation(
                    tool_name=result.tool_name,
                    status=result.status,
                    output=result.output,
                )
                observations.append(observation)
                await self._trace_service.log_tool_call(
                    agent_run_id=run.id,
                    tool_name=result.tool_name,
                    input_payload=tool_call.payload,
                    output_payload=result.output,
                    status=result.status,
                )

            context.observations = observations
            observation_payload = await agent.observe(context, observations)
            await self._trace_service.log_step(
                agent_run_id=run.id,
                step_name=AgentStage.OBSERVE.value,
                agent_name=agent.name,
                input_payload={"observation_count": len(observations)},
                output_payload=observation_payload,
            )

            reflection = await agent.reflect(context, observation_payload)
            context.reflection = reflection
            await self._trace_service.log_step(
                agent_run_id=run.id,
                step_name=AgentStage.REFLECT.value,
                agent_name=agent.name,
                input_payload=observation_payload,
                output_payload=reflection,
            )

            if self._event_logger is not None and request.user_id is not None:
                await self._event_logger.create_event(
                    student_id=request.user_id,
                    school_id=services["current_user"].school_id if services.get("current_user") else None,
                    session_id=request.session_id,
                    event_type=EventType.AGENT_REFLECTION,
                    payload={"agent": agent.name, "reflection": reflection},
                )
            await self._trace_service.log_step(
                agent_run_id=run.id,
                step_name=AgentStage.UPDATE_EVENTS.value,
                agent_name=agent.name,
                input_payload=reflection,
                output_payload={"event_logged": self._event_logger is not None},
            )

            final_response = await agent.next_step(context, reflection)
            evaluation = await self._orchestrator.evaluate_response(context, final_response)
            if not evaluation.get("allowed", False):
                raise RuleViolationError(evaluation.get("reason", "Final response rejected by evaluator."))
            context.final_response = final_response
            await self._trace_service.log_step(
                agent_run_id=run.id,
                step_name=AgentStage.NEXT_STEP.value,
                agent_name=agent.name,
                input_payload=reflection,
                output_payload={"final_response": final_response, "evaluation": evaluation},
            )
            await self._trace_service.complete_run(agent_run_id=run.id, final_response=final_response)
            return AgentLoopResult(
                run_id=run.id,
                selected_agent=agent.name,
                response=final_response,
                observations=observations,
            )
        except Exception as exc:
            await self._trace_service.fail_run(agent_run_id=run.id, detail=str(exc))
            raise

