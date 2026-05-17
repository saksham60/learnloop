from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import LearningSessionState
from app.core.time import utcnow_naive
from app.db.models.learning_session import LearningSession


class LearningSessionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, session_id: UUID) -> LearningSession | None:
        result = await self._session.execute(
            select(LearningSession).where(LearningSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        session_id: UUID,
        student_id: UUID,
        school_id: UUID | None,
        session_type: str = "learning",
    ) -> LearningSession:
        session = LearningSession(
            id=session_id,
            school_id=school_id,
            student_id=student_id,
            session_type=session_type,
            state=LearningSessionState.ACTIVE,
            metadata_json={},
            started_at=utcnow_naive(),
            ended_at=None,
        )
        self._session.add(session)
        await self._session.flush()
        return session
