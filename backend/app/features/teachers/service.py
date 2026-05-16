from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.analytics_repository import AnalyticsRepository
from app.db.repositories.teacher_repository import TeacherRepository


class TeacherService:
    def __init__(self, session: AsyncSession) -> None:
        self._teachers = TeacherRepository(session)
        self._analytics = AnalyticsRepository(session)

    async def list_classes(self, teacher_id) -> list[dict]:
        classes = await self._teachers.list_teacher_classes(teacher_id)
        return [
            {
                "id": str(classroom.id),
                "name": classroom.name,
                "code": classroom.code,
                "grade_level": classroom.grade_level,
                "subject": classroom.subject.name if classroom.subject else None,
                "student_count": len(classroom.students),
            }
            for classroom in classes
        ]

    async def get_class_analytics(self, class_id: UUID) -> dict:
        return await self._analytics.get_class_analytics(class_id)

    async def get_weak_topics(self, class_id: UUID) -> list[dict]:
        return await self._analytics.get_weak_topics(class_id)

    async def get_misconceptions(self, class_id: UUID) -> list[dict]:
        return await self._analytics.get_misconceptions(class_id)

