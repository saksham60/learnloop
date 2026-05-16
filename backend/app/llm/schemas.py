from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class LLMMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class LLMGenerationRequest(BaseModel):
    system_prompt: str
    user_prompt: str
    temperature: float | None = None
    max_tokens: int | None = None


class SafetyCheckResult(BaseModel):
    allowed: bool
    reason: str
    flags: list[str] = Field(default_factory=list)


class JSONGenerationResult(BaseModel):
    payload: dict[str, Any]

