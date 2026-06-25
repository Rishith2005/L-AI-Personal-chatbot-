"""
L AI Backend — Entrypoint

FastAPI application factory, middleware configuration, and routing setup.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from middleware.logging_middleware import LoggingMiddleware
from api.health import router as health_router
from api.auth import router as auth_router
from api.conversations import router as conversations_router
from api.chat import router as chat_router

# Configure logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("l_ai_api")

# Initialize FastAPI App
app = FastAPI(
    title="L AI API",
    description="Backend services for the L AI Chatbot Platform",
    version="1.0.0",
)

# Configure CORS
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Logging Middleware
app.add_middleware(LoggingMiddleware)

# Include Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    """Root endpoint returning API metadata."""
    return {
        "app": "L AI Chatbot API",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs",
    }
