from __future__ import annotations

from pydantic import BaseModel


class ContentUploadRequest(BaseModel):
    filename: str
    content_type: str
    storage_path: str


class ContentProcessRequest(BaseModel):
    raw_text: str | None = None

