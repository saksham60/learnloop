from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class ProgressAnalystAgent(BaseAgent):
    name = "ProgressAnalystAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {
            "goal": "Answer progress questions using safe structured summaries.",
            "strategy": "Collect snapshot data and focus areas before wording a response.",
        }

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [
            ToolInvocation(tool_name="ProgressQueryTool", payload={}),
            ToolInvocation(tool_name="FocusAreaTool", payload={}),
        ]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        observation = {}
        for item in tool_results:
            observation[item.tool_name] = item.output
        return observation

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {"structured_summary": observation}

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        llm_gateway = context.services.get("llm_gateway")
        if llm_gateway is None:
            return "Your progress answer is based on recent homework, focus areas, and activity trends."
        return await llm_gateway.generate_progress_answer(
            structured_summary=str(reflection["structured_summary"]),
            user_question=context.request.user_message,
        )

