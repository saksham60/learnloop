from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class SafetyPedagogyEvaluatorAgent(BaseAgent):
    name = "SafetyPedagogyEvaluatorAgent"

    async def evaluate(self, context: AgentContext, response_text: str) -> dict:
        llm_gateway = context.services.get("llm_gateway")
        if llm_gateway is None:
            allowed = "final answer:" not in response_text.lower()
            return {"allowed": allowed, "reason": "deterministic evaluator fallback"}
        result = await llm_gateway.evaluate_response(response_text)
        return result.model_dump()

    async def plan(self, context: AgentContext) -> dict:
        return {"goal": "Validate final response for pedagogy and safety."}

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return []

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return {"tool_results": []}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return observation

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        return "validated"

