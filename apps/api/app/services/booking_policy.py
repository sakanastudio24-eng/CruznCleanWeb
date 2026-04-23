from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

MAX_BOOKED_VEHICLES_PER_DAY = 4


def normalize_email_for_limit(email: str) -> str:
    """Normalizes email for same-person daily booking checks."""
    return email.strip().lower()


def normalize_phone_for_limit(phone: str) -> str:
    """Normalizes phone to digits-only for stable daily booking checks."""
    return "".join(character for character in phone if character.isdigit())


def count_selected_vehicles(vehicles: list[dict]) -> int:
    """Counts vehicles that include at least one selected service."""
    selected = 0
    for vehicle in vehicles:
        service_ids = vehicle.get("serviceIds", [])
        if isinstance(service_ids, list) and any(str(service_id).strip() for service_id in service_ids):
            selected += 1

    return selected


def resolve_limit_day_key(iso_timestamp: str, tz_name: str) -> str:
    """Converts a timestamp into a YYYY-MM-DD key for daily booking limits."""
    try:
        target_zone = ZoneInfo(tz_name)
    except Exception:
        target_zone = timezone.utc

    try:
        normalized = iso_timestamp.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        parsed = datetime.now(timezone.utc)

    return parsed.astimezone(target_zone).strftime("%Y-%m-%d")
