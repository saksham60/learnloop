from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.class_model import ClassStudent
from app.db.models.homework import Homework, StudentAttempt
from app.db.models.learning_event import LearningEvent


class AnalyticsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_class_analytics(self, class_id: UUID) -> dict:
        student_count = await self._session.scalar(
            select(func.count()).select_from(ClassStudent).where(ClassStudent.class_id == class_id)
        )
        homework_count = await self._session.scalar(
            select(func.count()).select_from(Homework).where(Homework.class_id == class_id)
        )
        return {
            "class_id": str(class_id),
            "student_count": int(student_count or 0),
            "homework_count": int(homework_count or 0),
        }

    async def get_weak_topics(self, class_id: UUID) -> list[dict]:
        attempts = await self._session.scalar(select(func.count()).select_from(StudentAttempt))
        return [{"class_id": str(class_id), "topic": "Foundations", "risk_score": int(attempts or 0)}]

    async def get_misconceptions(self, class_id: UUID) -> list[dict]:
        event_count = await self._session.scalar(select(func.count()).select_from(LearningEvent))
        return [
            {
                "class_id": str(class_id),
                "misconception": "Pattern needs review",
                "signal_count": int(event_count or 0),
            }
        ]

