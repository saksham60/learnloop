from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.constants import ApprovalStatus, Role
from app.core.exceptions import AuthenticationError
from app.core.security import JWTValidator, TokenSubject, bearer_scheme
from app.db.session import get_db_session


@dataclass(slots=True)
class CurrentUser:
    user_id: UUID | None
    supabase_user_id: str
    email: str | None
    role: Role | None
    approval_status: ApprovalStatus | None
    school_id: UUID | None


SettingsDep = Annotated[Settings, Depends(get_settings)]
SessionDep = Annotated[AsyncSession, Depends(get_db_session)]


@lru_cache(maxsize=1)
def get_jwt_validator() -> JWTValidator:
    return JWTValidator(get_settings())


@lru_cache(maxsize=1)
def get_agent_registry():
    from app.agents.registry import AgentRegistry

    return AgentRegistry()


@lru_cache(maxsize=1)
def get_llm_gateway():
    from app.llm.gateway import LLMGateway

    return LLMGateway(get_settings())


@lru_cache(maxsize=1)
def get_socratic_state_machine():
    from app.features.learning.socratic_state_machine import SocraticStateMachine

    return SocraticStateMachine(get_settings())


def get_token_subject(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> TokenSubject:
    validator = get_jwt_validator()
    return validator.extract_subject(credentials)


async def get_authenticated_user(
    subject: Annotated[TokenSubject, Depends(get_token_subject)],
    session: SessionDep,
) -> CurrentUser:
    from app.db.repositories.user_repository import UserRepository

    user = await UserRepository(session).get_by_supabase_user_id(subject.subject)
    if user is None:
        raise AuthenticationError("No user profile exists for this Supabase account.")

    return CurrentUser(
        user_id=user.id,
        supabase_user_id=user.supabase_user_id,
        email=user.email,
        role=user.role,
        approval_status=user.approval_status,
        school_id=user.school_id,
    )


def get_optional_token_subject(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> TokenSubject | None:
    if credentials is None or not credentials.credentials:
        return None
    validator = get_jwt_validator()
    return validator.extract_subject(credentials)


async def get_optional_authenticated_user(
    subject: Annotated[TokenSubject | None, Depends(get_optional_token_subject)],
    session: SessionDep,
) -> CurrentUser | None:
    if subject is None:
        return None

    from app.db.repositories.user_repository import UserRepository

    user = await UserRepository(session).get_by_supabase_user_id(subject.subject)
    if user is None:
        return None
    return CurrentUser(
        user_id=user.id,
        supabase_user_id=user.supabase_user_id,
        email=user.email,
        role=user.role,
        approval_status=user.approval_status,
        school_id=user.school_id,
    )


async def get_db() -> AsyncIterator[AsyncSession]:
    async for session in get_db_session():
        yield session
