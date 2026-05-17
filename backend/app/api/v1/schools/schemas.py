from __future__ import annotations

from pydantic import BaseModel


class SchoolRegistrationPayload(BaseModel):
    school_name: str
    school_code: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    contact_email: str
    contact_person_name: str
    contact_phone: str | None = None
    message: str | None = None
