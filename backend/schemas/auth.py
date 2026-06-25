"""
L AI Backend — Authentication Schemas

Pydantic models for authentication-related requests and responses.
"""

from pydantic import BaseModel


class UserResponse(BaseModel):
    """Authenticated user information returned from /api/auth/me."""
    id: str
    email: str | None = None
    role: str = "authenticated"


class ProfileResponse(BaseModel):
    """User profile information."""
    id: str
    username: str | None = None
    avatar_url: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class ProfileUpdateRequest(BaseModel):
    """Request body for updating a user profile."""
    username: str | None = None
    avatar_url: str | None = None
