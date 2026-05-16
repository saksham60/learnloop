from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.analytics_repository import AnalyticsRepository
from app.features.analytics.teacher_insights import TeacherInsightsBuilder


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self._analytics = AnalyticsRepository(session)
        self._insights = TeacherInsightsBuilder()

    async def build_teacher_insight(self, class_id: UUID) -> dict:
        analytics = await self._analytics.get_class_analytics(class_id)
        weak_topics = await self._analytics.get_weak_topics(class_id)
        misconceptions = await self._analytics.get_misconceptions(class_id)
        return self._insights.build_summary(analytics, weak_topics, misconceptions)

