from __future__ import annotations


async def refresh_focus_job(student_id: str) -> dict:
    return {"student_id": student_id, "status": "scheduled"}

