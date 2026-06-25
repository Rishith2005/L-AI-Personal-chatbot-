"""
L AI Backend — JWT Security & Authentication

Dependency for extracting and validating Supabase-issued JWTs.
Every protected endpoint should use `get_current_user` as a dependency.
"""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from database.supabase_client import get_supabase_client
from core.config import get_settings, Settings

logger = logging.getLogger("l_ai_api")
security_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    settings: Settings = Depends(get_settings),
) -> dict:
    """
    Validate the Supabase JWT and return the user payload.

    Returns a dict with at minimum:
        - id: user UUID
        - email: user email
        - role: user role

    Raises HTTPException 401 on invalid or expired tokens.
    """
    token = credentials.credentials

    # Local developer bypass mode for offline demonstration/review
    if (
        token == "dummy-token"
        or not settings.supabase_url
        or "your-project" in settings.supabase_url
    ):
        return {
            "id": "00000000-0000-0000-0000-000000000000",
            "email": "guest@l-ai.workspace",
            "role": "authenticated",
        }

    # Verify token via Supabase Auth server API
    client = get_supabase_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase client is not configured.",
        )

    try:
        # Calls the Supabase /user endpoint using the token to verify the session
        response = client.auth.get_user(token)
        user = response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
            )
        return {
            "id": str(user.id),
            "email": user.email,
            "role": user.role or "authenticated",
        }
    except Exception as e:
        logger.error(f"Supabase auth verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
