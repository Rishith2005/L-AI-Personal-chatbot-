"""
L AI Backend — Hugging Face LLM Adapter

Concrete implementation of BaseLLMAdapter for Hugging Face Inference API.
Uses the huggingface_hub InferenceClient for chat completions with streaming.
Default model: deepseek-ai/DeepSeek-V4-Pro
"""

import logging
from typing import AsyncIterator

from huggingface_hub import InferenceClient

from ai.base_adapter import BaseLLMAdapter
from core.config import get_settings

logger = logging.getLogger(__name__)


class HuggingFaceAdapter(BaseLLMAdapter):
    """
    Adapter for Hugging Face Inference API.
    Implements streaming chat completion using InferenceClient.
    """

    def __init__(self):
        settings = get_settings()
        token = settings.hf_access_token
        self.is_mock = not token or "your-huggingface-access-token" in token

        if self.is_mock:
            self.client = None
            logger.info("HuggingFace adapter initialized in MOCK OFFLINE DEMO mode (no valid token).")
        else:
            self.client = InferenceClient(
                token=token,
            )
            logger.info(f"HuggingFace adapter initialized with model: {settings.model_name}")
        self.model = settings.model_name

    async def generate(
        self,
        messages: list[dict],
        max_tokens: int = 2048,
        temperature: float = 0.7,
        stream: bool = True,
    ) -> AsyncIterator[str]:
        """
        Stream tokens from Hugging Face chat completion.

        The huggingface_hub InferenceClient.chat_completion returns a
        synchronous iterator when stream=True. We wrap it for async compatibility.
        """
        if self.is_mock:
            import asyncio
            user_message = messages[-1]["content"] if messages else ""
            
            mock_text = (
                "👋 **Welcome to L AI!**\n\n"
                "I am running in **Offline/Demo Mode** because no valid Hugging Face Access Token was found in your settings. "
                "To get live AI responses from the cloud, please update the `HF_ACCESS_TOKEN` in your `backend/.env` file.\n\n"
                f"Here is a mock analysis of your prompt *\"{user_message}\"*:\n\n"
                "### Feature Verification Checklist\n"
                "- [x] **Routing & RLS Bypass**: Guest authentication is simulated and working.\n"
                "- [x] **SSE Streaming Pipeline**: Message tokens are successfully parsed and displayed in real-time.\n"
                "- [x] **Markdown & Code Render**: Beautiful rich styling and Prism syntax highlighting are operational.\n\n"
                "### Code Block Demo\n"
                "```python\n"
                "# To activate real AI responses, configure backend/.env:\n"
                "HF_ACCESS_TOKEN=\"your_actual_token_here\"\n"
                "MODEL_NAME=\"deepseek-ai/DeepSeek-V4-Pro\"\n"
                "```\n\n"
                "Feel free to create new conversations, rename/delete them, search the history, and explore settings!"
            )
            
            # Yield chunk-by-chunk to simulate streaming
            words = mock_text.split(" ")
            for word in words:
                yield word + " "
                await asyncio.sleep(0.03)
            return

        try:
            response_stream = self.client.chat_completion(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
            )

            for chunk in response_stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    yield token

        except Exception as e:
            logger.error(f"HuggingFace streaming error: {e}")
            raise

    async def generate_sync(
        self,
        messages: list[dict],
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate a complete response without streaming (fallback).
        """
        if self.is_mock:
            user_message = messages[-1]["content"] if messages else ""
            return (
                "👋 **Welcome to L AI!**\n\n"
                "I am running in **Offline/Demo Mode** because no valid Hugging Face Access Token was found in your settings. "
                "To get live AI responses from the cloud, please update the `HF_ACCESS_TOKEN` in your `backend/.env` file.\n\n"
                f"You said: *\"{user_message}\"*"
            )

        try:
            response = self.client.chat_completion(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False,
            )

            if response.choices:
                return response.choices[0].message.content or ""
            return ""

        except Exception as e:
            logger.error(f"HuggingFace sync generation error: {e}")
            raise
