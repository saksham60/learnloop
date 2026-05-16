from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import SessionDep, get_authenticated_user, get_settings
from app.api.v1.homework.schemas import HomeworkAttemptRequest, HomeworkCreateRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_not_pending, ensure_role
from app.features.homework.service import (
    HomeworkAttemptCommand,
    HomeworkCreateCommand,
    HomeworkQuestionCommand,
    HomeworkService,
)

router = APIRouter(prefix="/homework", tags=["homework"])


@router.post("", response_model=APIResponse[dict])
async def create_homework(
    payload: HomeworkCreateRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = HomeworkService(session, get_settings())
    data = await service.create_homework(
        current_user,
        HomeworkCreateCommand(
            title=payload.title,
            description=payload.description,
            school_id=payload.school_id,
            class_id=payload.class_id,
            subject_id=payload.subject_id,
            due_at=payload.due_at,
            questions=[HomeworkQuestionCommand(prompt=item.prompt, order_index=item.order_index) for item in payload.questions],
        ),
    )
    return APIResponse(data=data, message="homework created")


@router.get("", response_model=APIResponse[list[dict]])
async def list_homework(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> APIResponse[list[dict]]:
    ensure_not_pending(current_user)
    service = HomeworkService(session, get_settings())
    return APIResponse(data=await service.list_homework(limit=limit, offset=offset))


@router.get("/{homework_id}", response_model=APIResponse[dict])
async def get_homework(
    homework_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_not_pending(current_user)
    service = HomeworkService(session, get_settings())
    return APIResponse(data=await service.get_homework(homework_id))


@router.post("/{homework_id}/attempt", response_model=APIResponse[dict])
async def attempt_homework(
    homework_id: UUID,
    payload: HomeworkAttemptRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = HomeworkService(session, get_settings())
    data = await service.submit_attempt(
        homework_id=homework_id,
        current_user=current_user,
        command=HomeworkAttemptCommand(
            answer_text=payload.answer_text,
            question_id=payload.question_id,
            hints_used=payload.hints_used,
            is_correct=payload.is_correct,
            score=payload.score,
        ),
    )
    return APIResponse(data=data, message="attempt saved")


@router.post("/{homework_id}/submit", response_model=APIResponse[dict])
async def submit_homework(
    homework_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = HomeworkService(session, get_settings())
    return APIResponse(data=await service.submit_homework(homework_id, current_user), message="homework submitted")


@router.get("/{homework_id}/analytics", response_model=APIResponse[dict])
async def homework_analytics(
    homework_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = HomeworkService(session, get_settings())
    return APIResponse(data=await service.get_analytics(homework_id))
