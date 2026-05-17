from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import Settings
from app.llm.exceptions import InvalidLLMResponseError, LLMUnavailableError
from app.llm.schemas import LLMMessage

logger = logging.getLogger(__name__)


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
                status_code = exc.response.status_code if isinstance(exc, httpx.HTTPStatusError) else None
                response_body = exc.response.text[:500] if isinstance(exc, httpx.HTTPStatusError) else None
                logger.warning(
                    "Gemma gateway request failed",
                    extra={
                        "gemma_api_base_url": self._settings.gemma_api_base_url,
                        "gemma_model": self._settings.gemma_model,
                        "status_code": status_code,
                        "response_body": response_body,
                        "error": str(exc),
                    },
                )
                raise LLMUnavailableError(
                    "Gemma gateway is unavailable or misconfigured."
                ) from exc
        finally:
            if close_after:
                await client.aclose()

        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise InvalidLLMResponseError("Gemma gateway returned an unexpected response shape.") from exc
