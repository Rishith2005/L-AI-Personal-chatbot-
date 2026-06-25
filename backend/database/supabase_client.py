"""
L AI Backend — Supabase Database Client

Provides a server-side Supabase client using the service role key
for privileged database operations (bypasses RLS when needed).
Also provides an anon-key client for operations that should respect RLS.
"""

from supabase import create_client, Client
from core.config import get_settings

_supabase_client: Client | None = None
_supabase_admin_client: Client | None = None


def get_supabase_client() -> Client | None:
    """
    Return the Supabase client using the anon key.
    This client respects Row Level Security policies.
    Returns None if Supabase is not configured.
    """
    global _supabase_client
    settings = get_settings()
    if not settings.supabase_url or "your-project" in settings.supabase_url:
        return None
    
    # Clean trailing /rest/v1/ or slashes
    url = settings.supabase_url.strip()
    if url.endswith("/rest/v1/"):
        url = url[:-9]
    elif url.endswith("/rest/v1"):
        url = url[:-8]
    url = url.rstrip("/")

    if _supabase_client is None:
        _supabase_client = create_client(
            url,
            settings.supabase_anon_key,
        )
    return _supabase_client


def get_supabase_admin_client() -> Client | None:
    """
    Return the Supabase client using the service role key.
    This client bypasses RLS — use only for server-side admin operations.
    Returns None if Supabase is not configured.
    """
    global _supabase_admin_client
    settings = get_settings()
    if not settings.supabase_url or "your-project" in settings.supabase_url:
        return None
    
    # Clean trailing /rest/v1/ or slashes
    url = settings.supabase_url.strip()
    if url.endswith("/rest/v1/"):
        url = url[:-9]
    elif url.endswith("/rest/v1"):
        url = url[:-8]
    url = url.rstrip("/")

    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(
            url,
            settings.supabase_service_role_key,
        )
    return _supabase_admin_client

