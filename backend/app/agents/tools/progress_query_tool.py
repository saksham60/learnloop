from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class ProgressQueryTool(BaseTool):
    name = "ProgressQueryTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        progress_service = context.services["progress_service"]
        snapshot = await progress_service.build_snapshot(context.services["current_user"])
        return ToolExecutionResult(
            tool_name=self.name,
            status="completed",
            output={
                "pending_homework_count": snapshot.pending_homework_count,
                "completed_homework_count": snapshot.completed_homework_count,
                "focus_titles": snapshot.focus_titles,
            },
        )

