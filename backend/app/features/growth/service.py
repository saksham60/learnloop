from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import EventType, GrowthActivityStatus
from app.core.exceptions import NotFoundError, RuleViolationError
from app.db.models.growth import GrowthActivity
from app.db.repositories.event_repository import EventRepository
from app.features.growth.safety_rules import GrowthSafetyRules


class GrowthService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._events = EventRepository(session)
        self._rules = GrowthSafetyRules()

    async def create_activity(
        self,
        current_user: CurrentUser,
        *,
        activity_type: str,
        title: str,
        description: str | None,
    ) -> dict:
        if not self._rules.is_activity_allowed(activity_type):
            raise RuleViolationError("Growth activity type is not allowed.")
        activity = GrowthActivity(
            school_id=current_user.school_id,
            student_id=current_user.user_id,
            activity_type=activity_type,
            title=title,
            description=description,
            status=GrowthActivityStatus.SUGGESTED,
            metadata_json={},
        )
        self._session.add(activity)
        await self._session.commit()
        return {"id": str(activity.id), "title": activity.title, "status": activity.status.value}

    async def list_activities(self, current_user: CurrentUser) -> list[dict]:
        result = await self._session.execute(
            select(GrowthActivity).where(GrowthActivity.student_id == current_user.user_id)
        )
        activities = list(result.scalars().all())
        return [
            {
                "id": str(activity.id),
                "title": activity.title,
                "activity_type": activity.activity_type,
                "status": activity.status.value,
            }
            for activity in activities
        ]

    async def complete_activity(self, current_user: CurrentUser, activity_id) -> dict:
        activity = await self._session.get(GrowthActivity, activity_id)
        if activity is None or activity.student_id != current_user.user_id:
            raise NotFoundError("Growth activity not found.")
        activity.status = GrowthActivityStatus.COMPLETED
        activity.completed_at = datetime.now(timezone.utc)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            event_type=EventType.GROWTH_ACTIVITY_COMPLETED,
            payload={"activity_id": str(activity.id), "activity_type": activity.activity_type},
        )
        await self._session.commit()
        return {"id": str(activity.id), "status": activity.status.value}

