from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.responses import APIResponse
from app.api.v1.school_admin.schemas import (
    ApprovalActionPayload,
    CreateClassPayload,
    ParentStudentsPayload,
    RejectApprovalPayload,
    TeacherStudentsPayload,
)
from app.core.constants import ApprovalStatus, Role
from app.features.auth.permissions import ensure_role
from app.features.school_admin.service import SchoolAdminService

router = APIRouter(prefix="/school-admin", tags=["school-admin"])


@router.get("/overview", response_model=APIResponse[dict])
async def school_admin_overview(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.overview(current_user))


@router.get("/approvals", response_model=APIResponse[list[dict]])
async def list_approval_requests(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    status: ApprovalStatus | None = Query(default=None),
    search: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_approvals(current_user, status=status, search=search))


@router.get("/users", response_model=APIResponse[list[dict]])
async def list_school_users(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    search: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_users(current_user, search=search))


@router.post("/approvals/{request_id}/approve", response_model=APIResponse[dict])
async def approve_request(
    request_id: UUID,
    payload: ApprovalActionPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.approve_request(current_user, request_id, payload.role)
    return APIResponse(data=data, message="approval completed")


@router.post("/approvals/{request_id}/reject", response_model=APIResponse[dict])
async def reject_request(
    request_id: UUID,
    payload: RejectApprovalPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.reject_request(current_user, request_id, payload.reason)
    return APIResponse(data=data, message="approval rejected")


@router.get("/students", response_model=APIResponse[list[dict]])
async def list_students(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    search: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_students(current_user, search=search))


@router.get("/teachers", response_model=APIResponse[list[dict]])
async def list_teachers(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    search: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_teachers(current_user, search=search))


@router.get("/parents", response_model=APIResponse[list[dict]])
async def list_parents(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    search: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_parents(current_user, search=search))


@router.get("/classes", response_model=APIResponse[list[dict]])
async def list_classes(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_classes(current_user))


@router.post("/classes", response_model=APIResponse[dict])
async def create_class(
    payload: CreateClassPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.create_class(
        current_user,
        name=payload.name,
        code=payload.code,
        grade_level=payload.grade_level,
        teacher_id=payload.teacher_id,
        subject_id=payload.subject_id,
    )
    return APIResponse(data=data, message="class created")


@router.get("/relations", response_model=APIResponse[dict])
async def list_relations(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    return APIResponse(data=await service.list_relations(current_user))


@router.post("/relations/teacher-students", response_model=APIResponse[dict])
async def assign_teacher_students(
    payload: TeacherStudentsPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.assign_teacher_students(
        current_user,
        teacher_id=payload.teacher_id,
        student_ids=payload.student_ids,
        class_id=payload.class_id,
        subject_id=payload.subject_id,
    )
    return APIResponse(data=data, message="teacher-student relations assigned")


@router.delete("/relations/teacher-students", response_model=APIResponse[dict])
async def remove_teacher_students(
    payload: TeacherStudentsPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.remove_teacher_students(
        teacher_id=payload.teacher_id,
        student_ids=payload.student_ids,
    )
    return APIResponse(data=data, message="teacher-student relations removed")


@router.post("/relations/parent-students", response_model=APIResponse[dict])
async def assign_parent_students(
    payload: ParentStudentsPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.assign_parent_students(
        current_user,
        parent_id=payload.parent_id,
        student_ids=payload.student_ids,
        relationship_type=payload.relationship,
    )
    return APIResponse(data=data, message="parent-student relations assigned")


@router.delete("/relations/parent-students", response_model=APIResponse[dict])
async def remove_parent_students(
    payload: ParentStudentsPayload,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.SCHOOL_ADMIN)
    service = SchoolAdminService(session)
    data = await service.remove_parent_students(
        parent_id=payload.parent_id,
        student_ids=payload.student_ids,
    )
    return APIResponse(data=data, message="parent-student relations removed")
