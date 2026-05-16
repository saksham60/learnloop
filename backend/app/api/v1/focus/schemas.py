from __future__ import annotations

from pydantic import BaseModel


class FocusRefreshRequest(BaseModel):
    reason: str | None = None

