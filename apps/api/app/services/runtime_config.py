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


def get_public_site_url() -> str:
    """Returns the public site URL used for generated customer-facing links."""
    return os.getenv("PUBLIC_SITE_URL", "https://www.cruznclean.com").strip() or "https://www.cruznclean.com"


def get_stripe_secret_key() -> str:
    """Returns the configured Stripe secret key, if payment checkout is enabled."""
    return os.getenv("STRIPE_SECRET_KEY", "").strip()


def get_stripe_deposit_percent() -> float:
    """Returns the deposit percentage used for Stripe Checkout deposits."""
    raw_value = os.getenv("STRIPE_DEPOSIT_PERCENT", "10").strip()
    try:
        return max(float(raw_value), 0.0)
    except ValueError:
        return 10.0


def get_stripe_deposit_min_cents() -> int:
    """Returns the minimum Stripe deposit amount in cents."""
    raw_value = os.getenv("STRIPE_DEPOSIT_MIN_CENTS", "2500").strip()
    try:
        return max(int(raw_value), 0)
    except ValueError:
        return 2500


def get_stripe_deposit_max_cents() -> int:
    """Returns the maximum Stripe deposit amount in cents."""
    raw_value = os.getenv("STRIPE_DEPOSIT_MAX_CENTS", "10000").strip()
    try:
        return max(int(raw_value), get_stripe_deposit_min_cents())
    except ValueError:
        return 10000


def get_stripe_success_url() -> str:
    """Returns the Stripe Checkout success redirect URL."""
    fallback = f"{get_public_site_url().rstrip('/')}/thank-you?session_id={{CHECKOUT_SESSION_ID}}"
    return os.getenv("STRIPE_SUCCESS_URL", fallback).strip() or fallback


def get_stripe_cancel_url() -> str:
    """Returns the Stripe Checkout cancel redirect URL."""
    fallback = f"{get_public_site_url().rstrip('/')}/booking"
    return os.getenv("STRIPE_CANCEL_URL", fallback).strip() or fallback
