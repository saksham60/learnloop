from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from app.agents.state import AgentContext


@dataclass(slots=True)
class ToolExecutionResult:
    tool_name: str
    status: str
    output: dict[str, Any]


class BaseTool(ABC):
    name: str

    @abstractmethod
    async def execute(self, context: AgentContext, payload: dict[str, Any]) -> ToolExecutionResult:
        raise NotImplementedError

