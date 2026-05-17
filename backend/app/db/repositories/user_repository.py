from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import ApprovalStatus, Role
from app.db.models.user import UserProfile


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_supabase_user_id(self, supabase_user_id: str) -> UserProfile | None:
        result = await self._session.execute(
            select(UserProfile)
            .where(UserProfile.supabase_user_id == supabase_user_id)
            .options(selectinload(UserProfile.school))
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> UserProfile | None:
        result = await self._session.execute(
            select(UserProfile).where(UserProfile.id == user_id).options(selectinload(UserProfile.school))
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> UserProfile | None:
        result = await self._session.execute(
            select(UserProfile).where(UserProfile.email == email).options(selectinload(UserProfile.school))
        )
        return result.scalar_one_or_none()

    async def list_users(
        self,
        *,
        school_id: UUID | None = None,
        roles: list[Role] | None = None,
        approval_statuses: list[ApprovalStatus] | None = None,
        search: str | None = None,
    ) -> list[UserProfile]:
        statement = select(UserProfile).options(selectinload(UserProfile.school))
        if school_id is not None:
            statement = statement.where(UserProfile.school_id == school_id)
        if roles:
            statement = statement.where(UserProfile.role.in_(roles))
        if approval_statuses:
            statement = statement.where(UserProfile.approval_status.in_(approval_statuses))
        if search:
            like = f"%{search.strip()}%"
            statement = statement.where(
                UserProfile.full_name.ilike(like) | UserProfile.email.ilike(like)
            )

        result = await self._session.execute(statement.order_by(UserProfile.created_at.desc()))
        return list(result.scalars().all())

    async def upsert_profile(
        self,
        *,
        supabase_user_id: str,
        email: str,
        full_name: str,
        role: Role,
        approval_status: ApprovalStatus = ApprovalStatus.ACTIVE,
        school_id: UUID | None = None,
        grade_level: str | None = None,
        avatar_url: str | None = None,
        approval_reason: str | None = None,
        approval_metadata: dict[str, Any] | None = None,
        preferences: dict[str, Any] | None = None,
    ) -> UserProfile:
        profile = await self.get_by_supabase_user_id(supabase_user_id)
        if profile is None:
            profile = UserProfile(
                supabase_user_id=supabase_user_id,
                email=email,
                full_name=full_name,
                role=role,
                approval_status=approval_status,
                school_id=school_id,
                grade_level=grade_level,
                avatar_url=avatar_url,
                approval_reason=approval_reason,
                approval_metadata=approval_metadata or {},
                preferences=preferences or {},
            )
            self._session.add(profile)
        else:
            profile.email = email
            profile.full_name = full_name
            profile.role = role
            profile.approval_status = approval_status
            profile.school_id = school_id
            profile.grade_level = grade_level
            profile.avatar_url = avatar_url
            profile.approval_reason = approval_reason
            profile.approval_metadata = approval_metadata or profile.approval_metadata
            profile.preferences = preferences or profile.preferences
        await self._session.flush()
        return profile
