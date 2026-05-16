from __future__ import annotations


class LLMError(Exception):
    """Base LLM gateway exception."""


class UnsupportedProviderError(LLMError):
    """Raised when a non-Gemma provider or model is configured."""


class InvalidLLMResponseError(LLMError):
    """Raised when the model gateway returns malformed data."""

