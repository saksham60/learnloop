from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class LearningChatRequest(BaseModel):
    session_id: UUID | None = None
    message: str
    attempts_count: int = 0
    hints_used: int = 0
    student_said_stuck: bool = False
    explain_requested: bool = False


class LearningAttemptRequest(BaseModel):
    session_id: UUID | None = None
    answer: str

