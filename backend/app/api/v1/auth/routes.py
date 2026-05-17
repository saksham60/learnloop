from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user, get_token_subject
from app.api.v1.auth.schemas import OnboardingPayload, ProfilePayload
from app.api.v1.responses import APIResponse
from app.features.auth.service import AuthService, OnboardingCommand, ProfileUpsertCommand

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=APIResponse[dict])
async def get_me(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    service = AuthService(session)
    return APIResponse(data=await service.get_profile(current_user))


@router.post("/bootstrap", response_model=APIResponse[dict])
async def bootstrap_profile(
    session: SessionDep,
    subject=Depends(get_token_subject),
) -> APIResponse[dict]:
    service = AuthService(session)
    data = await service.bootstrap_profile(subject)
    return APIResponse(data=data, message="profile ready")


@router.post("/profile", response_model=APIResponse[dict])
async def create_profile(
    payload: ProfilePayload,
    session: SessionDep,
    subject=Depends(get_token_subject),
) -> APIResponse[dict]:
    service = AuthService(session)
    data = await service.upsert_profile(
        subject,
        ProfileUpsertCommand(
            full_name=payload.full_name,
            role=payload.role,
            approval_status=payload.approval_status,
            school_id=payload.school_id,
            grade_level=payload.grade_level,
            avatar_url=payload.avatar_url,
            approval_reason=payload.approval_reason,
            approval_metadata={"parent_request": payload.parent_request.model_dump()} if payload.parent_request else {},
        ),
    )
    return APIResponse(data=data, message="profile upserted")


@router.patch("/profile", response_model=APIResponse[dict])
async def update_profile(
    payload: ProfilePayload,
    session: SessionDep,
    subject=Depends(get_token_subject),
) -> APIResponse[dict]:
    service = AuthService(session)
    data = await service.upsert_profile(
        subject,
        ProfileUpsertCommand(
            full_name=payload.full_name,
            role=payload.role,
            approval_status=payload.approval_status,
            school_id=payload.school_id,
            grade_level=payload.grade_level,
            avatar_url=payload.avatar_url,
            approval_reason=payload.approval_reason,
            approval_metadata={"parent_request": payload.parent_request.model_dump()} if payload.parent_request else {},
        ),
    )
    return APIResponse(data=data, message="profile updated")


@router.post("/onboarding", response_model=APIResponse[dict])
async def submit_onboarding(
    payload: OnboardingPayload,
    session: SessionDep,
    subject=Depends(get_token_subject),
) -> APIResponse[dict]:
    service = AuthService(session)
    data = await service.onboard_profile(
        subject,
        OnboardingCommand(
            role=payload.role,
            school_id=payload.school_id,
            approval_status=payload.approval_status,
            grade_level=payload.grade_level,
            parent_request=payload.parent_request.model_dump() if payload.parent_request else None,
        ),
    )
    return APIResponse(data=data, message="onboarding updated")
