from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import SessionDep, get_token_subject
from app.api.v1.responses import APIResponse
from app.api.v1.schools.schemas import SchoolRegistrationPayload
from app.features.schools.service import SchoolService

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("", response_model=APIResponse[list[dict]])
async def list_schools(
    session: SessionDep,
    q: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    service = SchoolService(session)
    return APIResponse(data=await service.list_schools(search=q))


@router.get("/search", response_model=APIResponse[list[dict]])
async def search_schools(
    session: SessionDep,
    q: str | None = Query(default=None),
) -> APIResponse[list[dict]]:
    service = SchoolService(session)
    return APIResponse(data=await service.list_schools(search=q))


@router.post("/register", response_model=APIResponse[dict])
async def register_school(
    payload: SchoolRegistrationPayload,
    session: SessionDep,
    subject=Depends(get_token_subject),
) -> APIResponse[dict]:
    service = SchoolService(session)
    data = await service.register_school_request(
        subject,
        school_name=payload.school_name,
        school_code=payload.school_code,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        contact_email=payload.contact_email,
        contact_person_name=payload.contact_person_name,
        contact_phone=payload.contact_phone,
        message=payload.message,
    )
    return APIResponse(data=data, message="school registration submitted")
