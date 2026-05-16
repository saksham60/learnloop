from __future__ import annotations

import json

from app.core.config import Settings
from app.llm.exceptions import InvalidLLMResponseError, UnsupportedProviderError
from app.llm.gemma_client import GemmaClient
from app.llm.prompts.focus_prompts import FOCUS_SYSTEM_PROMPT
from app.llm.prompts.homework_prompts import HOMEWORK_HINT_SYSTEM_PROMPT
from app.llm.prompts.progress_prompts import PROGRESS_SYSTEM_PROMPT
from app.llm.prompts.safety_prompts import SAFETY_SYSTEM_PROMPT
from app.llm.prompts.socratic_prompts import SOCRATIC_SYSTEM_PROMPT
from app.llm.schemas import LLMMessage, SafetyCheckResult


class LLMGateway:
    def __init__(self, settings: Settings, gemma_client: GemmaClient | None = None) -> None:
        self._settings = settings
        self._ensure_gemma_only()
        self._gemma_client = gemma_client or GemmaClient(settings)

    def _ensure_gemma_only(self) -> None:
        if self._settings.llm_provider != "gemma":
            raise UnsupportedProviderError("The backend only allows the gemma provider.")
        if self._settings.llm_allowed_providers != ["gemma"]:
            raise UnsupportedProviderError("LLM_ALLOWED_PROVIDERS must only contain gemma.")
        if not self._settings.gemma_model.startswith("gemma-4"):
            raise UnsupportedProviderError("The backend only allows Gemma 4 models.")

    async def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        messages = [
            LLMMessage(role="system", content=system_prompt),
            LLMMessage(role="user", content=user_prompt),
        ]
        return await self._gemma_client.generate(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    async def generate_json(self, *, system_prompt: str, user_prompt: str) -> dict:
        raw = await self.generate_text(
            system_prompt=system_prompt,
            user_prompt=f"{user_prompt}\nReturn valid JSON only.",
        )
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise InvalidLLMResponseError("Gemma did not return valid JSON.") from exc

    async def safety_check(self, response_text: str) -> SafetyCheckResult:
        flags: list[str] = []
        lowered = response_text.lower()
        if "final answer:" in lowered or "copy this answer" in lowered:
            flags.append("answer_dump")
        if self._settings.anti_answer_dump_enabled and flags:
            return SafetyCheckResult(allowed=False, reason="Response violates anti-answer-dump policy.", flags=flags)
        return SafetyCheckResult(allowed=True, reason="Response passed deterministic safety checks.", flags=flags)

    async def explain_focus_area(self, structured_focus_summary: str) -> str:
        return await self.generate_text(
            system_prompt=FOCUS_SYSTEM_PROMPT,
            user_prompt=structured_focus_summary,
        )

    async def generate_socratic_response(self, structured_prompt: str) -> str:
        return await self.generate_text(
            system_prompt=SOCRATIC_SYSTEM_PROMPT,
            user_prompt=structured_prompt,
        )

    async def generate_homework_hint(self, structured_prompt: str) -> str:
        return await self.generate_text(
            system_prompt=HOMEWORK_HINT_SYSTEM_PROMPT,
            user_prompt=structured_prompt,
        )

    async def generate_progress_answer(self, structured_summary: str, user_question: str) -> str:
        return await self.generate_text(
            system_prompt=PROGRESS_SYSTEM_PROMPT,
            user_prompt=f"Summary:\n{structured_summary}\n\nQuestion:\n{user_question}",
        )

    async def evaluate_response(self, response_text: str) -> SafetyCheckResult:
        # Deterministic enforcement happens locally first; the LLM prompt is reserved for future policy expansion.
        _ = SAFETY_SYSTEM_PROMPT
        return await self.safety_check(response_text)

