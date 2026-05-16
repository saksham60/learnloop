from __future__ import annotations

from abc import ABC, abstractmethod

from app.agents.state import AgentContext, ToolInvocation, ToolObservation


class BaseAgent(ABC):
    name: str

    @abstractmethod
    async def plan(self, context: AgentContext) -> dict:
        raise NotImplementedError

    @abstractmethod
    async def act(self, context: AgentContext) -> list[ToolInvocation]:
        raise NotImplementedError

    @abstractmethod
    async def observe(self, context: AgentContext, tool_results: list[ToolObservation]) -> dict:
        raise NotImplementedError

    @abstractmethod
    async def reflect(self, context: AgentContext, observation: dict) -> dict:
        raise NotImplementedError

    @abstractmethod
    async def next_step(self, context: AgentContext, reflection: dict) -> str:
        raise NotImplementedError

