from __future__ import annotations

import os

import pytest

from app.core.config import get_settings


@pytest.fixture(autouse=True)
def reset_settings_cache(monkeypatch: pytest.MonkeyPatch):
    defaults = {
        "APP_NAME": "AI Student Companion API",
        "APP_ENV": "test",
        "APP_DEBUG": "false",
        "DATABASE_URL": "postgresql+asyncpg://postgres:postgres@localhost:5432/student_companion",
        "SUPABASE_JWT_SECRET": "test-secret",
        "LLM_PROVIDER": "gemma",
        "LLM_ALLOWED_PROVIDERS": "gemma",
        "GEMMA_API_BASE_URL": "https://example-gateway.local/v1",
        "GEMMA_API_KEY": "test-gemma-key",
        "GEMMA_MODEL": "gemma-4",
    }
    for key, value in defaults.items():
        monkeypatch.setenv(key, value)
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()

