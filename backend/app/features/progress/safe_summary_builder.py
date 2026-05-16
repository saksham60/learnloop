from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class TopicPerformance:
    subject: str
    topic: str
    score: float
    hints_used: int
    attempts: int


@dataclass(slots=True)
class ProgressSnapshot:
    pending_homework_count: int
    completed_homework_count: int
    focus_titles: list[str] = field(default_factory=list)
    topic_performance: list[TopicPerformance] = field(default_factory=list)
    growth_recommendations: list[str] = field(default_factory=list)


class SafeSummaryBuilder:
    def build(self, snapshot: ProgressSnapshot) -> str:
        topic_lines = [
            f"- {item.subject}/{item.topic}: score={item.score:.1f}, attempts={item.attempts}, hints={item.hints_used}"
            for item in snapshot.topic_performance
        ] or ["- No topic performance data available."]

        growth_lines = snapshot.growth_recommendations or ["No growth recommendations available."]
        focus_lines = snapshot.focus_titles or ["No active focus areas."]

        return "\n".join(
            [
                f"Pending homework: {snapshot.pending_homework_count}",
                f"Completed homework: {snapshot.completed_homework_count}",
                "Focus areas:",
                *focus_lines,
                "Topic performance:",
                *topic_lines,
                "Growth recommendations:",
                *growth_lines,
            ]
        )

