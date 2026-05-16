from __future__ import annotations


async def recalculate_teacher_analytics_job(class_id: str) -> dict:
    return {"class_id": class_id, "status": "scheduled"}

