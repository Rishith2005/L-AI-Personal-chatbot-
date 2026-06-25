"""
L AI Backend — Chat Schemas

Pydantic models for the chat endpoint (prompt submission + streaming).
"""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request body for sending a prompt to the AI."""
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: str | None = None
    web_search: bool = False


class ChatStreamEvent(BaseModel):
    """Individual streaming event sent via SSE."""
    token: str | None = None
    done: bool = False
    conversation_id: str | None = None
    message_id: str | None = None
    error: str | None = None
