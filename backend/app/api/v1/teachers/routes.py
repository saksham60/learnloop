from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.teachers.service import TeacherService

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("/me/classes", response_model=APIResponse[list[dict]])
async def list_my_classes(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = TeacherService(session)
    return APIResponse(data=await service.list_classes(current_user.user_id))


@router.get("/classes/{class_id}/analytics", response_model=APIResponse[dict])
async def get_class_analytics(
    class_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = TeacherService(session)
    return APIResponse(data=await service.get_class_analytics(class_id))


@router.get("/classes/{class_id}/weak-topics", response_model=APIResponse[list[dict]])
async def get_class_weak_topics(
    class_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = TeacherService(session)
    return APIResponse(data=await service.get_weak_topics(class_id))


@router.get("/classes/{class_id}/misconceptions", response_model=APIResponse[list[dict]])
async def get_class_misconceptions(
    class_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = TeacherService(session)
    return APIResponse(data=await service.get_misconceptions(class_id))
