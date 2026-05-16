from __future__ import annotations

from pydantic import BaseModel


class TeacherClassSummary(BaseModel):
    id: str
    name: str
    code: str

