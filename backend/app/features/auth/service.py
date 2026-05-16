from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import Role
from app.core.security import TokenSubject
from app.db.repositories.user_repository import UserRepository


@dataclass(slots=True)
class ProfileUpsertCommand:
    full_name: str
    role: Role
    school_id: UUID | None = None
    grade_level: str | None = None
    avatar_url: str | None = None


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._users = UserRepository(session)

    async def get_profile(self, current_user: CurrentUser) -> dict:
        profile = await self._users.get_by_id(current_user.user_id)
        return {
            "id": str(profile.id),
            "email": profile.email,
            "full_name": profile.full_name,
            "role": profile.role.value,
            "school_id": str(profile.school_id) if profile.school_id else None,
            "grade_level": profile.grade_level,
        }

    async def upsert_profile(self, subject: TokenSubject, command: ProfileUpsertCommand) -> dict:
        profile = await self._users.upsert_profile(
            supabase_user_id=subject.subject,
            email=subject.email or f"{subject.subject}@example.local",
            full_name=command.full_name,
            role=command.role,
            school_id=command.school_id,
            grade_level=command.grade_level,
            avatar_url=command.avatar_url,
        )
        await self._session.commit()
        return {
            "id": str(profile.id),
            "email": profile.email,
            "full_name": profile.full_name,
            "role": profile.role.value,
            "school_id": str(profile.school_id) if profile.school_id else None,
            "grade_level": profile.grade_level,
        }

