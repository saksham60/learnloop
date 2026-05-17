from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.request import ParentChildAccessRequest, SchoolRegistrationRequest


class RequestRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_school_registration_request(
        self,
        *,
        requester_supabase_user_id: str,
        requester_email: str,
        school_name: str,
        school_code: str | None = None,
        city: str | None = None,
        state: str | None = None,
        country: str | None = None,
        contact_email: str,
        contact_person_name: str,
        contact_phone: str | None = None,
        message: str | None = None,
    ) -> SchoolRegistrationRequest:
        request = SchoolRegistrationRequest(
            requester_supabase_user_id=requester_supabase_user_id,
            requester_email=requester_email,
            school_name=school_name,
            school_code=school_code,
            city=city,
            state=state,
            country=country,
            contact_email=contact_email,
            contact_person_name=contact_person_name,
            contact_phone=contact_phone,
            message=message,
            status="pending_review",
        )
        self._session.add(request)
        await self._session.flush()
        return request

    async def create_parent_child_access_request(
        self,
        *,
        parent_id: UUID,
        school_id: UUID,
        child_name: str,
        child_email: str | None = None,
        child_class: str | None = None,
        child_section: str | None = None,
        relationship_type: str,
        message: str | None = None,
    ) -> ParentChildAccessRequest:
        request = ParentChildAccessRequest(
            parent_id=parent_id,
            school_id=school_id,
            child_name=child_name,
            child_email=child_email,
            child_class=child_class,
            child_section=child_section,
            relationship_type=relationship_type,
            message=message,
            status="pending_approval",
        )
        self._session.add(request)
        await self._session.flush()
        return request

    async def get_parent_child_access_request(self, request_id: UUID) -> ParentChildAccessRequest | None:
        result = await self._session.execute(
            select(ParentChildAccessRequest)
            .where(ParentChildAccessRequest.id == request_id)
            .options(
                selectinload(ParentChildAccessRequest.parent),
                selectinload(ParentChildAccessRequest.school),
                selectinload(ParentChildAccessRequest.approved_student),
            )
        )
        return result.scalar_one_or_none()

    async def list_parent_child_access_requests(
        self,
        *,
        parent_id: UUID | None = None,
        school_id: UUID | None = None,
    ) -> list[ParentChildAccessRequest]:
        statement = (
            select(ParentChildAccessRequest)
            .options(
                selectinload(ParentChildAccessRequest.parent),
                selectinload(ParentChildAccessRequest.school),
                selectinload(ParentChildAccessRequest.approved_student),
            )
            .order_by(ParentChildAccessRequest.created_at.desc())
        )
        if parent_id is not None:
            statement = statement.where(ParentChildAccessRequest.parent_id == parent_id)
        if school_id is not None:
            statement = statement.where(ParentChildAccessRequest.school_id == school_id)
        result = await self._session.execute(statement)
        return list(result.scalars().all())
