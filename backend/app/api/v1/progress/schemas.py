from __future__ import annotations

from pydantic import BaseModel


class ProgressAskRequest(BaseModel):
    question: str

