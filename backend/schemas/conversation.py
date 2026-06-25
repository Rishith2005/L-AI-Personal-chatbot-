"""
L AI Backend — Conversation Schemas

Pydantic models for conversation CRUD operations.
"""

from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    """Request body for creating a new conversation."""
    title: str = "New Conversation"


class ConversationUpdate(BaseModel):
    """Request body for renaming a conversation."""
    title: str


class ConversationResponse(BaseModel):
    """Single conversation returned to the frontend."""
    id: str
    user_id: str
    title: str
    last_message: str | None = None
    message_count: int = 0
    created_at: str
    updated_at: str


class ConversationListResponse(BaseModel):
    """Paginated list of conversations."""
    conversations: list[ConversationResponse]
    total: int
