from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import get_authenticated_user, get_llm_gateway, get_socratic_state_machine
from app.api.dependencies import SessionDep
from app.api.v1.learning.schemas import LearningAttemptRequest, LearningChatRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.learning.service import LearningChatCommand, LearningService

router = APIRouter(prefix="/learning", tags=["learning"])


def _build_command(payload: LearningChatRequest) -> LearningChatCommand:
    return LearningChatCommand(
        session_id=payload.session_id,
        message=payload.message,
        attempts_count=payload.attempts_count,
        hints_used=payload.hints_used,
        student_said_stuck=payload.student_said_stuck,
        explain_requested=payload.explain_requested,
    )


@router.post("/chat", response_model=APIResponse[dict])
async def learning_chat(
    payload: LearningChatRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = LearningService(session, get_socratic_state_machine(), get_llm_gateway())
    return APIResponse(data=await service.chat(current_user, _build_command(payload)))


@router.post("/attempt", response_model=APIResponse[dict])
async def learning_attempt(
    payload: LearningAttemptRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = LearningService(session, get_socratic_state_machine(), get_llm_gateway())
    return APIResponse(data=await service.attempt(current_user, payload.session_id, payload.answer))


@router.post("/hint", response_model=APIResponse[dict])
async def learning_hint(
    payload: LearningChatRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = LearningService(session, get_socratic_state_machine(), get_llm_gateway())
    return APIResponse(data=await service.hint(current_user, _build_command(payload)))


@router.post("/explain-after-effort", response_model=APIResponse[dict])
async def explain_after_effort(
    payload: LearningChatRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = LearningService(session, get_socratic_state_machine(), get_llm_gateway())
    return APIResponse(data=await service.explain_after_effort(current_user, _build_command(payload)))
