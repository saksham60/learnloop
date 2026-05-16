from __future__ import annotations

from app.agents.registry import AgentRegistry
from app.agents.specialist.intent_router_agent import StudentIntentRouterAgent
from app.agents.specialist.safety_pedagogy_evaluator_agent import SafetyPedagogyEvaluatorAgent
from app.agents.state import AgentContext


class AgentOrchestrator:
    def __init__(self, registry: AgentRegistry) -> None:
        self._registry = registry
        self._router: StudentIntentRouterAgent = registry.get_agent("StudentIntentRouterAgent")  # type: ignore[assignment]
        self._evaluator: SafetyPedagogyEvaluatorAgent = registry.get_agent("SafetyPedagogyEvaluatorAgent")  # type: ignore[assignment]

    async def choose_specialist(self, context: AgentContext):
        selected = await self._router.route(context)
        context.selected_agent = selected
        return self._registry.get_agent(selected)

    async def evaluate_response(self, context: AgentContext, response_text: str) -> dict:
        return await self._evaluator.evaluate(context, response_text)

