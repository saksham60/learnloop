from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class ContentCuratorAgent(BaseAgent):
    name = "ContentCuratorAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {"goal": "Find and curate relevant content evidence.", "strategy": "Search chunks and vector retrieval."}

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [
            ToolInvocation(tool_name="ContentSearchTool", payload={"query": context.request.user_message}),
            ToolInvocation(tool_name="VectorRetrievalTool", payload={"query": context.request.user_message}),
        ]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return {item.tool_name: item.output for item in tool_results}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {"content_evidence": observation}

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        return "Content retrieval is ready for downstream explanation."

