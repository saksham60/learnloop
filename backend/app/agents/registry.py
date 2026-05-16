from __future__ import annotations

from app.agents.base_agent import BaseAgent
from app.agents.specialist.content_curator_agent import ContentCuratorAgent
from app.agents.specialist.growth_coach_agent import GrowthCoachAgent
from app.agents.specialist.homework_coach_agent import HomeworkCoachAgent
from app.agents.specialist.intent_router_agent import StudentIntentRouterAgent
from app.agents.specialist.learning_compass_agent import LearningCompassAgent
from app.agents.specialist.progress_analyst_agent import ProgressAnalystAgent
from app.agents.specialist.safety_pedagogy_evaluator_agent import SafetyPedagogyEvaluatorAgent
from app.agents.specialist.socratic_tutor_agent import SocraticTutorAgent
from app.agents.specialist.teacher_insight_agent import TeacherInsightAgent
from app.agents.tools.analytics_tool import AnalyticsTool
from app.agents.tools.base_tool import BaseTool
from app.agents.tools.content_search_tool import ContentSearchTool
from app.agents.tools.focus_area_tool import FocusAreaTool
from app.agents.tools.homework_tool import HomeworkTool
from app.agents.tools.practice_generator_tool import PracticeGeneratorTool
from app.agents.tools.progress_query_tool import ProgressQueryTool
from app.agents.tools.student_memory_tool import StudentMemoryTool
from app.agents.tools.sync_tool import SyncTool
from app.agents.tools.vector_retrieval_tool import VectorRetrievalTool


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {
            agent.name: agent
            for agent in [
                StudentIntentRouterAgent(),
                SocraticTutorAgent(),
                HomeworkCoachAgent(),
                ProgressAnalystAgent(),
                LearningCompassAgent(),
                ContentCuratorAgent(),
                TeacherInsightAgent(),
                GrowthCoachAgent(),
                SafetyPedagogyEvaluatorAgent(),
            ]
        }
        self._tools: dict[str, BaseTool] = {
            tool.name: tool
            for tool in [
                ProgressQueryTool(),
                HomeworkTool(),
                VectorRetrievalTool(),
                FocusAreaTool(),
                ContentSearchTool(),
                PracticeGeneratorTool(),
                StudentMemoryTool(),
                AnalyticsTool(),
                SyncTool(),
            ]
        }

    def get_agent(self, name: str) -> BaseAgent:
        return self._agents[name]

    def get_tool(self, name: str) -> BaseTool:
        return self._tools[name]

