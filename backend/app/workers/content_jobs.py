from __future__ import annotations


async def process_content_job(content_id: str) -> dict:
    return {"content_id": content_id, "status": "scheduled"}

