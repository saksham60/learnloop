from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.agents.loop import AgentLoop
from app.agents.orchestrator import AgentOrchestrator
from app.agents.state import AgentLoopInput
from app.agents.tracing.trace_service import TraceService
from app.api.dependencies import SessionDep, get_agent_registry, get_authenticated_user, get_llm_gateway, get_settings
from app.api.v1.agents.schemas import AgentRunRequest
from app.api.v1.responses import APIResponse
from app.core.constants import Role
from app.features.analytics.service import AnalyticsService
from app.features.auth.permissions import ensure_not_pending
from app.features.focus.service import FocusService
from app.features.homework.service import HomeworkService
from app.features.progress.service import ProgressService
from app.db.repositories.event_repository import EventRepository

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/run", response_model=APIResponse[dict])
async def run_agent(
    payload: AgentRunRequest,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_not_pending(current_user)
    settings = get_settings()
    llm_gateway = get_llm_gateway()
    services = {
        "current_user": current_user,
        "llm_gateway": llm_gateway,
        "progress_service": ProgressService(session, llm_gateway),
        "focus_service": FocusService(session, llm_gateway),
        "homework_service": HomeworkService(session, settings),
        "analytics_service": AnalyticsService(session),
    }
    trace_service = TraceService(session)
    loop = AgentLoop(
        trace_service=trace_service,
        orchestrator=AgentOrchestrator(get_agent_registry()),
        registry=get_agent_registry(),
        event_logger=EventRepository(session),
    )
    result = await loop.run(
        AgentLoopInput(
            user_id=current_user.user_id,
            role=current_user.role,
            session_id=payload.session_id,
            request_type=payload.request_type,
            user_message=payload.user_message,
            metadata=payload.metadata,
        ),
        services=services,
    )
    await session.commit()
    return APIResponse(
        data={
            "run_id": str(result.run_id),
            "selected_agent": result.selected_agent,
            "response": result.response,
            "observation_count": len(result.observations),
        }
    )


@router.get("/runs/{run_id}", response_model=APIResponse[dict])
async def get_agent_run(
    run_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[dict]:
    ensure_not_pending(current_user)
    trace_service = TraceService(session)
    run = await trace_service.get_run(run_id)
    return APIResponse(
        data={
            "id": str(run.id) if run else None,
            "status": run.status.value if run else None,
            "request_type": run.request_type if run else None,
            "final_response": run.final_response if run else None,
        }
    )


@router.get("/runs/{run_id}/steps", response_model=APIResponse[list[dict]])
async def get_agent_steps(
    run_id: UUID,
    session: SessionDep,
    current_user=Depends(get_authenticated_user),
) -> APIResponse[list[dict]]:
    ensure_not_pending(current_user)
    trace_service = TraceService(session)
    steps = await trace_service.list_steps(run_id)
    return APIResponse(
        data=[
            {
                "id": str(step.id),
                "step_name": step.step_name,
                "agent_name": step.agent_name,
                "input": step.input_json,
                "output": step.output_json,
            }
            for step in steps
        ]
    )
