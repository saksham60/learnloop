from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class GrowthCoachAgent(BaseAgent):
    name = "GrowthCoachAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {"goal": "Coach growth habits outside pure academics.", "strategy": "Use memory and sync context to personalize the suggestion."}

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [
            ToolInvocation(tool_name="StudentMemoryTool", payload={}),
            ToolInvocation(tool_name="SyncTool", payload={"device_id": context.request.metadata.get("device_id")}),
        ]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return {item.tool_name: item.output for item in tool_results}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {"growth_context": observation}

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        return "Choose one small growth activity you can finish today and schedule it before distractions start."

