"""
L AI Backend — Message Service

Business logic for message persistence and retrieval.
Supports an in-memory fallback store when Supabase is not configured.
"""

import logging
import uuid
from datetime import datetime, timezone

from database.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)

# Global in-memory messages store (indexed by conversation_id)
_mock_messages: dict[str, list[dict]] = {}


class MessageService:
    """Manages message storage and retrieval with mock fallback."""

    def __init__(self):
        self.client = get_supabase_admin_client()
        self.table = "messages"

    def get_messages(
        self,
        conversation_id: str,
        limit: int = 30,
        offset: int = 0,
    ) -> dict:
        """Retrieve messages for a conversation in chronological order."""
        if self.client is None:
            conv_msgs = _mock_messages.get(conversation_id, [])
            # Chronological order
            conv_msgs.sort(key=lambda x: x["created_at"])
            page = conv_msgs[offset : offset + limit]
            has_more = (offset + limit) < len(conv_msgs)
            return {
                "messages": page,
                "has_more": has_more,
            }

        response = (
            self.client.table(self.table)
            .select("id, conversation_id, sender, content, created_at")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=False)
            .range(offset, offset + limit - 1)
            .execute()
        )

        count_response = (
            self.client.table(self.table)
            .select("id", count="exact")
            .eq("conversation_id", conversation_id)
            .execute()
        )
        total = count_response.count or 0
        has_more = (offset + limit) < total

        return {
            "messages": response.data or [],
            "has_more": has_more,
        }

    def get_context_messages(self, conversation_id: str, limit: int = 20) -> list[dict]:
        """
        Retrieve the most recent messages for building AI context.
        Returns messages in chronological order (oldest first).
        """
        if self.client is None:
            conv_msgs = _mock_messages.get(conversation_id, [])
            # Sort newest first, take limit, then reverse
            conv_msgs.sort(key=lambda x: x["created_at"], reverse=True)
            context = [{"sender": m["sender"], "content": m["content"]} for m in conv_msgs[:limit]]
            context.reverse()
            return context

        response = (
            self.client.table(self.table)
            .select("sender, content")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        messages = response.data or []
        messages.reverse()
        return messages

    def save_message(
        self,
        conversation_id: str,
        sender: str,
        content: str,
    ) -> dict:
        """Persist a single message (user or assistant)."""
        now = datetime.now(timezone.utc).isoformat()
        
        if self.client is None:
            msg_id = str(uuid.uuid4())
            new_msg = {
                "id": msg_id,
                "conversation_id": conversation_id,
                "sender": sender,
                "content": content,
                "created_at": now,
            }
            if conversation_id not in _mock_messages:
                _mock_messages[conversation_id] = []
            _mock_messages[conversation_id].append(new_msg)
            logger.info(f"Mock Message saved: sender={sender}, conversation={conversation_id}")
            return new_msg

        response = (
            self.client.table(self.table)
            .insert({
                "conversation_id": conversation_id,
                "sender": sender,
                "content": content,
                "created_at": now,
            })
            .execute()
        )
        logger.info(f"Message saved: sender={sender}, conversation={conversation_id}")
        return response.data[0] if response.data else {}
