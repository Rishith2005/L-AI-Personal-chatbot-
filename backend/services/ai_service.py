"""
L AI Backend — AI Service

Provider-independent interface for LLM interaction.
The rest of the application communicates only with this service.
Switching providers requires changing only the adapter instantiation.
"""

import logging
from typing import AsyncIterator

from ai.base_adapter import BaseLLMAdapter
from ai.huggingface_adapter import HuggingFaceAdapter
from core.config import get_settings

logger = logging.getLogger(__name__)

_adapter_instance: BaseLLMAdapter | None = None


def get_ai_adapter() -> BaseLLMAdapter:
    """
    Return the active LLM adapter (singleton).
    Currently uses HuggingFace; future versions may select
    based on configuration (OpenAI, Gemini, Ollama, etc.).
    """
    global _adapter_instance
    if _adapter_instance is None:
        _adapter_instance = HuggingFaceAdapter()
    return _adapter_instance


class AIService:
    """
    Provider-independent AI service.
    Delegates inference to the active adapter via the Adapter Pattern.
    """

    def __init__(self):
        self.adapter = get_ai_adapter()
        self.settings = get_settings()

    async def stream_response(
        self,
        messages: list[dict],
    ) -> AsyncIterator[str]:
        """
        Stream tokens from the LLM.
        Includes retry logic for transient failures (1 retry).
        """
        try:
            async for token in self.adapter.generate(
                messages=messages,
                max_tokens=self.settings.max_tokens,
                temperature=self.settings.temperature,
                stream=True,
            ):
                yield token
        except Exception as e:
            logger.warning(f"First attempt failed, retrying: {e}")
            try:
                async for token in self.adapter.generate(
                    messages=messages,
                    max_tokens=self.settings.max_tokens,
                    temperature=self.settings.temperature,
                    stream=True,
                ):
                    yield token
            except Exception as retry_error:
                logger.error(f"AI generation failed after retry: {retry_error}")
                raise

    async def generate_response(self, messages: list[dict]) -> str:
        """
        Generate a complete response (non-streaming fallback).
        """
        return await self.adapter.generate_sync(
            messages=messages,
            max_tokens=self.settings.max_tokens,
            temperature=self.settings.temperature,
        )
