from __future__ import annotations

import pytest

from app.core.config import Settings
from app.llm.exceptions import UnsupportedProviderError
from app.llm.gateway import LLMGateway


def test_gateway_rejects_non_gemma_configuration() -> None:
    settings = Settings(_env_file=None).model_copy(
        update={
            "llm_provider": "openai",
            "llm_allowed_providers": ["openai"],
            "gemma_model": "gpt-4o",
        }
    )

    with pytest.raises(UnsupportedProviderError):
        LLMGateway(settings)

