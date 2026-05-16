from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.api.v1.responses import APIResponse

router = APIRouter(prefix="/health", tags=["health"])


class HealthPayload(BaseModel):
    status: str
    service: str


@router.get("", response_model=APIResponse[HealthPayload])
async def healthcheck() -> APIResponse[HealthPayload]:
    return APIResponse(
        data=HealthPayload(status="ok", service="ai-student-companion-backend"),
        message="service healthy",
    )

