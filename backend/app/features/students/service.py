from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.db.repositories.student_repository import StudentRepository


class StudentService:
    def __init__(self, session: AsyncSession) -> None:
        self._students = StudentRepository(session)

    async def get_me(self, current_user: CurrentUser) -> dict:
        student = await self._students.get_student(current_user.user_id)
        return {
            "id": str(student.id),
            "email": student.email,
            "full_name": student.full_name,
            "role": student.role.value,
            "grade_level": student.grade_level,
        }

    async def get_dashboard(self, current_user: CurrentUser) -> dict:
        return await self._students.get_dashboard(current_user.user_id)

    async def list_events(self, current_user: CurrentUser, *, limit: int, offset: int) -> list[dict]:
        events = await self._students.list_events(current_user.user_id, limit=limit, offset=offset)
        return [
            {
                "id": str(event.id),
                "event_type": event.event_type.value,
                "payload": event.payload,
                "created_at": event.created_at.isoformat(),
            }
            for event in events
        ]

    async def get_focus(self, current_user: CurrentUser) -> list[dict]:
        focus_areas = await self._students.list_focus(current_user.user_id)
        return [
            {
                "id": str(area.id),
                "title": area.title,
                "description": area.description,
                "score": area.score,
                "status": area.status.value,
            }
            for area in focus_areas
        ]

