from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import Role
from app.core.exceptions import NotFoundError, RuleViolationError
from app.db.repositories.relation_repository import RelationRepository
from app.db.repositories.request_repository import RequestRepository
from app.db.repositories.user_repository import UserRepository


class SchoolPortalService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._requests = RequestRepository(session)
        self._relations = RelationRepository(session)
        self._users = UserRepository(session)

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

    @staticmethod
    def _require_school_id(current_user: CurrentUser) -> UUID:
        if current_user.school_id is None:
            raise RuleViolationError("School account is not linked to a school.")
        return current_user.school_id

    @staticmethod
    def _normalize_class_name(value: str | None) -> str | None:
        if value is None:
            return None
        return value.lower().replace("class", "").replace("grade", "").replace(" ", "")

    async def _resolve_student_id(
        self,
        *,
        school_id: UUID,
        request,
        student_id: UUID | None = None,
    ) -> UUID:
        if student_id is not None:
            student = await self._users.get_by_id(student_id)
            if student is None or student.school_id != school_id or student.role != Role.STUDENT:
                raise NotFoundError("Selected student was not found in this school.")
            return student.id

        students = await self._users.list_users(school_id=school_id, roles=[Role.STUDENT])
        if request.child_email:
            for student in students:
                if student.email.lower() == request.child_email.lower():
                    return student.id

        requested_class = self._normalize_class_name(request.child_class)
        matches = [
            student
            for student in students
            if student.full_name.lower() == request.child_name.lower()
            and (
                requested_class is None
                or self._normalize_class_name(student.grade_level) == requested_class
            )
        ]
        if len(matches) == 1:
            return matches[0].id

        raise RuleViolationError("No matching student was found for this child request.")

    async def list_child_requests(self, current_user: CurrentUser) -> list[dict]:
        school_id = self._require_school_id(current_user)
        requests = await self._requests.list_parent_child_access_requests(school_id=school_id)
        return [self._serialize_request(request) for request in requests]

    async def approve_child_request(
        self,
        current_user: CurrentUser,
        request_id: UUID,
        *,
        student_id: UUID | None = None,
    ) -> dict:
        school_id = self._require_school_id(current_user)
        request = await self._requests.get_parent_child_access_request(request_id)
        if request is None or request.school_id != school_id:
            raise NotFoundError("Child access request not found.")

        resolved_student_id = await self._resolve_student_id(
            school_id=school_id,
            request=request,
            student_id=student_id,
        )

        existing_relations = await self._relations.list_parent_student_relations(school_id=school_id)
        if not any(
            relation.parent_id == request.parent_id and relation.student_id == resolved_student_id
            for relation in existing_relations
        ):
            await self._relations.add_parent_student_relations(
                school_id=school_id,
                parent_id=request.parent_id,
                student_ids=[resolved_student_id],
                relationship_type=request.relationship_type,
            )

        request.status = "approved"
        request.rejection_reason = None
        request.approved_student_id = resolved_student_id
        await self._session.commit()
        request = await self._requests.get_parent_child_access_request(request.id)
        assert request is not None
        return self._serialize_request(request)

    async def reject_child_request(
        self,
        current_user: CurrentUser,
        request_id: UUID,
        *,
        reason: str | None = None,
    ) -> dict:
        school_id = self._require_school_id(current_user)
        request = await self._requests.get_parent_child_access_request(request_id)
        if request is None or request.school_id != school_id:
            raise NotFoundError("Child access request not found.")

        request.status = "rejected"
        request.rejection_reason = reason
        await self._session.commit()
        request = await self._requests.get_parent_child_access_request(request.id)
        assert request is not None
        return self._serialize_request(request)
