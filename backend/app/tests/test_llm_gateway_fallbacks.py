from __future__ import annotations

import pytest

from app.core.config import Settings
from app.llm.exceptions import LLMUnavailableError
from app.llm.gateway import LLMGateway
from app.llm.schemas import LLMMessage


class UnavailableGemmaClient:
    async def generate(self, messages: list[LLMMessage], *, temperature=None, max_tokens=None) -> str:
        raise LLMUnavailableError("gateway down")


@pytest.mark.asyncio
async def test_socratic_response_falls_back_when_gateway_is_unavailable() -> None:
    gateway = LLMGateway(Settings(_env_file=None), gemma_client=UnavailableGemmaClient())

    response = await gateway.generate_socratic_response("Decision: guide\nStudent message: help")

    assert "step by step" in response.lower()


@pytest.mark.asyncio
async def test_progress_answer_falls_back_when_gateway_is_unavailable() -> None:
    gateway = LLMGateway(Settings(_env_file=None), gemma_client=UnavailableGemmaClient())

    response = await gateway.generate_progress_answer("pending homework: 2", "What should I study today?")

    assert "gateway is unavailable" in response.lower()
