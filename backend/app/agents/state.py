from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.core.constants import Role


@dataclass(slots=True)
class ToolInvocation:
    tool_name: str
    payload: dict[str, Any]


@dataclass(slots=True)
class ToolObservation:
    tool_name: str
    status: str
    output: dict[str, Any]


@dataclass(slots=True)
class AgentLoopInput:
    user_id: UUID | None
    role: Role | None
    session_id: UUID | None
    request_type: str
    user_message: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class AgentContext:
    request: AgentLoopInput
    services: dict[str, Any] = field(default_factory=dict)
    selected_agent: str | None = None
    plan: dict[str, Any] = field(default_factory=dict)
    observations: list[ToolObservation] = field(default_factory=list)
    reflection: dict[str, Any] = field(default_factory=dict)
    final_response: str | None = None


@dataclass(slots=True)
class AgentLoopResult:
    run_id: UUID
    selected_agent: str
    response: str
    observations: list[ToolObservation]

