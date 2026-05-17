from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from app.core.constants import SchoolStatus


class CreateSchoolPayload(BaseModel):
    name: str
    code: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    contact_email: str | None = None
    status: SchoolStatus = SchoolStatus.ACTIVE


class UpdateSchoolPayload(BaseModel):
    name: str | None = None
    code: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    contact_email: str | None = None
    status: SchoolStatus | None = None


class AssignSchoolAdminPayload(BaseModel):
    email: str
    school_id: UUID
