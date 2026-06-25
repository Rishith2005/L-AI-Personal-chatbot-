"""
L AI Backend — Chat Service (Conversation Engine)

Core orchestration layer that coordinates the full chat pipeline:
    1. Conversation creation/validation
    2. User message persistence
    3. Context retrieval
    4. Web search (optional)
    5. Prompt assembly
    6. AI response streaming
    7. Assistant message persistence
    8. Conversation metadata updates

API routes should delegate all chat logic to this service.
"""

import json
import logging
from typing import AsyncIterator

from ai.prompt_builder import build_prompt
from services.ai_service import AIService
from services.conversation_service import ConversationService
from services.message_service import MessageService
from services.web_search_service import WebSearchService

logger = logging.getLogger(__name__)


class ChatService:
    """Orchestrates the complete chat processing pipeline."""

    def __init__(self):
        self.ai_service = AIService()
        self.conversation_service = ConversationService()
        self.message_service = MessageService()
        self.web_search_service = WebSearchService()

    async def process_chat(
        self,
        user_id: str,
        message: str,
        conversation_id: str | None = None,
        web_search: bool = False,
    ) -> AsyncIterator[str]:
        """
        Execute the full chat pipeline, yielding SSE-formatted events.

        SSE event format:
            data: {"token": "Hello"}
            data: {"web_search": true, "sources": [...]}
            data: {"done": true, "conversation_id": "...", "message_id": "..."}
            data: {"error": "Something went wrong"}

        Pipeline:
            1. Create conversation if conversation_id is None
            2. Validate ownership if conversation_id is provided
            3. Save user message
            4. Retrieve conversation context
            5. Web search (if enabled)
            6. Build prompt
            7. Stream AI response
            8. Save assistant message (one write after completion)
            9. Update conversation metadata
        """
        try:
            # Step 1–2: Ensure conversation exists and user owns it
            if conversation_id is None:
                # Auto-generate a title from the user's first message
                auto_title = message.strip()[:50]
                if len(message.strip()) > 50:
                    auto_title += "…"
                conversation = self.conversation_service.create_conversation(
                    user_id, title=auto_title or "New Conversation"
                )
                conversation_id = conversation["id"]
                logger.info(f"Auto-created conversation {conversation_id} with title '{auto_title}'")
            else:
                conversation = self.conversation_service.get_conversation(
                    conversation_id, user_id
                )
                if conversation is None:
                    yield self._sse_event(error="Conversation not found or access denied.")
                    return

            # Step 3: Save user message
            self.message_service.save_message(conversation_id, "user", message)

            # Step 4: Retrieve context (recent messages for prompt building)
            context_messages = self.message_service.get_context_messages(conversation_id)

            # Step 5: Web search (if enabled)
            web_search_context = None
            if web_search:
                logger.info(f"Web search enabled for query: '{message[:80]}'")
                search_results = self.web_search_service.search(message, max_results=5)
                if search_results:
                    web_search_context = WebSearchService.format_search_context(search_results)
                    # Emit sources event so frontend can display them
                    sources = [
                        {"title": r["title"], "url": r["url"]}
                        for r in search_results
                    ]
                    yield self._sse_event(web_search=True, sources=sources)
                else:
                    logger.warning("Web search returned no results, proceeding without context.")

            # Step 6: Build prompt (system + web context + conversation context + current message)
            # Note: context already includes the user message we just saved,
            # so we pass it without the current message to avoid duplication
            prompt_messages = build_prompt(
                user_message=message,
                context_messages=context_messages[:-1],  # Exclude the message we just added
                web_search_context=web_search_context,
            )

            # Step 7: Stream AI response, buffering the full content
            full_response = ""
            async for token in self.ai_service.stream_response(prompt_messages):
                full_response += token
                yield self._sse_event(token=token)

            # Step 8: Save assistant message (single DB write)
            if full_response.strip():
                saved_message = self.message_service.save_message(
                    conversation_id, "assistant", full_response
                )

                # Step 9: Update conversation metadata
                self.conversation_service.update_metadata(
                    conversation_id=conversation_id,
                    last_message=full_response[:200],
                    increment_count=2,  # user + assistant
                )

                # Signal completion
                yield self._sse_event(
                    done=True,
                    conversation_id=conversation_id,
                    message_id=saved_message.get("id"),
                    conversation_title=conversation.get("title", "New Conversation"),
                )
            else:
                yield self._sse_event(error="The AI returned an empty response. Please try again.")

        except Exception as e:
            logger.error(f"Chat pipeline error: {e}", exc_info=True)
            yield self._sse_event(error="Something went wrong while generating a response. Please try again.")

    @staticmethod
    def _sse_event(**kwargs) -> str:
        """Format a dict as an SSE data line."""
        return f"data: {json.dumps(kwargs)}\n\n"

