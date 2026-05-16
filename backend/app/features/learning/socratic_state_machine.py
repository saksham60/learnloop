from __future__ import annotations

from dataclasses import dataclass

from app.core.config import Settings


@dataclass(slots=True)
class SocraticState:
    attempts_count: int = 0
    hints_used: int = 0
    student_said_stuck: bool = False
    explain_requested: bool = False


@dataclass(slots=True)
class SocraticDecision:
    action: str
    reason: str


class SocraticStateMachine:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def next_action(self, state: SocraticState) -> SocraticDecision:
        if state.attempts_count == 0:
            return SocraticDecision("guide", "Ask a guiding question before offering explanation.")
        if state.hints_used < self._settings.max_hints_per_question and not state.explain_requested:
            return SocraticDecision("hint", "Offer the next hint in the Socratic sequence.")
        if state.student_said_stuck or state.attempts_count >= self._settings.explain_after_attempts:
            return SocraticDecision("explain", "Provide explanation after sufficient effort or explicit stuck signal.")
        return SocraticDecision("guide", "Continue with a reflective question.")

