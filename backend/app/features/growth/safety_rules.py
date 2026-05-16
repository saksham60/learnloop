from __future__ import annotations


class GrowthSafetyRules:
    def is_activity_allowed(self, activity_type: str) -> bool:
        return activity_type in {
            "sports",
            "exercise",
            "communication",
            "life_skills",
            "coding",
            "creativity",
        }

