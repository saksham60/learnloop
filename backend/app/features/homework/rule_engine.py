from __future__ import annotations

from dataclasses import dataclass

from app.core.config import Settings


@dataclass(slots=True)
class HomeworkGuidanceState:
    attempts_count: int = 0
    hints_used: int = 0
    student_said_stuck: bool = False


@dataclass(slots=True)
class HomeworkDecision:
    allow_hint: bool
    allow_explanation: bool
    allow_direct_answer: bool
    reason: str


class HomeworkRuleEngine:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def can_request_hint(self, state: HomeworkGuidanceState) -> bool:
        return state.hints_used < self._settings.max_hints_per_question

    def can_explain(self, state: HomeworkGuidanceState) -> bool:
        return state.student_said_stuck or state.attempts_count >= self._settings.explain_after_attempts

    def evaluate(self, state: HomeworkGuidanceState) -> HomeworkDecision:
        allow_hint = self.can_request_hint(state)
        allow_explanation = self.can_explain(state)
        allow_direct_answer = self._settings.direct_answer_allowed_by_default and allow_explanation

        if state.attempts_count == 0 and self._settings.homework_attempt_first:
            return HomeworkDecision(
                allow_hint=allow_hint,
                allow_explanation=False,
                allow_direct_answer=False,
                reason="Student must attempt the homework before explanation or direct answers.",
            )
        if not allow_hint and not allow_explanation:
            return HomeworkDecision(
                allow_hint=False,
                allow_explanation=False,
                allow_direct_answer=False,
                reason="Hint limit reached and explanation threshold not yet met.",
            )
        if allow_explanation and not allow_direct_answer:
            return HomeworkDecision(
                allow_hint=allow_hint,
                allow_explanation=True,
                allow_direct_answer=False,
                reason="Student has earned a worked explanation, but not a direct answer dump.",
            )
        return HomeworkDecision(
            allow_hint=allow_hint,
            allow_explanation=allow_explanation,
            allow_direct_answer=allow_direct_answer,
            reason="Homework guidance is allowed under the current policy.",
        )

