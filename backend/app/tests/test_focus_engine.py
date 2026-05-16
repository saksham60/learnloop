from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.features.focus.focus_scoring_engine import FocusInput, FocusScoringEngine


def test_focus_engine_prioritizes_high_risk_topics() -> None:
    engine = FocusScoringEngine()
    now = datetime.now(timezone.utc)
    scored = engine.score(
        [
            FocusInput(
                subject="Maths",
                topic="Fractions",
                wrong_attempts=4,
                hints_used=3,
                repeated_misconception=True,
                homework_due_at=now + timedelta(hours=12),
                average_score=0.4,
            ),
            FocusInput(subject="Science", topic="Plants", wrong_attempts=1, hints_used=0, average_score=0.8),
        ],
        now=now,
    )

    assert scored[0].subject == "Maths"
    assert "repeated_misconception" in scored[0].drivers
    assert scored[0].score > scored[1].score

