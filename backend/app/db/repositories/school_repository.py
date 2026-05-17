from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import SchoolStatus
from app.db.models.class_model import ClassRoom
from app.db.models.school import School
from app.db.models.user import UserProfile


class SchoolRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, school_id: UUID) -> School | None:
        return await self._session.get(School, school_id)

    async def list_schools(self, *, search: str | None = None) -> list[School]:
        statement = select(School).order_by(School.name.asc())
        if search:
            like = f"%{search.strip()}%"
            statement = statement.where(
                School.name.ilike(like) | School.slug.ilike(like) | School.code.ilike(like)
            )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def create_school(
        self,
        *,
        name: str,
        slug: str,
        code: str | None = None,
        city: str | None = None,
        state: str | None = None,
        country: str | None = None,
        contact_email: str | None = None,
        status: SchoolStatus = SchoolStatus.ACTIVE,
    ) -> School:
        school = School(
            name=name,
            slug=slug,
            code=code,
            city=city,
            state=state,
            country=country,
            contact_email=contact_email,
            status=status,
            metadata_json={},
        )
        self._session.add(school)
        await self._session.flush()
        return school

    async def update_school(self, school: School, **changes) -> School:
        for key, value in changes.items():
            if hasattr(school, key) and value is not None:
                setattr(school, key, value)
        await self._session.flush()
        return school

    async def list_schools_with_counts(self) -> list[dict]:
        statement = (
            select(
                School,
                func.count(func.distinct(UserProfile.id)).label("user_count"),
                func.count(func.distinct(ClassRoom.id)).label("class_count"),
            )
            .outerjoin(UserProfile, UserProfile.school_id == School.id)
            .outerjoin(ClassRoom, ClassRoom.school_id == School.id)
            .group_by(School.id)
            .order_by(School.created_at.desc())
        )
        result = await self._session.execute(statement)
        rows = []
        for school, user_count, class_count in result.all():
            rows.append(
                {
                    "school": school,
                    "user_count": int(user_count or 0),
                    "class_count": int(class_count or 0),
                }
            )
        return rows
