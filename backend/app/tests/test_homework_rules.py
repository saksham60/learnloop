from __future__ import annotations

from app.core.config import Settings
from app.features.homework.rule_engine import HomeworkGuidanceState, HomeworkRuleEngine


def test_homework_attempt_first_rule_blocks_explanation_without_attempt() -> None:
    settings = Settings(_env_file=None)
    engine = HomeworkRuleEngine(settings)

    decision = engine.evaluate(HomeworkGuidanceState(attempts_count=0, hints_used=0))

    assert decision.allow_explanation is False
    assert decision.allow_direct_answer is False
    assert "attempt" in decision.reason.lower()

