from __future__ import annotations

from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import EventType, SyncStatus
from app.core.time import utcnow_naive
from app.db.models.learning_event import LearningEvent


class EventRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_event(
        self,
        *,
        student_id: UUID,
        event_type: EventType,
        school_id: UUID | None = None,
        session_id: UUID | None = None,
        subject_id: UUID | None = None,
        topic_id: UUID | None = None,
        homework_id: UUID | None = None,
        payload: dict | None = None,
        device_id: str | None = None,
        sync_status: SyncStatus = SyncStatus.SYNCED,
    ) -> LearningEvent:
        event = LearningEvent(
            school_id=school_id,
            student_id=student_id,
            session_id=session_id,
            event_type=event_type,
            subject_id=subject_id,
            topic_id=topic_id,
            homework_id=homework_id,
            payload=payload or {},
            device_id=device_id,
            sync_status=sync_status,
            created_at=utcnow_naive(),
        )
        self._session.add(event)
        await self._session.flush()
        return event

    async def list_student_events(
        self,
        student_id: UUID,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> list[LearningEvent]:
        result = await self._session.execute(
            select(LearningEvent)
            .where(LearningEvent.student_id == student_id)
            .order_by(desc(LearningEvent.created_at))
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_session_events(
        self,
        *,
        student_id: UUID,
        session_id: UUID,
        limit: int = 12,
    ) -> list[LearningEvent]:
        result = await self._session.execute(
            select(LearningEvent)
            .where(
                LearningEvent.student_id == student_id,
                LearningEvent.session_id == session_id,
            )
            .order_by(desc(LearningEvent.created_at))
            .limit(limit)
        )
        return list(reversed(list(result.scalars().all())))
