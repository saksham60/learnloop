from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class ApproveChildRequestPayload(BaseModel):
    student_id: UUID | None = None


class RejectChildRequestPayload(BaseModel):
    reason: str | None = None
