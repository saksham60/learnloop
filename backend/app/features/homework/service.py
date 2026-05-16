from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.config import Settings
from app.core.constants import EventType, HomeworkStatus
from app.core.exceptions import NotFoundError, RuleViolationError
from app.db.models.homework import Homework, HomeworkQuestion, StudentAttempt
from app.db.repositories.event_repository import EventRepository
from app.db.repositories.homework_repository import HomeworkRepository
from app.features.homework.rule_engine import HomeworkGuidanceState, HomeworkRuleEngine


@dataclass(slots=True)
class HomeworkQuestionCommand:
    prompt: str
    order_index: int


@dataclass(slots=True)
class HomeworkCreateCommand:
    title: str
    description: str | None
    school_id: UUID
    class_id: UUID | None
    subject_id: UUID | None
    due_at: Any
    questions: list[HomeworkQuestionCommand]


@dataclass(slots=True)
class HomeworkAttemptCommand:
    answer_text: str
    question_id: UUID | None = None
    hints_used: int = 0
    is_correct: bool | None = None
    score: float | None = None


class HomeworkService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings
        self._homework = HomeworkRepository(session)
        self._events = EventRepository(session)
        self._rules = HomeworkRuleEngine(settings)

    async def create_homework(self, current_user: CurrentUser, command: HomeworkCreateCommand) -> dict:
        homework = Homework(
            school_id=command.school_id,
            class_id=command.class_id,
            subject_id=command.subject_id,
            teacher_id=current_user.user_id,
            title=command.title,
            description=command.description,
            due_at=command.due_at,
            status=HomeworkStatus.ASSIGNED,
            metadata_json={},
        )
        await self._homework.create_homework(homework)
        for question in command.questions:
            await self._homework.add_question(
                HomeworkQuestion(
                    homework_id=homework.id,
                    prompt=question.prompt,
                    order_index=question.order_index,
                    metadata_json={},
                )
            )
        await self._session.commit()
        return {"id": str(homework.id), "title": homework.title, "status": homework.status.value}

    async def list_homework(self, *, limit: int, offset: int) -> list[dict]:
        homework_items = await self._homework.list_homework(limit=limit, offset=offset)
        return [
            {
                "id": str(item.id),
                "title": item.title,
                "description": item.description,
                "status": item.status.value,
                "due_at": item.due_at.isoformat() if item.due_at else None,
                "question_count": len(item.questions),
            }
            for item in homework_items
        ]

    async def get_homework(self, homework_id: UUID) -> dict:
        item = await self._homework.get_homework(homework_id)
        if item is None:
            raise NotFoundError("Homework not found.")
        return {
            "id": str(item.id),
            "title": item.title,
            "description": item.description,
            "status": item.status.value,
            "due_at": item.due_at.isoformat() if item.due_at else None,
            "questions": [
                {"id": str(question.id), "prompt": question.prompt, "order_index": question.order_index}
                for question in item.questions
            ],
        }

    async def submit_attempt(
        self,
        *,
        homework_id: UUID,
        current_user: CurrentUser,
        command: HomeworkAttemptCommand,
    ) -> dict:
        item = await self._homework.get_homework(homework_id)
        if item is None:
            raise NotFoundError("Homework not found.")

        attempt_number = await self._homework.count_attempts(
            homework_id=homework_id,
            student_id=current_user.user_id,
            question_id=command.question_id,
        )
        attempt = StudentAttempt(
            homework_id=homework_id,
            student_id=current_user.user_id,
            question_id=command.question_id,
            answer_text=command.answer_text,
            attempt_number=attempt_number + 1,
            hints_used=command.hints_used,
            is_correct=command.is_correct,
            score=command.score,
            feedback_payload={},
        )
        await self._homework.save_attempt(attempt)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            homework_id=homework_id,
            event_type=EventType.ATTEMPT_SUBMITTED,
            payload={
                "attempt_number": attempt.attempt_number,
                "question_id": str(command.question_id) if command.question_id else None,
                "is_correct": command.is_correct,
            },
        )
        await self._session.commit()
        return {
            "attempt_id": str(attempt.id),
            "attempt_number": attempt.attempt_number,
            "status": "saved",
        }

    async def submit_homework(self, homework_id: UUID, current_user: CurrentUser) -> dict:
        item = await self._homework.get_homework(homework_id)
        if item is None:
            raise NotFoundError("Homework not found.")
        await self._homework.submit_homework(item)
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            homework_id=homework_id,
            event_type=EventType.HOMEWORK_SUBMITTED,
            payload={"status": HomeworkStatus.SUBMITTED.value},
        )
        await self._session.commit()
        return {"id": str(item.id), "status": item.status.value}

    async def get_analytics(self, homework_id: UUID) -> dict:
        return await self._homework.get_analytics(homework_id)

    async def get_guidance_policy(
        self,
        *,
        homework_id: UUID,
        student_id: UUID,
        question_id: UUID | None = None,
        student_said_stuck: bool = False,
    ) -> dict:
        latest_attempt = await self._homework.get_latest_attempt(
            homework_id=homework_id,
            student_id=student_id,
            question_id=question_id,
        )
        attempts_count = await self._homework.count_attempts(
            homework_id=homework_id,
            student_id=student_id,
            question_id=question_id,
        )
        state = HomeworkGuidanceState(
            attempts_count=attempts_count,
            hints_used=latest_attempt.hints_used if latest_attempt else 0,
            student_said_stuck=student_said_stuck,
        )
        decision = self._rules.evaluate(state)
        if self._settings.homework_attempt_first and attempts_count == 0:
            raise RuleViolationError(decision.reason)
        return {
            "allow_hint": decision.allow_hint,
            "allow_explanation": decision.allow_explanation,
            "allow_direct_answer": decision.allow_direct_answer,
            "reason": decision.reason,
        }

