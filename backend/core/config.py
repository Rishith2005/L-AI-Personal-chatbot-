"""
L AI Backend — Core Configuration

Centralized settings loaded from environment variables.
No secrets should ever be hardcoded in source code.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Hugging Face
    hf_access_token: str = ""
    model_name: str = "deepseek-ai/DeepSeek-V4-Pro"

    # Application
    cors_origins: str = "http://localhost:5173"
    log_level: str = "INFO"

    # AI Configuration
    max_context_messages: int = 20
    max_tokens: int = 2048
    temperature: float = 0.7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings (singleton)."""
    return Settings()
