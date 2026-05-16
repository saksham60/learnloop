from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.class_model import ClassRoom


class TeacherRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_teacher_classes(self, teacher_id: UUID) -> list[ClassRoom]:
        result = await self._session.execute(
            select(ClassRoom)
            .where(ClassRoom.teacher_id == teacher_id)
            .options(selectinload(ClassRoom.subject), selectinload(ClassRoom.students))
        )
        return list(result.scalars().all())

