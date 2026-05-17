from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.parent.schemas import ParentChildRequestPayload
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.parent_portal.service import ParentPortalService

router = APIRouter(prefix="/parent", tags=["parent"])


@router.get("/child-requests", response_model=APIResponse[list[dict]])
async def list_child_requests(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.PARENT)
    service = ParentPortalService(session)
    return APIResponse(data=await service.list_child_requests(current_user))


@router.post("/child-requests", response_model=APIResponse[dict])
async def create_child_request(
    payload: ParentChildRequestPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.PARENT)
    service = ParentPortalService(session)
    data = await service.create_child_request(
        current_user,
        school_id=payload.school_id,
        child_name=payload.child_name,
        child_email=payload.child_email,
        child_class=payload.child_class,
        child_section=payload.child_section,
        relationship=payload.relationship,
        message=payload.message,
    )
    return APIResponse(data=data, message="child access request submitted")
