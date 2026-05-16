from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class VectorRetrievalTool(BaseTool):
    name = "VectorRetrievalTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        return ToolExecutionResult(
            tool_name=self.name,
            status="completed",
            output={"matches": [], "query": payload.get("query")},
        )

