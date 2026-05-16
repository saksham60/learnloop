from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class LearningCompassAgent(BaseAgent):
    name = "LearningCompassAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {
            "goal": "Rank what the student should focus on today.",
            "strategy": "Combine focus areas and progress snapshot before explaining the priority order.",
        }

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [
            ToolInvocation(tool_name="FocusAreaTool", payload={}),
            ToolInvocation(tool_name="ProgressQueryTool", payload={}),
        ]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return {item.tool_name: item.output for item in tool_results}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {"today_focus_summary": observation}

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        llm_gateway = context.services.get("llm_gateway")
        summary = str(reflection["today_focus_summary"])
        if llm_gateway is None:
            return "Focus first on the areas with repeated mistakes and due homework, then review one growth habit."
        return await llm_gateway.explain_focus_area(summary)

