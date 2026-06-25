"""
L AI Backend — Conversations Router

API endpoints for managing conversations and message history.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from core.security import get_current_user
from services.conversation_service import ConversationService
from services.message_service import MessageService
from schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
)
from schemas.message import MessageListResponse

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])
conversation_service = ConversationService()
message_service = MessageService()


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """Retrieve the user's conversations, paginated and sorted by updated_at descending."""
    result = conversation_service.list_conversations(
        user_id=current_user["id"], limit=limit, offset=offset
    )
    return result


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ConversationCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new empty conversation."""
    return conversation_service.create_conversation(
        user_id=current_user["id"], title=data.title
    )


@router.get("/{id}", response_model=ConversationResponse)
async def get_conversation(
    id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve details of a specific conversation."""
    conversation = conversation_service.get_conversation(
        conversation_id=id, user_id=current_user["id"]
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    return conversation


@router.patch("/{id}", response_model=ConversationResponse)
async def update_conversation(
    id: str,
    data: ConversationUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Rename an existing conversation."""
    conversation = conversation_service.update_conversation(
        conversation_id=id, user_id=current_user["id"], title=data.title
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    return conversation


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a conversation and all associated messages (cascading)."""
    success = conversation_service.delete_conversation(
        conversation_id=id, user_id=current_user["id"]
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    return


@router.get("/{id}/messages", response_model=MessageListResponse)
async def get_messages(
    id: str,
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """Retrieve messages for a conversation, paginated and sorted chronologically."""
    # Validate conversation access first
    conversation = conversation_service.get_conversation(
        conversation_id=id, user_id=current_user["id"]
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    
    result = message_service.get_messages(
        conversation_id=id, limit=limit, offset=offset
    )
    return result
