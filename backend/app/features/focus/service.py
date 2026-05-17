from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import EventType, FocusAreaStatus
from app.core.time import utcnow_naive
from app.db.models.focus_area import FocusArea
from app.db.repositories.event_repository import EventRepository
from app.db.repositories.focus_repository import FocusRepository
from app.features.focus.focus_scoring_engine import FocusInput, FocusScoringEngine
from app.llm.gateway import LLMGateway


class FocusService:
    def __init__(self, session: AsyncSession, llm_gateway: LLMGateway) -> None:
        self._session = session
        self._focus = FocusRepository(session)
        self._events = EventRepository(session)
        self._engine = FocusScoringEngine()
        self._llm_gateway = llm_gateway

    async def get_today_focus(self, current_user: CurrentUser) -> list[dict]:
        focus_areas = await self._focus.list_student_focus(current_user.user_id)
        return [
            {
                "id": str(area.id),
                "title": area.title,
                "description": area.description,
                "score": area.score,
                "recommended_action": area.recommended_action,
            }
            for area in focus_areas
        ]

    async def refresh_focus(self, current_user: CurrentUser) -> list[dict]:
        events = await self._events.list_student_events(current_user.user_id, limit=100, offset=0)
        grouped: dict[tuple[str, str], FocusInput] = {}
        for event in events:
            subject = str(event.subject_id) if event.subject_id else "general"
            topic = str(event.topic_id) if event.topic_id else event.event_type.value
            key = (subject, topic)
            current = grouped.setdefault(key, FocusInput(subject=subject, topic=topic))
            if event.event_type == EventType.ATTEMPT_SUBMITTED:
                current.wrong_attempts += int(not event.payload.get("is_correct", False))
            if event.event_type == EventType.HINT_REQUESTED:
                current.hints_used += 1
            if event.event_type == EventType.GROWTH_ACTIVITY_COMPLETED:
                current.missed_activity = False

        scored = self._engine.score(list(grouped.values()), now=datetime.now(timezone.utc))
        persisted = [
            FocusArea(
                school_id=current_user.school_id,
                student_id=current_user.user_id,
                title=f"{item.subject}:{item.topic}",
                description=None,
                score=item.score,
                status=FocusAreaStatus.ACTIVE,
                recommended_action="Review the latest mistakes and practice one targeted question.",
                rationale={"drivers": item.drivers},
                last_evaluated_at=utcnow_naive(),
            )
            for item in scored[:5]
        ]
        await self._focus.replace_student_focus(current_user.user_id, persisted)

        if persisted:
            explanation = await self._llm_gateway.explain_focus_area(
                "\n".join(
                    [
                        f"{item.title} score={item.score} drivers={item.rationale['drivers']}"
                        for item in persisted
                    ]
                )
            )
            persisted[0].description = explanation

        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            event_type=EventType.FOCUS_REFRESHED,
            payload={"focus_count": len(persisted)},
        )
        await self._session.commit()
        return await self.get_today_focus(current_user)
