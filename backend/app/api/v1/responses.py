from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    data: T | None = None
    message: str = "ok"
    meta: dict[str, Any] = Field(default_factory=dict)

