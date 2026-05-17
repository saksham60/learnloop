from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.dependencies import SessionDep
from app.api.v1.responses import APIResponse
from app.features.schools.service import SchoolService

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("", response_model=APIResponse[list[dict]])
async def list_schools(
    session: SessionDep,
    q: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    service = SchoolService(session)
    return APIResponse(data=await service.list_schools(search=q))


@router.get("/search", response_model=APIResponse[list[dict]])
async def search_schools(
    session: SessionDep,
    q: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    service = SchoolService(session)
    return APIResponse(data=await service.list_schools(search=q))
