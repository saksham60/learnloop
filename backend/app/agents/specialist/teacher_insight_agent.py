from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class TeacherInsightAgent(BaseAgent):
    name = "TeacherInsightAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {"goal": "Summarize class-level risks and trends.", "strategy": "Pull analytics for the target class."}

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [ToolInvocation(tool_name="AnalyticsTool", payload={"class_id": context.request.metadata["class_id"]})]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return tool_results[0].output if tool_results else {}

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {"teacher_insight": observation}

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        return f"Teacher insight summary: {reflection['teacher_insight']}"

