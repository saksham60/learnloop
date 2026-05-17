from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import ApprovalStatus, Role
from app.core.exceptions import NotFoundError, RuleViolationError
from app.core.security import TokenSubject
from app.db.repositories.school_repository import SchoolRepository
from app.db.repositories.user_repository import UserRepository


@dataclass(slots=True)
class ProfileUpsertCommand:
    full_name: str
    role: Role
    approval_status: ApprovalStatus = ApprovalStatus.ACTIVE
    school_id: UUID | None = None
    grade_level: str | None = None
    avatar_url: str | None = None
    approval_reason: str | None = None
    approval_metadata: dict[str, Any] | None = None


@dataclass(slots=True)
class OnboardingCommand:
    role: Role
    school_id: UUID
    approval_status: ApprovalStatus
    grade_level: str | None = None
    parent_request: dict[str, Any] | None = None


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._users = UserRepository(session)
        self._schools = SchoolRepository(session)

    def _serialize_profile(self, profile) -> dict:
        return {
            "id": str(profile.id),
            "email": profile.email,
            "full_name": profile.full_name,
            "role": profile.role.value,
            "approval_status": profile.approval_status.value,
            "school_id": str(profile.school_id) if profile.school_id else None,
            "school_name": profile.school.name if getattr(profile, "school", None) else None,
            "grade_level": profile.grade_level,
            "avatar_url": profile.avatar_url,
            "approval_reason": profile.approval_reason,
            "parent_request": (profile.approval_metadata or {}).get("parent_request"),
            "created_at": profile.created_at.isoformat(),
        }

    def _build_pending_profile_command(self, subject: TokenSubject) -> ProfileUpsertCommand:
        fallback_name = (
            subject.full_name
            or (subject.email.split("@")[0] if subject.email else None)
            or "LearnLoop member"
        )
        return ProfileUpsertCommand(
            full_name=fallback_name,
            role=Role.PENDING,
            approval_status=ApprovalStatus.ACTIVE,
            school_id=None,
            grade_level=None,
            avatar_url=subject.avatar_url,
            approval_reason=None,
            approval_metadata={},
        )

    async def get_profile(self, current_user: CurrentUser) -> dict:
        profile = await self._users.get_by_id(current_user.user_id)
        return self._serialize_profile(profile)

    async def bootstrap_profile(self, subject: TokenSubject) -> dict:
        profile = await self._users.get_by_supabase_user_id(subject.subject)
        if profile is None:
            return await self.upsert_profile(subject, self._build_pending_profile_command(subject))

        email = subject.email or profile.email
        full_name = subject.full_name or profile.full_name
        avatar_url = subject.avatar_url or profile.avatar_url
        profile_changed = False

        if profile.email != email:
            profile.email = email
            profile_changed = True
        if profile.full_name != full_name:
            profile.full_name = full_name
            profile_changed = True
        if profile.avatar_url != avatar_url:
            profile.avatar_url = avatar_url
            profile_changed = True

        if profile_changed:
            await self._session.commit()

        return self._serialize_profile(profile)

    async def upsert_profile(self, subject: TokenSubject, command: ProfileUpsertCommand) -> dict:
        profile = await self._users.upsert_profile(
            supabase_user_id=subject.subject,
            email=subject.email or f"{subject.subject}@example.local",
            full_name=command.full_name,
            role=command.role,
            approval_status=command.approval_status,
            school_id=command.school_id,
            grade_level=command.grade_level,
            avatar_url=command.avatar_url,
            approval_reason=command.approval_reason,
            approval_metadata=command.approval_metadata,
        )
        await self._session.commit()
        return self._serialize_profile(profile)

    async def onboard_profile(self, subject: TokenSubject, command: OnboardingCommand) -> dict:
        if command.role not in {Role.STUDENT, Role.TEACHER, Role.PARENT}:
            raise RuleViolationError("Only student, teacher, and parent roles are allowed in public onboarding.")

        school = await self._schools.get_by_id(command.school_id)
        if school is None:
            raise NotFoundError("Selected school was not found.")

        if command.role == Role.STUDENT and command.approval_status != ApprovalStatus.ACTIVE:
            raise RuleViolationError("Students should be activated immediately after selecting a school.")

        if command.role in {Role.TEACHER, Role.PARENT} and command.approval_status != ApprovalStatus.PENDING_APPROVAL:
            raise RuleViolationError("Teacher and parent onboarding requests must wait for school approval.")

        existing_profile = await self._users.get_by_supabase_user_id(subject.subject)
        base_name = (
            existing_profile.full_name
            if existing_profile is not None
            else subject.full_name
            or (subject.email.split("@")[0] if subject.email else None)
            or "LearnLoop member"
        )
        avatar_url = (existing_profile.avatar_url if existing_profile is not None else None) or subject.avatar_url

        metadata: dict[str, Any] = {}
        if command.parent_request:
            metadata["parent_request"] = command.parent_request

        profile = await self._users.upsert_profile(
            supabase_user_id=subject.subject,
            email=subject.email or f"{subject.subject}@example.local",
            full_name=base_name,
            role=command.role,
            approval_status=command.approval_status,
            school_id=command.school_id,
            grade_level=command.grade_level,
            avatar_url=avatar_url,
            approval_reason=None,
            approval_metadata=metadata,
            preferences=existing_profile.preferences if existing_profile is not None else None,
        )
        await self._session.commit()
        return self._serialize_profile(profile)
