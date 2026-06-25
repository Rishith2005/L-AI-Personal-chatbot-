"""
L AI Backend — Logging Middleware

Logs request metadata (method, path, status, latency) without exposing sensitive data.
"""

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("l_ai_api")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for non-sensitive request/response logging."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Check presence of authorization header (safe metadata only)
        has_auth = "Authorization" in request.headers
        
        response = await call_next(request)
        
        process_time_ms = (time.time() - start_time) * 1000
        
        logger.info(
            f"Method: {request.method} | "
            f"Path: {request.url.path} | "
            f"Status: {response.status_code} | "
            f"Duration: {process_time_ms:.2f}ms | "
            f"AuthHeaderPresent: {has_auth}"
        )
        
        return response
