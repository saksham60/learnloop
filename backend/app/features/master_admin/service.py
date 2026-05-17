from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ApprovalStatus, Role, SchoolStatus
from app.core.exceptions import NotFoundError
from app.db.models.class_model import ClassRoom
from app.db.models.school import School
from app.db.models.user import UserProfile
from app.db.repositories.school_repository import SchoolRepository
from app.db.repositories.user_repository import UserRepository


class MasterAdminService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._schools = SchoolRepository(session)
        self._users = UserRepository(session)

    @staticmethod
    def _serialize_school(school: School, *, user_count: int = 0, class_count: int = 0) -> dict:
        return {
            "id": str(school.id),
            "name": school.name,
            "code": school.code,
            "city": school.city,
            "state": school.state,
            "country": school.country,
            "contact_email": school.contact_email,
            "status": school.status.value,
            "created_at": school.created_at.isoformat(),
            "user_count": user_count,
            "class_count": class_count,
        }

    async def overview(self) -> dict:
        school_count = await self._session.scalar(select(func.count()).select_from(School))
        active_school_count = await self._session.scalar(
            select(func.count()).select_from(School).where(School.status == SchoolStatus.ACTIVE)
        )
        user_count = await self._session.scalar(select(func.count()).select_from(UserProfile))
        school_admin_count = await self._session.scalar(
            select(func.count()).select_from(UserProfile).where(UserProfile.role == Role.SCHOOL_ADMIN)
        )
        return {
            "total_schools": int(school_count or 0),
            "active_schools": int(active_school_count or 0),
            "total_users": int(user_count or 0),
            "pending_school_admin_setup": max(int(school_count or 0) - int(school_admin_count or 0), 0),
            "platform_health": "healthy",
        }

    async def list_schools(self) -> list[dict]:
        rows = await self._schools.list_schools_with_counts()
        return [
            self._serialize_school(
                row["school"],
                user_count=row["user_count"],
                class_count=row["class_count"],
            )
            for row in rows
        ]

    async def create_school(
        self,
        *,
        name: str,
        code: str | None = None,
        city: str | None = None,
        state: str | None = None,
        country: str | None = None,
        contact_email: str | None = None,
        status: SchoolStatus = SchoolStatus.ACTIVE,
    ) -> dict:
        slug = (code or name).strip().lower().replace(" ", "-")
        school = await self._schools.create_school(
            name=name,
            slug=slug,
            code=code,
            city=city,
            state=state,
            country=country,
            contact_email=contact_email,
            status=status,
        )
        await self._session.commit()
        return self._serialize_school(school)

    async def update_school(self, school_id: UUID, **changes) -> dict:
        school = await self._schools.get_by_id(school_id)
        if school is None:
            raise NotFoundError("School not found.")
        school = await self._schools.update_school(school, **changes)
        await self._session.commit()
        return self._serialize_school(school)

    async def list_users(self) -> list[dict]:
        users = await self._users.list_users()
        return [
            {
                "id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role.value,
                "approval_status": user.approval_status.value,
                "school_id": str(user.school_id) if user.school_id else None,
                "school_name": user.school.name if user.school else None,
                "created_at": user.created_at.isoformat(),
            }
            for user in users
        ]

    async def list_school_admins(self) -> list[dict]:
        admins = await self._users.list_users(roles=[Role.SCHOOL_ADMIN])
        return [
            {
                "id": str(admin.id),
                "full_name": admin.full_name,
                "email": admin.email,
                "school_id": str(admin.school_id) if admin.school_id else None,
                "school_name": admin.school.name if admin.school else None,
                "approval_status": admin.approval_status.value,
            }
            for admin in admins
        ]

    async def assign_school_admin(self, *, email: str, school_id: UUID) -> dict:
        user = await self._users.get_by_email(email)
        if user is None:
            raise NotFoundError("User with that email was not found.")
        school = await self._schools.get_by_id(school_id)
        if school is None:
            raise NotFoundError("School not found.")

        user.role = Role.SCHOOL_ADMIN
        user.approval_status = ApprovalStatus.ACTIVE
        user.school_id = school_id
        user.approval_reason = None
        await self._session.commit()
        return {
            "id": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "approval_status": user.approval_status.value,
            "school_id": str(user.school_id) if user.school_id else None,
            "school_name": school.name,
        }
