from __future__ import annotations

import os
from secrets import compare_digest

from fastapi import HTTPException, Request, status

def require_template_admin_auth(request: Request) -> None:
    """Validates bearer token auth for template-admin endpoints."""
    configured_token = os.getenv("TEMPLATE_ADMIN_TOKEN", "").strip()
    if not configured_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Template admin is not configured.",
        )

    authorization = request.headers.get("Authorization", "").strip()
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid admin token.",
        )

    provided_token = authorization[7:].strip()
    if not provided_token or not compare_digest(provided_token, configured_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid admin token.",
        )
