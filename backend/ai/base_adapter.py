"""
L AI Backend — Base LLM Adapter Interface

Abstract base class that every LLM provider adapter must implement.
This ensures the rest of the application remains provider-independent.
Switching providers should require only creating a new adapter — no changes
to business logic, API routes, or frontend.
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator


class BaseLLMAdapter(ABC):
    """
    Provider-independent interface for Large Language Model interaction.

    Every adapter must implement:
        - generate(): streaming token generation
        - generate_sync(): blocking full response (fallback)
    """

    @abstractmethod
    async def generate(
        self,
        messages: list[dict],
        max_tokens: int = 2048,
        temperature: float = 0.7,
        stream: bool = True,
    ) -> AsyncIterator[str]:
        """
        Generate a response from the LLM, yielding tokens as they arrive.

        Args:
            messages: List of message dicts with 'role' and 'content' keys.
            max_tokens: Maximum tokens to generate.
            temperature: Sampling temperature (0.0–1.0).
            stream: Whether to stream tokens or return the full response.

        Yields:
            Individual tokens as strings.
        """
        ...

    @abstractmethod
    async def generate_sync(
        self,
        messages: list[dict],
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate a complete response without streaming (fallback).

        Returns:
            The full generated text as a string.
        """
        ...
