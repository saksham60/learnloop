from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.school_repository import SchoolRepository


class SchoolService:
    def __init__(self, session: AsyncSession) -> None:
        self._schools = SchoolRepository(session)

    @staticmethod
    def _serialize_school(school) -> dict:
        return {
            "id": str(school.id),
            "name": school.name,
            "code": school.code,
            "city": school.city,
            "state": school.state,
            "country": school.country,
            "status": school.status.value,
        }

    async def list_schools(self, *, search: str | None = None) -> list[dict]:
        schools = await self._schools.list_schools(search=search)
        return [self._serialize_school(school) for school in schools]
