from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user, get_llm_gateway
from app.api.v1.progress.schemas import ProgressAskRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.progress.service import ProgressService

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/ask", response_model=APIResponse[dict])
async def ask_progress(
    payload: ProgressAskRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = ProgressService(session, get_llm_gateway())
    return APIResponse(data=await service.ask(current_user, payload.question))


@router.get("/summary", response_model=APIResponse[dict])
async def get_progress_summary(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = ProgressService(session, get_llm_gateway())
    return APIResponse(data=await service.summary(current_user))


@router.get("/weak-topics", response_model=APIResponse[list[dict]])
async def get_weak_topics(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.STUDENT)
    service = ProgressService(session, get_llm_gateway())
    return APIResponse(data=await service.weak_topics(current_user))
