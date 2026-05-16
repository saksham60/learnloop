from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user, get_llm_gateway
from app.api.v1.focus.schemas import FocusRefreshRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.focus.service import FocusService

router = APIRouter(prefix="/focus", tags=["focus"])


@router.get("/today", response_model=APIResponse[list[dict]])
async def get_today_focus(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.STUDENT)
    service = FocusService(session, get_llm_gateway())
    return APIResponse(data=await service.get_today_focus(current_user))


@router.post("/refresh", response_model=APIResponse[list[dict]])
async def refresh_focus(
    payload: FocusRefreshRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.STUDENT)
    service = FocusService(session, get_llm_gateway())
    data = await service.refresh_focus(current_user)
    return APIResponse(data=data, meta={"reason": payload.reason or "manual"})
