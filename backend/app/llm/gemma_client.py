from __future__ import annotations

from typing import Any

import httpx

from app.core.config import Settings
from app.llm.exceptions import InvalidLLMResponseError, LLMUnavailableError
from app.llm.schemas import LLMMessage


class GemmaClient:
    """OpenAI-compatible client constrained to Gemma 4 models."""

    def __init__(self, settings: Settings, http_client: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self._http_client = http_client

    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        payload: dict[str, Any] = {
            "model": self._settings.gemma_model,
            "messages": [message.model_dump() for message in messages],
            "temperature": temperature if temperature is not None else self._settings.gemma_temperature,
            "max_tokens": max_tokens if max_tokens is not None else self._settings.gemma_max_tokens,
        }

        close_after = self._http_client is None
        client = self._http_client or httpx.AsyncClient(
            base_url=self._settings.gemma_api_base_url.rstrip("/"),
            timeout=self._settings.gemma_timeout_seconds,
            headers={
                "Authorization": f"Bearer {self._settings.gemma_api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            try:
                response = await client.post("/chat/completions", json=payload)
                response.raise_for_status()
                data = response.json()
            except httpx.HTTPError as exc:
                raise LLMUnavailableError(
                    f"Gemma gateway is unavailable or misconfigured: {self._settings.gemma_api_base_url}",
                ) from exc
        finally:
            if close_after:
                await client.aclose()

        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise InvalidLLMResponseError("Gemma gateway returned an unexpected response shape.") from exc
