from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class SocraticTutorAgent(BaseAgent):
    name = "SocraticTutorAgent"

    async def plan(self, context: AgentContext) -> dict:
        return {
            "goal": "Guide the student with questions before explanation.",
            "strategy": "Use student memory and targeted practice to build the next Socratic prompt.",
        }

    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        return [
            ToolInvocation(tool_name="StudentMemoryTool", payload={}),
            ToolInvocation(tool_name="PracticeGeneratorTool", payload={"topic": context.request.metadata.get("topic", "the current problem")}),
        ]

    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        return {
            "memory": next((item.output for item in tool_results if item.tool_name == "StudentMemoryTool"), {}),
            "practice": next((item.output for item in tool_results if item.tool_name == "PracticeGeneratorTool"), {}),
        }

    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        return {
            "teaching_mode": "socratic",
            "next_move": "ask_guiding_question",
            "observation": observation,
        }

    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        llm_gateway = context.services.get("llm_gateway")
        prompt = (
            f"Student message: {context.request.user_message}\n"
            f"Observation: {reflection['observation']}\n"
            "Ask one guiding question and do not reveal the final answer."
        )
        if llm_gateway is None:
            return "What have you tried so far, and which step feels unclear?"
        return await llm_gateway.generate_socratic_response(prompt)

