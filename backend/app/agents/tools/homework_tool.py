from __future__ import annotations

from app.agents.state import AgentContext
from app.agents.tools.base_tool import BaseTool, ToolExecutionResult


class HomeworkTool(BaseTool):
    name = "HomeworkTool"

    async def execute(self, context: AgentContext, payload: dict) -> ToolExecutionResult:
        homework_service = context.services["homework_service"]
        policy = await homework_service.get_guidance_policy(
            homework_id=payload["homework_id"],
            student_id=context.request.user_id,
            question_id=payload.get("question_id"),
            student_said_stuck=payload.get("student_said_stuck", False),
        )
        return ToolExecutionResult(tool_name=self.name, status="completed", output=policy)

