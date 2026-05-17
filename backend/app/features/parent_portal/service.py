from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.exceptions import NotFoundError, RuleViolationError
from app.db.repositories.request_repository import RequestRepository
from app.db.repositories.school_repository import SchoolRepository


class ParentPortalService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._requests = RequestRepository(session)
        self._schools = SchoolRepository(session)

    @staticmethod
    def _serialize_request(request) -> dict:
        return {
            "id": str(request.id),
            "parent_id": str(request.parent_id),
            "parent_name": request.parent.full_name if request.parent else None,
            "parent_email": request.parent.email if request.parent else None,
            "school_id": str(request.school_id),
            "school_name": request.school.name if request.school else None,
            "child_name": request.child_name,
            "child_email": request.child_email,
            "child_class": request.child_class,
            "child_section": request.child_section,
            "relationship": request.relationship_type,
            "message": request.message,
            "status": request.status,
            "rejection_reason": request.rejection_reason,
            "created_at": request.created_at.isoformat(),
        }

    async def list_child_requests(self, current_user: CurrentUser) -> list[dict]:
        if current_user.user_id is None:
            raise RuleViolationError("Parent account is not linked to a profile.")
        requests = await self._requests.list_parent_child_access_requests(parent_id=current_user.user_id)
        return [self._serialize_request(request) for request in requests]

    async def create_child_request(
        self,
        current_user: CurrentUser,
        *,
        school_id: UUID,
        child_name: str,
        child_email: str | None = None,
        child_class: str | None = None,
        child_section: str | None = None,
        relationship: str,
        message: str | None = None,
    ) -> dict:
        if current_user.user_id is None:
            raise RuleViolationError("Parent account is not linked to a profile.")
        if current_user.school_id is None:
            raise RuleViolationError("Select a school before requesting child access.")
        if current_user.school_id != school_id:
            raise RuleViolationError("Parent child requests must use the school already linked to this parent account.")
        school = await self._schools.get_by_id(school_id)
        if school is None:
            raise NotFoundError("Selected school was not found.")

        request = await self._requests.create_parent_child_access_request(
            parent_id=current_user.user_id,
            school_id=school_id,
            child_name=child_name,
            child_email=child_email,
            child_class=child_class,
            child_section=child_section,
            relationship_type=relationship,
            message=message,
        )
        await self._session.commit()
        request = await self._requests.get_parent_child_access_request(request.id)
        assert request is not None
        return self._serialize_request(request)
