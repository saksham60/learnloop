from __future__ import annotations


class TeacherInsightsBuilder:
    def build_summary(self, analytics: dict, weak_topics: list[dict], misconceptions: list[dict]) -> dict:
        return {
            "analytics": analytics,
            "weak_topics": weak_topics,
            "misconceptions": misconceptions,
        }

