from __future__ import annotations

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.relations import ParentStudentRelation, TeacherStudentRelation


class RelationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_teacher_student_relations(self, *, school_id: UUID) -> list[TeacherStudentRelation]:
        result = await self._session.execute(
            select(TeacherStudentRelation)
            .where(TeacherStudentRelation.school_id == school_id)
            .options(
                selectinload(TeacherStudentRelation.teacher),
                selectinload(TeacherStudentRelation.student),
                selectinload(TeacherStudentRelation.classroom),
                selectinload(TeacherStudentRelation.subject),
            )
        )
        return list(result.scalars().all())

    async def add_teacher_student_relations(
        self,
        *,
        school_id: UUID,
        teacher_id: UUID,
        student_ids: list[UUID],
        class_id: UUID | None = None,
        subject_id: UUID | None = None,
    ) -> list[TeacherStudentRelation]:
        created: list[TeacherStudentRelation] = []
        for student_id in student_ids:
            relation = TeacherStudentRelation(
                school_id=school_id,
                teacher_id=teacher_id,
                student_id=student_id,
                class_id=class_id,
                subject_id=subject_id,
            )
            self._session.add(relation)
            created.append(relation)
        await self._session.flush()
        return created

    async def remove_teacher_student_relations(self, *, teacher_id: UUID, student_ids: list[UUID]) -> None:
        await self._session.execute(
            delete(TeacherStudentRelation).where(
                TeacherStudentRelation.teacher_id == teacher_id,
                TeacherStudentRelation.student_id.in_(student_ids),
            )
        )

    async def list_parent_student_relations(self, *, school_id: UUID) -> list[ParentStudentRelation]:
        result = await self._session.execute(
            select(ParentStudentRelation)
            .where(ParentStudentRelation.school_id == school_id)
            .options(
                selectinload(ParentStudentRelation.parent),
                selectinload(ParentStudentRelation.student),
            )
        )
        return list(result.scalars().all())

    async def add_parent_student_relations(
        self,
        *,
        school_id: UUID,
        parent_id: UUID,
        student_ids: list[UUID],
        relationship_type: str | None = None,
    ) -> list[ParentStudentRelation]:
        created: list[ParentStudentRelation] = []
        for student_id in student_ids:
            relation = ParentStudentRelation(
                school_id=school_id,
                parent_id=parent_id,
                student_id=student_id,
                relationship_type=relationship_type,
            )
            self._session.add(relation)
            created.append(relation)
        await self._session.flush()
        return created

    async def remove_parent_student_relations(self, *, parent_id: UUID, student_ids: list[UUID]) -> None:
        await self._session.execute(
            delete(ParentStudentRelation).where(
                ParentStudentRelation.parent_id == parent_id,
                ParentStudentRelation.student_id.in_(student_ids),
            )
        )
