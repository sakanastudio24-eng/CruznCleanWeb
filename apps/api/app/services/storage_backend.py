from __future__ import annotations

import os


def get_storage_backend_name() -> str:
    """Returns the configured persistence adapter name for the current environment."""
    requested_backend = os.getenv("DATA_STORAGE_BACKEND", "local_json").strip().lower()
    return "supabase" if requested_backend == "supabase" else "local_json"


def is_supabase_storage_requested() -> bool:
    """Reports whether future Supabase persistence has been requested for this API runtime."""
    return get_storage_backend_name() == "supabase"
