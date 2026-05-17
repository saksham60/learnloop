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

    def _format_history_event(self, event) -> list[str]:
        payload = event.payload or {}
        lines: list[str] = []

        if event.event_type == EventType.CHAT_MESSAGE:
            message = payload.get("message")
            assistant_response = payload.get("assistant_response")
            decision = payload.get("decision")
            if message:
                lines.append(f"Student: {message}")
            if assistant_response:
                label = f"Assistant ({decision})" if decision else "Assistant"
                lines.append(f"{label}: {assistant_response}")
            return lines

        if event.event_type == EventType.HINT_REQUESTED:
            message = payload.get("message")
            assistant_response = payload.get("assistant_response")
            if message:
                lines.append(f"Student: {message}")
            if assistant_response:
                lines.append(f"Assistant (hint): {assistant_response}")
            return lines

        if event.event_type == EventType.EXPLANATION_REVEALED:
            message = payload.get("message")
            assistant_response = payload.get("assistant_response")
            if message:
                lines.append(f"Student: {message}")
            if assistant_response:
                lines.append(f"Assistant (explanation): {assistant_response}")
            return lines

        if event.event_type == EventType.ATTEMPT_SUBMITTED:
            answer = payload.get("answer")
            if answer:
                lines.append(f"Student attempt: {answer}")
            return lines

        return lines

    async def _build_session_history(self, current_user: CurrentUser, session_id: UUID | None) -> str:
        if session_id is None or current_user.user_id is None:
            return ""

        events = await self._events.list_session_events(
            student_id=current_user.user_id,
            session_id=session_id,
        )
        history_lines: list[str] = []
        for event in events[-8:]:
            history_lines.extend(self._format_history_event(event))
        return "\n".join(history_lines)

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
        history = await self._build_session_history(current_user, session_id)
        prompt_sections = [
            f"Decision: {decision.action}",
            f"Reason: {decision.reason}",
        ]
        if history:
            prompt_sections.append(f"Recent conversation:\n{history}")
        prompt_sections.append(f"Student message: {command.message}")
        prompt_sections.append(
            "Respond to the latest student message using the conversation context. "
            "If the student gives a short reply like yes or no, interpret it against the most recent assistant question. "
            "Return one helpful next message."
        )
        prompt = "\n\n".join(prompt_sections)
        response_text = await self._llm_gateway.generate_socratic_response(prompt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.CHAT_MESSAGE,
            payload={
                "message": command.message,
                "decision": decision.action,
                "assistant_response": response_text,
            },
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

        history = await self._build_session_history(current_user, session_id)
        prompt_sections = []
        if history:
            prompt_sections.append(f"Recent conversation:\n{history}")
        prompt_sections.append(f"Student message: {command.message}")
        prompt_sections.append(
            "Use the recent conversation to keep continuity. "
            "Give one short hint that helps the student take the next step."
        )
        prompt = "\n\n".join(prompt_sections)
        hint_text = await self._llm_gateway.generate_socratic_response(prompt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.HINT_REQUESTED,
            payload={"message": command.message, "assistant_response": hint_text},
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

        history = await self._build_session_history(current_user, session_id)
        prompt_sections = []
        if history:
            prompt_sections.append(f"Recent conversation:\n{history}")
        prompt_sections.append(f"Student message: {command.message}")
        prompt_sections.append(
            "Use the recent conversation to keep continuity. "
            "Give a concise explanation and end with one check question."
        )
        prompt = "\n\n".join(prompt_sections)
        explanation = await self._llm_gateway.generate_socratic_response(prompt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            session_id=session_id,
            event_type=EventType.EXPLANATION_REVEALED,
            payload={"message": command.message, "assistant_response": explanation},
        )
        await self._session.commit()
        return {"explanation": explanation}
