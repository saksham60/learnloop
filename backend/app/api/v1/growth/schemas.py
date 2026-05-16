from __future__ import annotations

from pydantic import BaseModel


class GrowthActivityRequest(BaseModel):
    activity_type: str
    title: str
    description: str | None = None

