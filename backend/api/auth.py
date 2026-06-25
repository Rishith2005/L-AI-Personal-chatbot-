"""
L AI Backend — Authentication Router

Protected routes for user identity and profile metadata.
Supports an offline fallback mode when Supabase is not configured.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_user
from database.supabase_client import get_supabase_admin_client
from schemas.auth import UserResponse, ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's details decoded from JWT."""
    return current_user


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the database profile details for the current user."""
    client = get_supabase_admin_client()
    
    if client is None:
        # Return mock profile for offline developer mode
        return {
            "id": current_user["id"],
            "username": "Guest Developer",
            "avatar_url": None,
            "created_at": "2026-06-23T00:00:00Z",
            "updated_at": "2026-06-23T00:00:00Z",
        }

    response = client.table("profiles").select("*").eq("id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found in database."
        )
    return response.data[0]


@router.post("/profile", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update or create the profile for the current user."""
    client = get_supabase_admin_client()
    
    if client is None:
        # Mock update for offline developer mode
        return {
            "id": current_user["id"],
            "username": profile_data.username or "Guest Developer",
            "avatar_url": profile_data.avatar_url,
            "created_at": "2026-06-23T00:00:00Z",
            "updated_at": "2026-06-23T00:00:00Z",
        }
    
    update_dict = {}
    if profile_data.username is not None:
        update_dict["username"] = profile_data.username
    if profile_data.avatar_url is not None:
        update_dict["avatar_url"] = profile_data.avatar_url
        
    if not update_dict:
        response = client.table("profiles").select("*").eq("id", current_user["id"]).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found."
            )
        return response.data[0]

    response = client.table("profiles").upsert({
        "id": current_user["id"],
        **update_dict
    }).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile."
        )
        
    return response.data[0]
