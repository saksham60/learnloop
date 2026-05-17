from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from app.core.constants import ApprovalStatus, Role


class ParentRequestPayload(BaseModel):
    child_name: str | None = None
    child_email: str | None = None
    child_class: str | None = None
    relationship: str | None = None


class ProfilePayload(BaseModel):
    full_name: str
    role: Role
    approval_status: ApprovalStatus = ApprovalStatus.ACTIVE
    school_id: UUID | None = None
    grade_level: str | None = None
    avatar_url: str | None = None
    approval_reason: str | None = None
    parent_request: ParentRequestPayload | None = None


class OnboardingPayload(BaseModel):
    role: Role
    school_id: UUID
    approval_status: ApprovalStatus
    grade_level: str | None = None
    parent_request: ParentRequestPayload | None = None


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: Role
    approval_status: ApprovalStatus
    school_id: str | None = None
    school_name: str | None = None
    grade_level: str | None = None
    avatar_url: str | None = None
    approval_reason: str | None = None
    parent_request: ParentRequestPayload | None = None
    created_at: str
