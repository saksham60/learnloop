from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from app.core.constants import ApprovalStatus, Role


class ApprovalActionPayload(BaseModel):
    role: Role


class RejectApprovalPayload(BaseModel):
    reason: str | None = None


class CreateClassPayload(BaseModel):
    name: str
    code: str
    grade_level: str | None = None
    teacher_id: UUID | None = None
    subject_id: UUID | None = None


class TeacherStudentsPayload(BaseModel):
    teacher_id: UUID
    student_ids: list[UUID]
    class_id: UUID | None = None
    subject_id: UUID | None = None


class ParentStudentsPayload(BaseModel):
    parent_id: UUID
    student_ids: list[UUID]
    relationship: str | None = None


class ApprovalFilterParams(BaseModel):
    status: ApprovalStatus | None = None
    search: str | None = None
