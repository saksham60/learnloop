from __future__ import annotations

from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.focus_area import FocusArea


class FocusRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_student_focus(self, student_id) -> list[FocusArea]:
        result = await self._session.execute(
            select(FocusArea)
            .where(FocusArea.student_id == student_id)
            .order_by(desc(FocusArea.score))
        )
        return list(result.scalars().all())

    async def replace_student_focus(self, student_id, focus_areas: list[FocusArea]) -> list[FocusArea]:
        await self._session.execute(delete(FocusArea).where(FocusArea.student_id == student_id))
        for focus_area in focus_areas:
            self._session.add(focus_area)
        await self._session.flush()
        return focus_areas

