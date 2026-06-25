"""
L AI Backend — Message Schemas

Pydantic models for message persistence and retrieval.
"""

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Single message returned to the frontend."""
    id: str
    conversation_id: str
    sender: str  # "user" or "assistant"
    content: str
    created_at: str


class MessageListResponse(BaseModel):
    """Paginated list of messages for a conversation."""
    messages: list[MessageResponse]
    has_more: bool = False
