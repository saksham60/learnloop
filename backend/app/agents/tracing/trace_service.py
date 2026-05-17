from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AgentRunStatus, Role
from app.core.time import utcnow_naive
from app.db.models.agent_trace import AgentRun, AgentStep, AgentToolCall


class TraceService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def start_run(
        self,
        *,
        user_id: UUID | None,
        role: Role | None,
        session_id: UUID | None,
        request_type: str,
        metadata: dict,
    ) -> AgentRun:
        run = AgentRun(
            user_id=user_id,
            role=role,
            session_id=session_id,
            request_type=request_type,
            status=AgentRunStatus.RUNNING,
            final_response=None,
            metadata_json=metadata,
            created_at=utcnow_naive(),
            completed_at=None,
        )
        self._session.add(run)
        await self._session.flush()
        return run

    async def log_step(
        self,
        *,
        agent_run_id: UUID,
        step_name: str,
        agent_name: str,
        input_payload: dict,
        output_payload: dict,
    ) -> AgentStep:
        step = AgentStep(
            agent_run_id=agent_run_id,
            step_name=step_name,
            agent_name=agent_name,
            input_json=input_payload,
            output_json=output_payload,
            created_at=utcnow_naive(),
        )
        self._session.add(step)
        await self._session.flush()
        return step

    async def log_tool_call(
        self,
        *,
        agent_run_id: UUID,
        tool_name: str,
        input_payload: dict,
        output_payload: dict,
        status: str,
    ) -> AgentToolCall:
        tool_call = AgentToolCall(
            agent_run_id=agent_run_id,
            tool_name=tool_name,
            input_json=input_payload,
            output_json=output_payload,
            status=status,
            created_at=utcnow_naive(),
        )
        self._session.add(tool_call)
        await self._session.flush()
        return tool_call

    async def complete_run(self, *, agent_run_id: UUID, final_response: str) -> None:
        run = await self._session.get(AgentRun, agent_run_id)
        if run is None:
            return
        run.status = AgentRunStatus.COMPLETED
        run.final_response = final_response
        run.completed_at = utcnow_naive()
        await self._session.flush()

    async def fail_run(self, *, agent_run_id: UUID, detail: str) -> None:
        run = await self._session.get(AgentRun, agent_run_id)
        if run is None:
            return
        run.status = AgentRunStatus.FAILED
        run.final_response = detail
        run.completed_at = utcnow_naive()
        await self._session.flush()

    async def get_run(self, run_id: UUID) -> AgentRun | None:
        return await self._session.get(AgentRun, run_id)

    async def list_steps(self, run_id: UUID) -> list[AgentStep]:
        result = await self._session.execute(
            select(AgentStep).where(AgentStep.agent_run_id == run_id).order_by(AgentStep.created_at.asc())
        )
        return list(result.scalars().all())
