from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.core.constants import Role
from app.core.security import TokenSubject
from app.features.auth.service import AuthService


class FakeSession:
    def __init__(self) -> None:
        self.commit_calls = 0

    async def commit(self) -> None:
        self.commit_calls += 1


class FakeUserRepository:
    def __init__(self, existing_profile=None, created_profile=None) -> None:
        self.existing_profile = existing_profile
        self.created_profile = created_profile
        self.upsert_calls: list[dict] = []

    async def get_by_supabase_user_id(self, supabase_user_id: str):
        return self.existing_profile

    async def upsert_profile(self, **kwargs):
        self.upsert_calls.append(kwargs)
        return self.created_profile


def build_subject() -> TokenSubject:
    return TokenSubject(
        subject="supabase-user-1",
        email="student@example.com",
        full_name="Saksham Kashyap",
        avatar_url="https://example.com/avatar.png",
        raw_claims={"sub": "supabase-user-1"},
    )


@pytest.mark.asyncio
async def test_bootstrap_profile_creates_pending_user_when_missing() -> None:
    session = FakeSession()
    service = AuthService(session)  # type: ignore[arg-type]
    created_profile = SimpleNamespace(
        id="profile-1",
        email="student@example.com",
        full_name="Saksham Kashyap",
        role=Role.PENDING,
        school_id=None,
        grade_level=None,
        avatar_url="https://example.com/avatar.png",
    )
    service._users = FakeUserRepository(created_profile=created_profile)  # type: ignore[assignment]

    profile = await service.bootstrap_profile(build_subject())

    assert profile["email"] == "student@example.com"
    assert profile["role"] == "pending"
    assert service._users.upsert_calls[0]["role"] == Role.PENDING
    assert session.commit_calls == 1


@pytest.mark.asyncio
async def test_bootstrap_profile_preserves_existing_role() -> None:
    session = FakeSession()
    existing_profile = SimpleNamespace(
        id="profile-2",
        email="old@example.com",
        full_name="Old Name",
        role=Role.TEACHER,
        school_id=None,
        grade_level=None,
        avatar_url=None,
    )
    service = AuthService(session)  # type: ignore[arg-type]
    service._users = FakeUserRepository(existing_profile=existing_profile)  # type: ignore[assignment]

    profile = await service.bootstrap_profile(build_subject())

    assert profile["role"] == "teacher"
    assert profile["email"] == "student@example.com"
    assert profile["full_name"] == "Saksham Kashyap"
    assert session.commit_calls == 1
