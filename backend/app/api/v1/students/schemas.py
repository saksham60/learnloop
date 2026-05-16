from __future__ import annotations

from pydantic import BaseModel


class PaginationQuery(BaseModel):
    limit: int = 50
    offset: int = 0

