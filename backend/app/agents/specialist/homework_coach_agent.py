from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class HomeworkCoachAgent(BaseAgent):
    name = "HomeworkCoachAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {
            "goal": "Enforce attempt-first homework support.",
            "strategy": "Check homework policy before giving hints or explanations.",
        }

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [
            ToolInvocation(
                tool_name="HomeworkTool",
                payload={
                    "homework_id": context.request.metadata["homework_id"],
                    "question_id": context.request.metadata.get("question_id"),
                    "student_said_stuck": context.request.metadata.get("student_said_stuck", False),
                },
            )
        ]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return tool_results[0].output if tool_results else {}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {
            "policy_ok": observation.get("allow_hint") or observation.get("allow_explanation"),
            "policy": observation,
        }

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        policy = reflection["policy"]
        if not reflection["policy_ok"]:
            return f"Start with your own attempt first. {policy.get('reason', '')}".strip()
        llm_gateway = context.services.get("llm_gateway")
        prompt = (
            f"Homework request: {context.request.user_message}\n"
            f"Policy: {policy}\n"
            "Provide the next permitted hint or explanation without dumping the final answer."
        )
        if llm_gateway is None:
            return "Try outlining the first step you would take, and I’ll help from there."
        return await llm_gateway.generate_homework_hint(prompt)

