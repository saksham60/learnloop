from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class FocusAreaTool(BaseTool):
    name = "FocusAreaTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        focus_service = context.services["focus_service"]
        focus = await focus_service.get_today_focus(context.services["current_user"])
        return ToolExecutionResult(tool_name=self.name, status="completed", output={"focus_areas": focus})

