from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.responses import APIResponse
from app.api.v1.school.schemas import ApproveChildRequestPayload, RejectChildRequestPayload
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.school_portal.service import SchoolPortalService

router = APIRouter(prefix="/school", tags=["school"])


@router.get("/child-requests", response_model=APIResponse[list[dict]])
async def list_child_requests(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolPortalService(session)
    return APIResponse(data=await service.list_child_requests(current_user))


@router.post("/child-requests/{request_id}/approve", response_model=APIResponse[dict])
async def approve_child_request(
    request_id: UUID,
    payload: ApproveChildRequestPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolPortalService(session)
    data = await service.approve_child_request(current_user, request_id, student_id=payload.student_id)
    return APIResponse(data=data, message="child request approved")


@router.post("/child-requests/{request_id}/reject", response_model=APIResponse[dict])
async def reject_child_request(
    request_id: UUID,
    payload: RejectChildRequestPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolPortalService(session)
    data = await service.reject_child_request(current_user, request_id, reason=payload.reason)
    return APIResponse(data=data, message="child request rejected")
