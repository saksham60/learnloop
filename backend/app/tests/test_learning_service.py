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
    def __init__(self) -> None:
        self.prompts: list[str] = []

    async def generate_socratic_response(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return "Try expanding the bracket step by step."


class DummyEventRepository:
    def __init__(self, session_events=None) -> None:
        self.calls: list[dict] = []
        self.session_events = session_events or []

    async def create_event(self, **kwargs):
        self.calls.append(kwargs)
        return kwargs

    async def list_session_events(self, **kwargs):
        return self.session_events


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
    gateway = DummyGateway()
    service = LearningService(session, DummyStateMachine(), gateway)
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
    assert service._events.calls[0]["payload"]["assistant_response"] == "Try expanding the bracket step by step."
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


@pytest.mark.asyncio
async def test_learning_chat_uses_recent_session_history_in_prompt() -> None:
    session = DummySession()
    gateway = DummyGateway()
    service = LearningService(session, DummyStateMachine(), gateway)
    prior_events = [
        SimpleNamespace(
            event_type="chat_message",
            payload={
                "message": "(a+b)^2",
                "decision": "guide",
                "assistant_response": "What does squaring an expression mean?",
            },
        ),
        SimpleNamespace(
            event_type="attempt_submitted",
            payload={"answer": "I think it means multiplying the bracket by itself."},
        ),
    ]
    service._events = DummyEventRepository(session_events=prior_events)
    service._learning_sessions = DummyLearningSessionRepository(existing=SimpleNamespace(student_id=uuid4()))
    current_user_id = uuid4()
    current_user = CurrentUser(
        user_id=current_user_id,
        supabase_user_id="supabase-user",
        email="student@example.com",
        role=None,
        school_id=None,
    )
    service._learning_sessions.existing = SimpleNamespace(student_id=current_user_id)

    await service.chat(
        current_user,
        LearningChatCommand(session_id=uuid4(), message="yes"),
    )

    prompt = gateway.prompts[0]
    assert "Recent conversation:" in prompt
    assert "Student: (a+b)^2" in prompt
    assert "Assistant (guide): What does squaring an expression mean?" in prompt
    assert "Student attempt: I think it means multiplying the bracket by itself." in prompt
    assert "Student message: yes" in prompt
