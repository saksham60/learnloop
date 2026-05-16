from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class AnalyticsTool(BaseTool):
    name = "AnalyticsTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        analytics_service = context.services["analytics_service"]
        summary = await analytics_service.build_teacher_insight(payload["class_id"])
        return ToolExecutionResult(tool_name=self.name, status="completed", output=summary)

