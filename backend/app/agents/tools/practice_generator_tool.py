from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class PracticeGeneratorTool(BaseTool):
    name = "PracticeGeneratorTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        topic = payload.get("topic", "current lesson")
        return ToolExecutionResult(
            tool_name=self.name,
            status="completed",
            output={"practice_prompt": f"Try one short question on {topic} before asking for the full explanation."},
        )

