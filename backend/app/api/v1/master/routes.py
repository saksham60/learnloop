from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.master.schemas import AssignSchoolAdminPayload, CreateSchoolPayload, UpdateSchoolPayload
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.master_admin.service import MasterAdminService

router = APIRouter(prefix="/master", tags=["master"])


@router.get("/overview", response_model=APIResponse[dict])
async def master_overview(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    return APIResponse(data=await service.overview())


@router.get("/schools", response_model=APIResponse[list[dict]])
async def list_schools(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    return APIResponse(data=await service.list_schools())


@router.post("/schools", response_model=APIResponse[dict])
async def create_school(
    payload: CreateSchoolPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    data = await service.create_school(
        name=payload.name,
        code=payload.code,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        contact_email=payload.contact_email,
        status=payload.status,
    )
    return APIResponse(data=data, message="school created")


@router.patch("/schools/{school_id}", response_model=APIResponse[dict])
async def update_school(
    school_id: UUID,
    payload: UpdateSchoolPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    data = await service.update_school(
        school_id,
        name=payload.name,
        code=payload.code,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        contact_email=payload.contact_email,
        status=payload.status,
    )
    return APIResponse(data=data, message="school updated")


@router.get("/users", response_model=APIResponse[list[dict]])
async def list_users(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    return APIResponse(data=await service.list_users())


@router.get("/school-admins", response_model=APIResponse[list[dict]])
async def list_school_admins(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    return APIResponse(data=await service.list_school_admins())


@router.post("/school-admins/assign", response_model=APIResponse[dict])
async def assign_school_admin(
    payload: AssignSchoolAdminPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.PLATFORM_ADMIN)
    service = MasterAdminService(session)
    data = await service.assign_school_admin(email=payload.email, school_id=payload.school_id)
    return APIResponse(data=data, message="school admin assigned")
