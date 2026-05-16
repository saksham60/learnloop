from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.growth.schemas import GrowthActivityRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.growth.service import GrowthService

router = APIRouter(prefix="/growth", tags=["growth"])


@router.post("/activity", response_model=APIResponse[dict])
async def create_growth_activity(
    payload: GrowthActivityRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = GrowthService(session)
    data = await service.create_activity(
        current_user,
        activity_type=payload.activity_type,
        title=payload.title,
        description=payload.description,
    )
    return APIResponse(data=data, message="growth activity created")


@router.get("/activities", response_model=APIResponse[list[dict]])
async def list_growth_activities(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.STUDENT)
    service = GrowthService(session)
    return APIResponse(data=await service.list_activities(current_user))


@router.post("/activity/{activity_id}/complete", response_model=APIResponse[dict])
async def complete_growth_activity(
    activity_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.STUDENT)
    service = GrowthService(session)
    return APIResponse(data=await service.complete_activity(current_user, activity_id), message="activity completed")
