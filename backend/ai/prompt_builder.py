"""
L AI Backend — Prompt Builder

Assembles structured prompts from system instructions, conversation context,
and the current user message. All prompt construction must pass through this
module — API routes and services should never build prompts directly.
"""

import logging
from pathlib import Path

from core.config import get_settings

logger = logging.getLogger(__name__)

# Load system prompt from external file (version-controllable)
_SYSTEM_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "system_prompt.txt"
_system_prompt_cache: str | None = None


def _load_system_prompt() -> str:
    """Load and cache the system prompt from the external template file."""
    global _system_prompt_cache
    if _system_prompt_cache is None:
        try:
            _system_prompt_cache = _SYSTEM_PROMPT_PATH.read_text(encoding="utf-8").strip()
            logger.info("System prompt loaded successfully.")
        except FileNotFoundError:
            logger.warning("System prompt file not found, using default.")
            _system_prompt_cache = (
                "You are L AI, a helpful, intelligent, and concise AI assistant. "
                "Provide clear, well-structured responses. Use markdown formatting "
                "when appropriate, including code blocks with language labels, "
                "tables, lists, and headings. Be direct and informative."
            )
    return _system_prompt_cache


def build_prompt(
    user_message: str,
    context_messages: list[dict] | None = None,
    web_search_context: str | None = None,
) -> list[dict]:
    """
    Assemble the complete messages array for the LLM.

    Structure:
        1. System prompt (AI persona & instructions)
        2. Web search context (if provided — injected into system message)
        3. Conversation context (recent messages, chronological)
        4. Current user message

    Args:
        user_message: The user's current prompt text.
        context_messages: List of previous messages with 'sender' and 'content' keys.
        web_search_context: Formatted web search results to inject into the system prompt.

    Returns:
        List of message dicts with 'role' and 'content' keys,
        ready for the chat completion API.
    """
    messages: list[dict] = []

    # 1. System prompt (with optional web search context appended)
    system_prompt = _load_system_prompt()
    if web_search_context:
        system_prompt += "\n\n" + web_search_context
    messages.append({"role": "system", "content": system_prompt})

    # 2. Conversation context (convert from DB format to chat format)
    if context_messages:
        settings = get_settings()
        # Trim to max context window
        trimmed = context_messages[-settings.max_context_messages:]
        for msg in trimmed:
            role = "user" if msg["sender"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["content"]})

    # 3. Current user message
    messages.append({"role": "user", "content": user_message})

    return messages

