from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from app.core.constants import Role


class ProfilePayload(BaseModel):
    full_name: str
    role: Role
    school_id: UUID | None = None
    grade_level: str | None = None
    avatar_url: str | None = None


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: Role
    school_id: str | None = None
    grade_level: str | None = None
