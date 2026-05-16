from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    session_id: UUID | None = None
    request_type: str
    user_message: str
    metadata: dict = Field(default_factory=dict)

