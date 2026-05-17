from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class ParentChildRequestPayload(BaseModel):
    school_id: UUID
    child_name: str
    child_email: str | None = None
    child_class: str | None = None
    child_section: str | None = None
    relationship: str
    message: str | None = None
