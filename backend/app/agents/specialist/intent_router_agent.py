from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation


class StudentIntentRouterAgent(BaseAgent):
    name = "StudentIntentRouterAgent"

    async def route(self, context: AgentContext) -> str:
        request_type = context.request.request_type
        if request_type == "homework_help":
            return "HomeworkCoachAgent"
        if request_type == "progress_question":
            return "ProgressAnalystAgent"
        if request_type == "focus_refresh":
            return "LearningCompassAgent"
        if request_type == "teacher_insight":
            return "TeacherInsightAgent"
        if request_type == "growth_activity":
            return "GrowthCoachAgent"
        if request_type == "content_process":
            return "ContentCuratorAgent"
        return "SocraticTutorAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {"selected_agent": await self.route(context)}

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return []

    async def observe(self, context: AgentContext, tool_results: list) -> dict:
        return {"tool_results": len(tool_results)}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {"selected_agent": context.selected_agent}

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        return reflection["selected_agent"]

