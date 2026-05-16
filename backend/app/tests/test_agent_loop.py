from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.agents.loop import AgentLoop
from app.agents.orchestrator import AgentOrchestrator
from app.agents.registry import AgentRegistry
from app.agents.state import AgentLoopInput
from app.core.constants import Role
from app.features.progress.safe_summary_builder import ProgressSnapshot


class FakeTraceService:
    def __init__(self) -> None:
        self.run = None
        self.steps: list[dict] = []
        self.tool_calls: list[dict] = []

    async def start_run(self, **kwargs):
        self.run = SimpleNamespace(id=uuid4(), **kwargs)
        return self.run

    async def log_step(self, **kwargs):
        self.steps.append(kwargs)
        return SimpleNamespace(id=uuid4(), **kwargs)

    async def log_tool_call(self, **kwargs):
        self.tool_calls.append(kwargs)
        return SimpleNamespace(id=uuid4(), **kwargs)

    async def complete_run(self, **kwargs):
        return None

    async def fail_run(self, **kwargs):
        return None


class FakeProgressService:
    async def build_snapshot(self, current_user):
        return ProgressSnapshot(
            pending_homework_count=2,
            completed_homework_count=5,
            focus_titles=["Fractions"],
        )


class FakeFocusService:
    async def get_today_focus(self, current_user):
        return [{"title": "Fractions", "score": 7.5}]


class FakeHomeworkService:
    async def get_guidance_policy(self, **kwargs):
        return {"allow_hint": True, "allow_explanation": False, "allow_direct_answer": False}


class FakeAnalyticsService:
    async def build_teacher_insight(self, class_id):
        return {"class_id": str(class_id)}


class FakeLLMGateway:
    async def generate_progress_answer(self, structured_summary: str, user_question: str) -> str:
        return "Maths needs attention first because recent signals show repeated struggle."

    async def evaluate_response(self, response_text: str):
        return SimpleNamespace(model_dump=lambda: {"allowed": True, "reason": "ok"})


class FakeEventLogger:
    def __init__(self) -> None:
        self.events: list[dict] = []

    async def create_event(self, **kwargs):
        self.events.append(kwargs)
        return kwargs


@pytest.mark.asyncio
async def test_agent_loop_creates_trace_steps_and_tool_calls() -> None:
    trace = FakeTraceService()
    event_logger = FakeEventLogger()
    registry = AgentRegistry()
    loop = AgentLoop(
        trace_service=trace,
        orchestrator=AgentOrchestrator(registry),
        registry=registry,
        event_logger=event_logger,
    )
    current_user = SimpleNamespace(user_id=uuid4(), school_id=uuid4())
    services = {
        "current_user": current_user,
        "llm_gateway": FakeLLMGateway(),
        "progress_service": FakeProgressService(),
        "focus_service": FakeFocusService(),
        "homework_service": FakeHomeworkService(),
        "analytics_service": FakeAnalyticsService(),
    }

    result = await loop.run(
        AgentLoopInput(
            user_id=current_user.user_id,
            role=Role.STUDENT,
            session_id=uuid4(),
            request_type="progress_question",
            user_message="What should I study today?",
            metadata={},
        ),
        services=services,
    )

    assert result.selected_agent == "ProgressAnalystAgent"
    assert len(trace.steps) == 6
    assert len(trace.tool_calls) == 2
    assert event_logger.events

