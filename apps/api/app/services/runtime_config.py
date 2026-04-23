from __future__ import annotations

import os

DEFAULT_CORS_ORIGINS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]


def _env_flag(name: str, default: bool) -> bool:
    """Parses a boolean environment variable with a safe default."""
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def is_demo_mode() -> bool:
    """Returns whether API endpoints should run in demo-safe mode."""
    return _env_flag("DEMO_MODE", False)


def is_template_admin_enabled() -> bool:
    """Returns whether template-admin routes should be mounted."""
    return _env_flag("ENABLE_TEMPLATE_ADMIN", True)


def get_cors_origins() -> list[str]:
    """Returns configured CORS origins from env or localhost defaults."""
    raw_origins = os.getenv("API_CORS_ORIGINS", "").strip()
    if not raw_origins:
        return DEFAULT_CORS_ORIGINS

    parsed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return parsed_origins or DEFAULT_CORS_ORIGINS
