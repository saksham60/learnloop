from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class HomeworkQuestionCreate(BaseModel):
    prompt: str
    order_index: int = 0


class HomeworkCreateRequest(BaseModel):
    title: str
    description: str | None = None
    school_id: UUID
    class_id: UUID | None = None
    subject_id: UUID | None = None
    due_at: datetime | None = None
    questions: list[HomeworkQuestionCreate] = Field(default_factory=list)


class HomeworkAttemptRequest(BaseModel):
    question_id: UUID | None = None
    answer_text: str
    hints_used: int = 0
    is_correct: bool | None = None
    score: float | None = None

