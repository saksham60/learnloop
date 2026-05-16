from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import SessionDep, get_authenticated_user
from app.api.v1.content.schemas import ContentProcessRequest, ContentUploadRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.auth.permissions import ensure_role
from app.features.content.service import ContentService

router = APIRouter(prefix="/content", tags=["content"])


@router.post("/upload", response_model=APIResponse[dict])
async def upload_content(
    payload: ContentUploadRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = ContentService(session)
    data = await service.upload(
        current_user=current_user,
        filename=payload.filename,
        content_type=payload.content_type,
        storage_path=payload.storage_path,
    )
    return APIResponse(data=data, message="content uploaded")


@router.get("", response_model=APIResponse[list[dict]])
async def list_content(
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = ContentService(session)
    return APIResponse(data=await service.list_uploads(limit=limit, offset=offset))


@router.post("/{content_id}/process", response_model=APIResponse[dict])
async def process_content(
    content_id: UUID,
    payload: ContentProcessRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = ContentService(session)
    raw_bytes = (payload.raw_text or "").encode("utf-8")
    return APIResponse(data=await service.process(content_id, raw_bytes=raw_bytes), message="content processed")


@router.get("/{content_id}/chunks", response_model=APIResponse[list[dict]])
async def get_chunks(
    content_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_role(current_user, Role.TEACHER, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
    service = ContentService(session)
    return APIResponse(data=await service.chunks(content_id))
