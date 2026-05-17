from __future__ import annotations

from collections import defaultdict
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import CurrentUser
from app.core.constants import ApprovalStatus, Role
from app.core.exceptions import NotFoundError, RuleViolationError
from app.db.models.class_model import ClassRoom, ClassStudent
from app.db.models.relations import ParentStudentRelation, TeacherStudentRelation
from app.db.models.user import UserProfile
from app.db.repositories.relation_repository import RelationRepository
from app.db.repositories.school_repository import SchoolRepository
from app.db.repositories.user_repository import UserRepository


class SchoolAdminService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._users = UserRepository(session)
        self._relations = RelationRepository(session)
        self._schools = SchoolRepository(session)

    def _require_school_id(self, current_user: CurrentUser) -> UUID:
        if current_user.school_id is None:
            raise RuleViolationError("School admin account is not linked to a school.")
        return current_user.school_id

    @staticmethod
    def _serialize_profile(profile: UserProfile, **extra: Any) -> dict[str, Any]:
        return {
            "id": str(profile.id),
            "user_id": str(profile.id),
            "full_name": profile.full_name,
            "email": profile.email,
            "role": profile.role.value,
            "approval_status": profile.approval_status.value,
            "school_id": str(profile.school_id) if profile.school_id else None,
            "school_name": profile.school.name if profile.school else None,
            "grade_level": profile.grade_level,
            "avatar_url": profile.avatar_url,
            "reason": profile.approval_reason,
            "parent_request": (profile.approval_metadata or {}).get("parent_request"),
            "created_at": profile.created_at.isoformat(),
            **extra,
        }

    async def overview(self, current_user: CurrentUser) -> dict:
        school_id = self._require_school_id(current_user)
        users = await self._users.list_users(school_id=school_id)
        classes_result = await self._session.execute(select(ClassRoom).where(ClassRoom.school_id == school_id))
        classes = list(classes_result.scalars().all())
        teacher_student_relations = await self._relations.list_teacher_student_relations(school_id=school_id)
        parent_student_relations = await self._relations.list_parent_student_relations(school_id=school_id)

        return {
            "pending_approvals": sum(1 for user in users if user.approval_status == ApprovalStatus.PENDING_APPROVAL),
            "total_students": sum(1 for user in users if user.role == Role.STUDENT),
            "total_teachers": sum(1 for user in users if user.role == Role.TEACHER),
            "total_parents": sum(1 for user in users if user.role == Role.PARENT),
            "active_classes": len(classes),
            "teacher_student_relations": len(teacher_student_relations),
            "parent_student_relations": len(parent_student_relations),
        }

    async def list_approvals(
        self,
        current_user: CurrentUser,
        *,
        status: ApprovalStatus | None = None,
        search: str | None = None,
    ) -> list[dict]:
        school_id = self._require_school_id(current_user)
        statuses = [status] if status else [ApprovalStatus.PENDING_APPROVAL, ApprovalStatus.REJECTED]
        users = await self._users.list_users(
            school_id=school_id,
            roles=[Role.TEACHER, Role.PARENT],
            approval_statuses=statuses,
            search=search,
        )
        return [self._serialize_profile(user, requested_role=user.role.value, status=user.approval_status.value) for user in users]

    async def list_users(self, current_user: CurrentUser, *, search: str | None = None) -> list[dict]:
        school_id = self._require_school_id(current_user)
        users = await self._users.list_users(school_id=school_id, search=search)
        return [self._serialize_profile(user, status=user.approval_status.value) for user in users]

    async def approve_request(self, current_user: CurrentUser, request_id: UUID, role: Role) -> dict:
        school_id = self._require_school_id(current_user)
        profile = await self._users.get_by_id(request_id)
        if profile is None or profile.school_id != school_id:
            raise NotFoundError("Approval request not found.")
        if role not in {Role.TEACHER, Role.PARENT}:
            raise RuleViolationError("School admin can only approve teacher or parent requests.")

        profile.role = role
        profile.approval_status = ApprovalStatus.ACTIVE
        profile.approval_reason = None
        await self._session.commit()
        return self._serialize_profile(profile)

    async def reject_request(self, current_user: CurrentUser, request_id: UUID, reason: str | None) -> dict:
        school_id = self._require_school_id(current_user)
        profile = await self._users.get_by_id(request_id)
        if profile is None or profile.school_id != school_id:
            raise NotFoundError("Approval request not found.")

        profile.approval_status = ApprovalStatus.REJECTED
        profile.approval_reason = reason
        await self._session.commit()
        return self._serialize_profile(profile)

    async def list_students(self, current_user: CurrentUser, *, search: str | None = None) -> list[dict]:
        school_id = self._require_school_id(current_user)
        users = await self._users.list_users(school_id=school_id, roles=[Role.STUDENT], search=search)
        class_result = await self._session.execute(
            select(ClassStudent).where(ClassStudent.student_id.in_([user.id for user in users] or [UUID(int=0)]))
        )
        class_memberships = list(class_result.scalars().all())
        teacher_relations = await self._relations.list_teacher_student_relations(school_id=school_id)
        parent_relations = await self._relations.list_parent_student_relations(school_id=school_id)

        student_classes: dict[UUID, UUID] = {}
        for membership in class_memberships:
            student_classes.setdefault(membership.student_id, membership.class_id)

        class_names: dict[UUID, str] = {}
        if student_classes:
            class_name_result = await self._session.execute(
                select(ClassRoom).where(ClassRoom.id.in_(list(student_classes.values())))
            )
            class_names = {classroom.id: classroom.name for classroom in class_name_result.scalars().all()}

        teacher_counts: dict[UUID, set[UUID]] = defaultdict(set)
        for relation in teacher_relations:
            teacher_counts[relation.student_id].add(relation.teacher_id)

        parent_counts: dict[UUID, set[UUID]] = defaultdict(set)
        for relation in parent_relations:
            parent_counts[relation.student_id].add(relation.parent_id)

        return [
            self._serialize_profile(
                user,
                class_name=class_names.get(student_classes.get(user.id)),
                assigned_teachers_count=len(teacher_counts[user.id]),
                linked_parents_count=len(parent_counts[user.id]),
                status=user.approval_status.value,
                last_active=user.updated_at.isoformat(),
            )
            for user in users
        ]

    async def list_teachers(self, current_user: CurrentUser, *, search: str | None = None) -> list[dict]:
        school_id = self._require_school_id(current_user)
        users = await self._users.list_users(school_id=school_id, roles=[Role.TEACHER], search=search)
        class_result = await self._session.execute(
            select(ClassRoom).where(ClassRoom.teacher_id.in_([user.id for user in users] or [UUID(int=0)])).options(selectinload(ClassRoom.subject))
        )
        classes = list(class_result.scalars().all())
        relations = await self._relations.list_teacher_student_relations(school_id=school_id)

        classes_by_teacher: dict[UUID, list[str]] = defaultdict(list)
        for classroom in classes:
            classes_by_teacher[classroom.teacher_id].append(classroom.name)

        students_by_teacher: dict[UUID, set[UUID]] = defaultdict(set)
        for relation in relations:
            students_by_teacher[relation.teacher_id].add(relation.student_id)

        return [
            self._serialize_profile(
                user,
                subjects_or_classes=classes_by_teacher[user.id],
                assigned_students_count=len(students_by_teacher[user.id]),
                status=user.approval_status.value,
            )
            for user in users
        ]

    async def list_parents(self, current_user: CurrentUser, *, search: str | None = None) -> list[dict]:
        school_id = self._require_school_id(current_user)
        users = await self._users.list_users(school_id=school_id, roles=[Role.PARENT], search=search)
        relations = await self._relations.list_parent_student_relations(school_id=school_id)
        linked_students: dict[UUID, set[UUID]] = defaultdict(set)
        for relation in relations:
            linked_students[relation.parent_id].add(relation.student_id)

        return [
            self._serialize_profile(
                user,
                linked_students_count=len(linked_students[user.id]),
                status=user.approval_status.value,
            )
            for user in users
        ]

    async def list_classes(self, current_user: CurrentUser) -> list[dict]:
        school_id = self._require_school_id(current_user)
        result = await self._session.execute(
            select(ClassRoom)
            .where(ClassRoom.school_id == school_id)
            .options(selectinload(ClassRoom.teacher), selectinload(ClassRoom.subject), selectinload(ClassRoom.students))
        )
        classes = list(result.scalars().all())
        return [
            {
                "id": str(classroom.id),
                "name": classroom.name,
                "code": classroom.code,
                "grade_level": classroom.grade_level,
                "teacher_name": classroom.teacher.full_name if classroom.teacher else None,
                "subject": classroom.subject.name if classroom.subject else None,
                "student_count": len(classroom.students),
                "teachers_count": 1 if classroom.teacher_id else 0,
                "pending_homework_count": 0,
                "weak_topics_summary": "This feature is being connected to the backend.",
            }
            for classroom in classes
        ]

    async def create_class(
        self,
        current_user: CurrentUser,
        *,
        name: str,
        code: str,
        grade_level: str | None = None,
        teacher_id: UUID | None = None,
        subject_id: UUID | None = None,
    ) -> dict:
        school_id = self._require_school_id(current_user)
        classroom = ClassRoom(
            school_id=school_id,
            subject_id=subject_id,
            teacher_id=teacher_id,
            name=name,
            code=code,
            grade_level=grade_level,
        )
        self._session.add(classroom)
        await self._session.commit()
        return {"id": str(classroom.id), "name": classroom.name, "code": classroom.code}

    async def list_relations(self, current_user: CurrentUser) -> dict:
        school_id = self._require_school_id(current_user)
        teacher_student = await self._relations.list_teacher_student_relations(school_id=school_id)
        parent_student = await self._relations.list_parent_student_relations(school_id=school_id)
        return {
            "teacher_students": [
                {
                    "teacher_id": str(relation.teacher_id),
                    "teacher_name": relation.teacher.full_name if relation.teacher else None,
                    "student_id": str(relation.student_id),
                    "student_name": relation.student.full_name if relation.student else None,
                    "class_id": str(relation.class_id) if relation.class_id else None,
                    "class_name": relation.classroom.name if relation.classroom else None,
                    "subject_id": str(relation.subject_id) if relation.subject_id else None,
                    "subject_name": relation.subject.name if relation.subject else None,
                }
                for relation in teacher_student
            ],
            "parent_students": [
                {
                    "parent_id": str(relation.parent_id),
                    "parent_name": relation.parent.full_name if relation.parent else None,
                    "student_id": str(relation.student_id),
                    "student_name": relation.student.full_name if relation.student else None,
                    "relationship": relation.relationship_type,
                }
                for relation in parent_student
            ],
        }

    async def assign_teacher_students(
        self,
        current_user: CurrentUser,
        *,
        teacher_id: UUID,
        student_ids: list[UUID],
        class_id: UUID | None = None,
        subject_id: UUID | None = None,
    ) -> dict:
        school_id = self._require_school_id(current_user)
        await self._relations.add_teacher_student_relations(
            school_id=school_id,
            teacher_id=teacher_id,
            student_ids=student_ids,
            class_id=class_id,
            subject_id=subject_id,
        )
        await self._session.commit()
        return {"teacher_id": str(teacher_id), "student_ids": [str(item) for item in student_ids]}

    async def remove_teacher_students(
        self,
        *,
        teacher_id: UUID,
        student_ids: list[UUID],
    ) -> dict:
        await self._relations.remove_teacher_student_relations(
            teacher_id=teacher_id,
            student_ids=student_ids,
        )
        await self._session.commit()
        return {"teacher_id": str(teacher_id), "student_ids": [str(item) for item in student_ids]}

    async def assign_parent_students(
        self,
        current_user: CurrentUser,
        *,
        parent_id: UUID,
        student_ids: list[UUID],
        relationship_type: str | None = None,
    ) -> dict:
        school_id = self._require_school_id(current_user)
        await self._relations.add_parent_student_relations(
            school_id=school_id,
            parent_id=parent_id,
            student_ids=student_ids,
            relationship_type=relationship_type,
        )
        await self._session.commit()
        return {"parent_id": str(parent_id), "student_ids": [str(item) for item in student_ids]}

    async def remove_parent_students(
        self,
        *,
        parent_id: UUID,
        student_ids: list[UUID],
    ) -> dict:
        await self._relations.remove_parent_student_relations(parent_id=parent_id, student_ids=student_ids)
        await self._session.commit()
        return {"parent_id": str(parent_id), "student_ids": [str(item) for item in student_ids]}
