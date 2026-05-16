from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import HomeworkStatus
from app.db.models.homework import Homework, HomeworkQuestion, StudentAttempt


class HomeworkRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_homework(self, homework: Homework) -> Homework:
        self._session.add(homework)
        await self._session.flush()
        return homework

    async def add_question(self, question: HomeworkQuestion) -> HomeworkQuestion:
        self._session.add(question)
        await self._session.flush()
        return question

    async def list_homework(self, *, limit: int = 50, offset: int = 0) -> list[Homework]:
        result = await self._session.execute(
            select(Homework)
            .options(selectinload(Homework.questions))
            .order_by(desc(Homework.created_at))
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_homework(self, homework_id: UUID) -> Homework | None:
        result = await self._session.execute(
            select(Homework)
            .where(Homework.id == homework_id)
            .options(selectinload(Homework.questions), selectinload(Homework.attempts))
        )
        return result.scalar_one_or_none()

    async def save_attempt(self, attempt: StudentAttempt) -> StudentAttempt:
        self._session.add(attempt)
        await self._session.flush()
        return attempt

    async def count_attempts(
        self,
        *,
        homework_id: UUID,
        student_id: UUID,
        question_id: UUID | None = None,
    ) -> int:
        statement = select(func.count()).select_from(StudentAttempt).where(
            StudentAttempt.homework_id == homework_id,
            StudentAttempt.student_id == student_id,
        )
        if question_id:
            statement = statement.where(StudentAttempt.question_id == question_id)
        count = await self._session.scalar(statement)
        return int(count or 0)

    async def get_latest_attempt(
        self,
        *,
        homework_id: UUID,
        student_id: UUID,
        question_id: UUID | None = None,
    ) -> StudentAttempt | None:
        statement = (
            select(StudentAttempt)
            .where(
                StudentAttempt.homework_id == homework_id,
                StudentAttempt.student_id == student_id,
            )
            .order_by(desc(StudentAttempt.created_at))
            .limit(1)
        )
        if question_id:
            statement = statement.where(StudentAttempt.question_id == question_id)
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def submit_homework(self, homework: Homework) -> Homework:
        homework.status = HomeworkStatus.SUBMITTED
        homework.metadata_json = {
            **homework.metadata_json,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
        }
        await self._session.flush()
        return homework

    async def get_analytics(self, homework_id: UUID) -> dict:
        total_attempts = await self._session.scalar(
            select(func.count()).select_from(StudentAttempt).where(StudentAttempt.homework_id == homework_id)
        )
        correct_attempts = await self._session.scalar(
            select(func.count())
            .select_from(StudentAttempt)
            .where(StudentAttempt.homework_id == homework_id, StudentAttempt.is_correct.is_(True))
        )
        return {
            "homework_id": str(homework_id),
            "total_attempts": int(total_attempts or 0),
            "correct_attempts": int(correct_attempts or 0),
        }

