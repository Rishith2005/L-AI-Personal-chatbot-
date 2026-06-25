"""
L AI Backend — Conversation Service

Business logic for conversation CRUD operations.
All database access is centralized here — API routes never query the DB directly.
Supports an in-memory fallback store when Supabase is not configured.
"""

import logging
import uuid
from datetime import datetime, timezone

from database.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)

# Global in-memory store for offline demo/dev fallback
_mock_conversations: dict[str, dict] = {}


class ConversationService:
    """Manages the lifecycle of conversations in Supabase with mock fallback."""

    def __init__(self):
        self.client = get_supabase_admin_client()
        self.table = "conversations"

    def list_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> dict:
        """
        Retrieve a paginated list of conversations for a user,
        ordered by most recently updated first.
        """
        if self.client is None:
            user_convs = [c for c in _mock_conversations.values() if c["user_id"] == user_id]
            user_convs.sort(key=lambda x: x["updated_at"], reverse=True)
            page = user_convs[offset : offset + limit]
            return {
                "conversations": page,
                "total": len(user_convs),
            }

        response = (
            self.client.table(self.table)
            .select("id, user_id, title, last_message, message_count, created_at, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        count_response = (
            self.client.table(self.table)
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )

        return {
            "conversations": response.data or [],
            "total": count_response.count or 0,
        }

    def create_conversation(self, user_id: str, title: str = "New Conversation") -> dict:
        """Create a new conversation."""
        now = datetime.now(timezone.utc).isoformat()
        
        if self.client is None:
            conv_id = str(uuid.uuid4())
            new_conv = {
                "id": conv_id,
                "user_id": user_id,
                "title": title,
                "last_message": None,
                "message_count": 0,
                "created_at": now,
                "updated_at": now,
            }
            _mock_conversations[conv_id] = new_conv
            logger.info(f"Mock Conversation created: {conv_id} for user {user_id}")
            return new_conv

        response = (
            self.client.table(self.table)
            .insert({
                "user_id": user_id,
                "title": title,
                "message_count": 0,
                "created_at": now,
                "updated_at": now,
            })
            .execute()
        )
        logger.info(f"Conversation created for user {user_id}")
        return response.data[0] if response.data else {}

    def get_conversation(self, conversation_id: str, user_id: str) -> dict | None:
        """Retrieve a single conversation by ID. Validates ownership."""
        if self.client is None:
            conv = _mock_conversations.get(conversation_id)
            if conv and conv["user_id"] == user_id:
                return conv
            return None

        response = (
            self.client.table(self.table)
            .select("id, user_id, title, last_message, message_count, created_at, updated_at")
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .execute()
        )
        if response.data:
            return response.data[0]
        return None

    def update_conversation(self, conversation_id: str, user_id: str, title: str) -> dict | None:
        """Rename a conversation. Validates ownership."""
        now = datetime.now(timezone.utc).isoformat()

        if self.client is None:
            conv = _mock_conversations.get(conversation_id)
            if conv and conv["user_id"] == user_id:
                conv["title"] = title
                conv["updated_at"] = now
                logger.info(f"Mock Conversation {conversation_id} renamed to '{title}'")
                return conv
            return None

        response = (
            self.client.table(self.table)
            .update({
                "title": title,
                "updated_at": now,
            })
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .execute()
        )
        if response.data:
            logger.info(f"Conversation {conversation_id} renamed to '{title}'")
            return response.data[0]
        return None

    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation."""
        if self.client is None:
            conv = _mock_conversations.get(conversation_id)
            if conv and conv["user_id"] == user_id:
                del _mock_conversations[conversation_id]
                # Also delete associated messages
                from services.message_service import _mock_messages
                _mock_messages[conversation_id] = []
                logger.info(f"Mock Conversation {conversation_id} deleted")
                return True
            return False

        response = (
            self.client.table(self.table)
            .delete()
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .execute()
        )
        if response.data:
            logger.info(f"Conversation {conversation_id} deleted")
            return True
        return False

    def update_metadata(
        self,
        conversation_id: str,
        last_message: str | None = None,
        increment_count: int = 0,
    ) -> None:
        """Update conversation metadata after a new message is added."""
        now = datetime.now(timezone.utc).isoformat()

        if self.client is None:
            conv = _mock_conversations.get(conversation_id)
            if conv:
                conv["updated_at"] = now
                if last_message is not None:
                    conv["last_message"] = last_message[:200]
                conv["message_count"] += increment_count
            return

        update_data: dict = {
            "updated_at": now,
        }
        if last_message is not None:
            update_data["last_message"] = last_message[:200]

        if increment_count > 0:
            conv = (
                self.client.table(self.table)
                .select("message_count")
                .eq("id", conversation_id)
                .execute()
            )
            current_count = conv.data[0]["message_count"] if conv.data else 0
            update_data["message_count"] = current_count + increment_count

        self.client.table(self.table).update(update_data).eq("id", conversation_id).execute()
