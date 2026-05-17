from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import EventType
from app.core.exceptions import RuleViolationError
from app.db.repositories.event_repository import EventRepository
from app.db.repositories.learning_session_repository import LearningSessionRepository
from app.features.learning.socratic_state_machine import SocraticState, SocraticStateMachine
from app.llm.gateway import LLMGateway


@dataclass(slots=True)
class LearningChatCommand:
    session_id: UUID | None
    message: str
    attempts_count: int = 0
    hints_used: int = 0
    student_said_stuck: bool = False
    explain_requested: bool = False


class LearningService:
    def __init__(self, session: AsyncSession, state_machine: SocraticStateMachine, llm_gateway: LLMGateway) -> None:
        self._session = session
        self._state_machine = state_machine
        self._events = EventRepository(session)
        self._learning_sessions = LearningSessionRepository(session)
        self._llm_gateway = llm_gateway

    async def _ensure_learning_session(self, current_user: CurrentUser, session_id: UUID | None) -> UUID | None:
        if session_id is None or current_user.user_id is None:
            return None

        existing = await self._learning_sessions.get_by_id(session_id)
        if existing is None:
            await self._learning_sessions.create(
                session_id=session_id,
                student_id=current_user.user_id,
                school_id=current_user.school_id,
            )
            return session_id

        if existing.student_id != current_user.user_id:
            raise RuleViolationError("This learning session does not belong to the current student.")

        return session_id

    async def chat(self, current_user: CurrentUser, command: LearningChatCommand) -> dict:
        session_id = await self._ensure_learning_session(current_user, command.session_id)
        decision = self._state_machine.next_action(
            SocraticState(
                attempts_count=command.attempts_count,
                hints_used=command.hints_used,
                student_said_stuck=command.student_said_stuck,
                explain_requested=command.explain_requested,
            )
        )
        prompt = (
            f"Decision: {decision.action}\n"
            f"Reason: {decision.reason}\n"
            f"Student message: {command.message}\n"
            "Return one helpful next message."
        )
        response_text = await self._llm_gateway.generate_socratic_response(prompt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.CHAT_MESSAGE,
            payload={"message": command.message, "decision": decision.action},
        )
        await self._session.commit()
        return {"response": response_text, "decision": decision.action}

    async def attempt(self, current_user: CurrentUser, session_id: UUID | None, answer: str) -> dict:
        session_id = await self._ensure_learning_session(current_user, session_id)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.ATTEMPT_SUBMITTED,
            payload={"answer": answer},
        )
        await self._session.commit()
        return {"status": "attempt_logged"}

    async def hint(self, current_user: CurrentUser, command: LearningChatCommand) -> dict:
        session_id = await self._ensure_learning_session(current_user, command.session_id)
        decision = self._state_machine.next_action(
            SocraticState(
                attempts_count=command.attempts_count,
                hints_used=command.hints_used,
                student_said_stuck=command.student_said_stuck,
                explain_requested=False,
            )
        )
        if decision.action not in {"hint", "guide"}:
            raise RuleViolationError("Hints are no longer the next allowed learning action.")

        prompt = f"Student message: {command.message}\nGive one short hint."
        hint_text = await self._llm_gateway.generate_socratic_response(prompt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.HINT_REQUESTED,
            payload={"message": command.message},
        )
        await self._session.commit()
        return {"hint": hint_text}

    async def explain_after_effort(self, current_user: CurrentUser, command: LearningChatCommand) -> dict:
        session_id = await self._ensure_learning_session(current_user, command.session_id)
        decision = self._state_machine.next_action(
            SocraticState(
                attempts_count=command.attempts_count,
                hints_used=command.hints_used,
                student_said_stuck=command.student_said_stuck,
                explain_requested=True,
            )
        )
        if decision.action != "explain":
            raise RuleViolationError("Explanation is not yet allowed for this learning flow.")

        prompt = (
            f"Student message: {command.message}\n"
            "Give a concise explanation and end with one check question."
        )
        explanation = await self._llm_gateway.generate_socratic_response(prompt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.EXPLANATION_REVEALED,
            payload={"message": command.message},
        )
        await self._session.commit()
        return {"explanation": explanation}
