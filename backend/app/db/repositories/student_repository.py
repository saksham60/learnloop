from __future__ import annotations

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.focus_area import FocusArea
from app.db.models.homework import Homework, StudentAttempt
from app.db.models.learning_event import LearningEvent
from app.db.models.user import UserProfile


class StudentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_student(self, student_id):
        result = await self._session.execute(select(UserProfile).where(UserProfile.id == student_id))
        return result.scalar_one_or_none()

    async def get_dashboard(self, student_id) -> dict:
        pending_homework = await self._session.scalar(select(func.count()).select_from(Homework))
        active_focus = await self._session.scalar(
            select(func.count()).select_from(FocusArea).where(FocusArea.student_id == student_id)
        )
        recent_attempts = await self._session.scalar(
            select(func.count()).select_from(StudentAttempt).where(StudentAttempt.student_id == student_id)
        )
        return {
            "pending_homework_count": pending_homework or 0,
            "active_focus_count": active_focus or 0,
            "recent_attempts_count": recent_attempts or 0,
        }

    async def list_events(self, student_id, *, limit: int = 50, offset: int = 0) -> list[LearningEvent]:
        result = await self._session.execute(
            select(LearningEvent)
            .where(LearningEvent.student_id == student_id)
            .order_by(desc(LearningEvent.created_at))
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_focus(self, student_id) -> list[FocusArea]:
        result = await self._session.execute(
            select(FocusArea)
            .where(FocusArea.student_id == student_id)
            .options(selectinload(FocusArea.topic))
            .order_by(desc(FocusArea.score))
        )
        return list(result.scalars().all())

