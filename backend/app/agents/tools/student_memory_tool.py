from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class StudentMemoryTool(BaseTool):
    name = "StudentMemoryTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        return ToolExecutionResult(
            tool_name=self.name,
            status="completed",
            output={"preferences": context.request.metadata.get("student_memory", {})},
        )

