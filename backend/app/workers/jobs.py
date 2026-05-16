from __future__ import annotations


class JobDispatcher:
    async def enqueue(self, job_name: str, payload: dict) -> dict:
        return {"job_name": job_name, "payload": payload, "status": "queued"}

