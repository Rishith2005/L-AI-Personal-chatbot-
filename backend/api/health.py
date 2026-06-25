"""
L AI Backend — Health Check Route

Simple endpoint to verify the API is running.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/api/health")
async def health_check():
    """Return API health status."""
    return {"status": "ok", "service": "L AI API"}
