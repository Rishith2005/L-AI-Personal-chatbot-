"""
L AI Backend — Chat Router

API endpoint for real-time prompt streaming via Server-Sent Events (SSE).
"""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from core.security import get_current_user
from services.chat_service import ChatService
from schemas.chat import ChatRequest

router = APIRouter(prefix="/api/chat", tags=["Chat"])
chat_service = ChatService()


@router.post("")
async def chat_endpoint(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Submit a prompt to the AI and receive a real-time token stream via SSE.
    
    If no conversation_id is supplied, a new conversation is auto-created.
    """
    return StreamingResponse(
        chat_service.process_chat(
            user_id=current_user["id"],
            message=request.message,
            conversation_id=request.conversation_id,
            web_search=request.web_search,
        ),
        media_type="text/event-stream",
    )
