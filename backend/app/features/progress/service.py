from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.db.repositories.focus_repository import FocusRepository
from app.db.repositories.homework_repository import HomeworkRepository
from app.features.progress.safe_summary_builder import ProgressSnapshot, SafeSummaryBuilder, TopicPerformance
from app.llm.gateway import LLMGateway


class ProgressService:
    def __init__(self, session: AsyncSession, llm_gateway: LLMGateway) -> None:
        self._focus = FocusRepository(session)
        self._homework = HomeworkRepository(session)
        self._llm_gateway = llm_gateway
        self._summary_builder = SafeSummaryBuilder()

    async def build_snapshot(self, current_user: CurrentUser) -> ProgressSnapshot:
        focus_areas = await self._focus.list_student_focus(current_user.user_id)
        homework_items = await self._homework.list_homework(limit=20, offset=0)
        pending = sum(1 for item in homework_items if item.status.value != "submitted")
        completed = sum(1 for item in homework_items if item.status.value == "submitted")
        return ProgressSnapshot(
            pending_homework_count=pending,
            completed_homework_count=completed,
            focus_titles=[item.title for item in focus_areas[:5]],
            topic_performance=[
                TopicPerformance(
                    subject="General",
                    topic=area.title,
                    score=max(0.0, 1.0 - min(area.score / 10.0, 1.0)),
                    hints_used=0,
                    attempts=0,
                )
                for area in focus_areas[:3]
            ],
            growth_recommendations=["Practice one growth activity after study time."],
        )

    async def ask(self, current_user: CurrentUser, question: str) -> dict:
        snapshot = await self.build_snapshot(current_user)
        safe_summary = self._summary_builder.build(snapshot)
        answer = await self._llm_gateway.generate_progress_answer(safe_summary, question)
        return {"answer": answer, "summary_used": safe_summary}

    async def summary(self, current_user: CurrentUser) -> dict:
        snapshot = await self.build_snapshot(current_user)
        return {"summary": self._summary_builder.build(snapshot)}

    async def weak_topics(self, current_user: CurrentUser) -> list[dict]:
        snapshot = await self.build_snapshot(current_user)
        return [
            {"subject": item.subject, "topic": item.topic, "score": item.score}
            for item in snapshot.topic_performance
        ]

