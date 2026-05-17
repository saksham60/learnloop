from __future__ import annotations

import json
import re

from app.core.config import Settings
from app.llm.exceptions import InvalidLLMResponseError, LLMUnavailableError, UnsupportedProviderError
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

    def _sanitize_model_text(self, text: str) -> str:
        sanitized = re.sub(r"<thought>.*?</thought>", "", text, flags=re.IGNORECASE | re.DOTALL)
        sanitized = re.sub(r"<think>.*?</think>", "", sanitized, flags=re.IGNORECASE | re.DOTALL)
        sanitized = sanitized.strip()
        return sanitized or text.strip()

    def _extract_progress_count(self, label: str, structured_summary: str) -> int | None:
        match = re.search(rf"{re.escape(label)}:\s*(\d+)", structured_summary, flags=re.IGNORECASE)
        return int(match.group(1)) if match else None

    def _contains_progress_phrase(self, phrase: str, structured_summary: str) -> bool:
        return phrase.lower() in structured_summary.lower()

    def _fallback_progress_answer(self, structured_summary: str, user_question: str) -> str:
        question = user_question.lower()
        pending_homework = self._extract_progress_count("Pending homework", structured_summary)
        completed_homework = self._extract_progress_count("Completed homework", structured_summary)
        has_focus_areas = not self._contains_progress_phrase("No active focus areas.", structured_summary)
        has_topic_data = not self._contains_progress_phrase("No topic performance data available.", structured_summary)
        growth_match = re.search(
            r"Growth recommendations:\s*(.+)",
            structured_summary,
            flags=re.IGNORECASE | re.DOTALL,
        )
        growth_recommendation = growth_match.group(1).strip() if growth_match else None

        if "what should i study" in question or ("study" in question and "today" in question):
            if pending_homework and pending_homework > 0:
                return (
                    f"Start with your pending homework first. LearnLoop currently shows "
                    f"{pending_homework} homework item(s) still pending."
                )
            if has_focus_areas:
                return (
                    "Start with your current focus areas first. LearnLoop has already marked them as your "
                    "best study priority for today."
                )
            if not has_topic_data:
                response = (
                    "There is not a specific study priority listed in LearnLoop right now. "
                    "You have no pending homework, no active focus areas, and no topic performance data yet."
                )
                if growth_recommendation:
                    response += f" After study time, {growth_recommendation.lower()}"
                return response

        if "homework" in question and ("which" in question or "pending" in question or "what" in question):
            if pending_homework is None:
                return "LearnLoop does not have a homework summary available right now."
            if pending_homework == 0:
                return (
                    f"You do not have any pending homework right now. "
                    f"Completed homework recorded in LearnLoop: {completed_homework or 0}."
                )
            return f"You currently have {pending_homework} pending homework item(s) in LearnLoop."

        if "weak" in question or "improve" in question or "improved" in question:
            if not has_topic_data:
                return (
                    "LearnLoop does not have topic performance data yet, so it cannot identify a weak area or "
                    "measure improvement right now."
                )

        if "hint" in question:
            return (
                "The current progress summary does not include hint-usage details yet, so LearnLoop cannot explain "
                "that from this snapshot."
            )

        response = "Here is your current LearnLoop summary: "
        if pending_homework is not None:
            response += f"{pending_homework} pending homework item(s). "
        if completed_homework is not None:
            response += f"{completed_homework} completed homework item(s). "
        if has_focus_areas:
            response += "You have active focus areas to work through. "
        else:
            response += "You do not have active focus areas listed right now. "
        if not has_topic_data:
            response += "Topic performance data is not available yet. "
        if growth_recommendation:
            response += growth_recommendation
        return response.strip()

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
        raw_text = await self._gemma_client.generate(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return self._sanitize_model_text(raw_text)

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
        try:
            return await self.generate_text(
                system_prompt=FOCUS_SYSTEM_PROMPT,
                user_prompt=structured_focus_summary,
            )
        except LLMUnavailableError:
            return (
                "These focus areas were chosen from recent attempts, hint usage, and unfinished "
                "practice. Start with the top item and complete one short practice step."
            )

    async def generate_socratic_response(self, structured_prompt: str) -> str:
        try:
            return await self.generate_text(
                system_prompt=SOCRATIC_SYSTEM_PROMPT,
                user_prompt=structured_prompt,
            )
        except LLMUnavailableError:
            lowered = structured_prompt.lower()
            if "decision: explain" in lowered:
                return (
                    "You have put in effort, so here is the next step: restate the key idea in your "
                    "own words, solve one small part, then check if that moves you closer to the full answer."
                )
            if "give one short hint" in lowered or "decision: hint" in lowered:
                return "Start by identifying what the question is asking and write down the first fact or formula you already know."
            return "Let us work step by step. What have you already tried, and which part feels unclear right now?"

    async def generate_homework_hint(self, structured_prompt: str) -> str:
        try:
            return await self.generate_text(
                system_prompt=HOMEWORK_HINT_SYSTEM_PROMPT,
                user_prompt=structured_prompt,
            )
        except LLMUnavailableError:
            return "Break the problem into one smaller step, write your first attempt, and then compare it with the question requirements."

    async def generate_progress_answer(self, structured_summary: str, user_question: str) -> str:
        try:
            return await self.generate_text(
                system_prompt=PROGRESS_SYSTEM_PROMPT,
                user_prompt=f"Summary:\n{structured_summary}\n\nQuestion:\n{user_question}",
            )
        except LLMUnavailableError:
            return self._fallback_progress_answer(structured_summary, user_question)

    async def evaluate_response(self, response_text: str) -> SafetyCheckResult:
        # Deterministic enforcement happens locally first; the LLM prompt is reserved for future policy expansion.
        _ = SAFETY_SYSTEM_PROMPT
        return await self.safety_check(response_text)
