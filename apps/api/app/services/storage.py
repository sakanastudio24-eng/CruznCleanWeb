from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
from uuid import uuid4

from app.services.booking_policy import (
    normalize_email_for_limit,
    normalize_phone_for_limit,
    resolve_limit_day_key,
)


ROOT_DIR = Path(__file__).resolve().parents[4]
DATA_DIR = ROOT_DIR / "data"
BOOKINGS_FILE = DATA_DIR / "bookings.json"
CONTACTS_FILE = DATA_DIR / "contacts.json"
EMAIL_FAILURES_FILE = DATA_DIR / "email_failures.json"


def _ensure_file(file_path: Path) -> None:
    """Creates missing data file with an empty list payload."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not file_path.exists():
        file_path.write_text("[]", encoding="utf-8")


def _load_records(file_path: Path) -> list[dict]:
    """Loads all records from a JSON file as a list of dictionaries."""
    _ensure_file(file_path)
    return json.loads(file_path.read_text(encoding="utf-8"))


def _save_records(file_path: Path, records: list[dict]) -> None:
    """Writes records to a JSON file with stable formatting."""
    file_path.write_text(json.dumps(records, indent=2), encoding="utf-8")


def append_booking_record(payload: dict) -> dict:
    """Appends one booking intake record with server timestamp metadata and returns the persisted row."""
    records = _load_records(BOOKINGS_FILE)
    persisted_record = {
        "bookingId": f"bk_{uuid4().hex[:12]}",
        "submittedAt": datetime.now(timezone.utc).isoformat(),
        **payload,
    }
    records.append(persisted_record)
    _save_records(BOOKINGS_FILE, records)
    return persisted_record


def get_bookings_by_identity_and_day(
    email_norm: str,
    phone_norm: str,
    day_key: str,
    tz_name: str,
) -> list[dict]:
    """Returns persisted bookings for one normalized identity on one intake day key."""
    if not email_norm or not phone_norm:
        return []

    records = _load_records(BOOKINGS_FILE)
    matched: list[dict] = []

    for record in records:
        customer = record.get("customer", {})
        if not isinstance(customer, dict):
            continue

        record_email = normalize_email_for_limit(str(customer.get("email", "")))
        record_phone = normalize_phone_for_limit(str(customer.get("phone", "")))
        if record_email != email_norm or record_phone != phone_norm:
            continue

        submitted_at = str(record.get("submittedAt", "")).strip()
        record_day_key = resolve_limit_day_key(submitted_at, tz_name)
        if record_day_key == day_key:
            matched.append(record)

    return matched


def append_contact_record(payload: dict) -> None:
    """Appends one contact message record with server timestamp metadata."""
    records = _load_records(CONTACTS_FILE)
    records.append(
        {
            "submittedAt": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
    )
    _save_records(CONTACTS_FILE, records)


def append_email_failure_record(payload: dict) -> None:
    """Appends one email-delivery failure record with server timestamp metadata."""
    records = _load_records(EMAIL_FAILURES_FILE)
    records.append(
        {
            "loggedAt": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
    )
    _save_records(EMAIL_FAILURES_FILE, records)
