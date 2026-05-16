from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone


@dataclass(slots=True)
class FocusInput:
    subject: str
    topic: str
    wrong_attempts: int = 0
    hints_used: int = 0
    homework_due_at: datetime | None = None
    repeated_misconception: bool = False
    average_score: float | None = None
    missed_activity: bool = False
    stale_practice_days: int = 0


@dataclass(slots=True)
class ScoredFocusArea:
    subject: str
    topic: str
    score: float
    drivers: list[str] = field(default_factory=list)


class FocusScoringEngine:
    def score(self, items: list[FocusInput], *, now: datetime | None = None) -> list[ScoredFocusArea]:
        reference_time = now or datetime.now(timezone.utc)
        scored: list[ScoredFocusArea] = []

        for item in items:
            score = 0.0
            drivers: list[str] = []

            if item.wrong_attempts >= 3:
                score += 3.0
                drivers.append("wrong_attempts>=3")
            elif item.wrong_attempts > 0:
                score += float(item.wrong_attempts)
                drivers.append("wrong_attempts")

            if item.hints_used >= 3:
                score += 2.5
                drivers.append("hints_used>=3")
            elif item.hints_used > 0:
                score += item.hints_used * 0.5
                drivers.append("hints_used")

            if item.homework_due_at and item.homework_due_at <= reference_time + timedelta(days=2):
                score += 2.0
                drivers.append("homework_due_soon")

            if item.repeated_misconception:
                score += 3.0
                drivers.append("repeated_misconception")

            if item.average_score is not None and item.average_score < 0.6:
                score += 2.0
                drivers.append("low_score")

            if item.missed_activity:
                score += 1.5
                drivers.append("missed_activity")

            if item.stale_practice_days >= 7:
                score += 1.5
                drivers.append("stale_practice")

            if score > 0:
                scored.append(
                    ScoredFocusArea(
                        subject=item.subject,
                        topic=item.topic,
                        score=round(score, 2),
                        drivers=drivers,
                    )
                )

        return sorted(scored, key=lambda area: area.score, reverse=True)

