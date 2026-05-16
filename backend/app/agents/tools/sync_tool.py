from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class SyncTool(BaseTool):
    name = "SyncTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        return ToolExecutionResult(
            tool_name=self.name,
            status="completed",
            output={"sync_ready": True, "device_id": payload.get("device_id")},
        )

