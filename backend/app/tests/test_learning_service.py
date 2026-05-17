from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.api.dependencies import CurrentUser
from app.core.exceptions import RuleViolationError
from app.features.learning.service import LearningChatCommand, LearningService


class DummySession:
    def __init__(self) -> None:
        self.committed = False

    async def commit(self) -> None:
        self.committed = True


class DummyStateMachine:
    def next_action(self, state) -> SimpleNamespace:
        return SimpleNamespace(action="guide", reason="attempt first")


class DummyGateway:
    async def generate_socratic_response(self, prompt: str) -> str:
        return "Try expanding the bracket step by step."


class DummyEventRepository:
    def __init__(self) -> None:
        self.calls: list[dict] = []

    async def create_event(self, **kwargs):
        self.calls.append(kwargs)
        return kwargs


class DummyLearningSessionRepository:
    def __init__(self, existing=None) -> None:
        self.existing = existing
        self.created: list[dict] = []

    async def get_by_id(self, session_id):
        return self.existing

    async def create(self, **kwargs):
        self.created.append(kwargs)
        return SimpleNamespace(id=kwargs["session_id"], student_id=kwargs["student_id"])


@pytest.mark.asyncio
async def test_learning_chat_creates_missing_learning_session_before_logging_event() -> None:
    session = DummySession()
    service = LearningService(session, DummyStateMachine(), DummyGateway())
    service._events = DummyEventRepository()
    service._learning_sessions = DummyLearningSessionRepository()
    current_user = CurrentUser(
        user_id=uuid4(),
        supabase_user_id="supabase-user",
        email="student@example.com",
        role=None,
        school_id=None,
    )
    session_id = uuid4()

    response = await service.chat(
        current_user,
        LearningChatCommand(session_id=session_id, message="(a + b)^2 what is it?"),
    )

    assert response["decision"] == "guide"
    assert service._learning_sessions.created[0]["session_id"] == session_id
    assert service._events.calls[0]["session_id"] == session_id
    assert session.committed is True


@pytest.mark.asyncio
async def test_learning_chat_rejects_session_owned_by_another_student() -> None:
    session = DummySession()
    service = LearningService(session, DummyStateMachine(), DummyGateway())
    service._events = DummyEventRepository()
    service._learning_sessions = DummyLearningSessionRepository(existing=SimpleNamespace(student_id=uuid4()))
    current_user = CurrentUser(
        user_id=uuid4(),
        supabase_user_id="supabase-user",
        email="student@example.com",
        role=None,
        school_id=None,
    )

    with pytest.raises(RuleViolationError):
        await service.chat(
            current_user,
            LearningChatCommand(session_id=uuid4(), message="help"),
        )
