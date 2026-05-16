from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import Role
from app.db.models.user import UserProfile


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_supabase_user_id(self, supabase_user_id: str) -> UserProfile | None:
        result = await self._session.execute(
            select(UserProfile).where(UserProfile.supabase_user_id == supabase_user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> UserProfile | None:
        return await self._session.get(UserProfile, user_id)

    async def upsert_profile(
        self,
        *,
        supabase_user_id: str,
        email: str,
        full_name: str,
        role: Role,
        school_id: UUID | None = None,
        grade_level: str | None = None,
        avatar_url: str | None = None,
        preferences: dict[str, Any] | None = None,
    ) -> UserProfile:
        profile = await self.get_by_supabase_user_id(supabase_user_id)
        if profile is None:
            profile = UserProfile(
                supabase_user_id=supabase_user_id,
                email=email,
                full_name=full_name,
                role=role,
                school_id=school_id,
                grade_level=grade_level,
                avatar_url=avatar_url,
                preferences=preferences or {},
            )
            self._session.add(profile)
        else:
            profile.email = email
            profile.full_name = full_name
            profile.role = role
            profile.school_id = school_id
            profile.grade_level = grade_level
            profile.avatar_url = avatar_url
            profile.preferences = preferences or profile.preferences
        await self._session.flush()
        return profile

