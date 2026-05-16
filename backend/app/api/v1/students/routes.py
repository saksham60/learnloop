from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.students.service import StudentService

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me", response_model=APIResponse[dict])
async def get_student_me(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = StudentService(session)
    return APIResponse(data=await service.get_me(current_user))


@router.get("/me/dashboard", response_model=APIResponse[dict])
async def get_dashboard(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = StudentService(session)
    return APIResponse(data=await service.get_dashboard(current_user))


@router.get("/me/events", response_model=APIResponse[list[dict]])
async def get_events(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.STUDENT)
    service = StudentService(session)
    return APIResponse(data=await service.list_events(current_user, limit=limit, offset=offset))


@router.get("/me/focus", response_model=APIResponse[list[dict]])
async def get_focus(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.STUDENT)
    service = StudentService(session)
    return APIResponse(data=await service.get_focus(current_user))
