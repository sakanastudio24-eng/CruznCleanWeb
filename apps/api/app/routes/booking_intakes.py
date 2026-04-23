from datetime import datetime, timezone
import os
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request

from app.models.booking import BookingIntakeRequest
from app.services.booking_policy import (
    MAX_BOOKED_VEHICLES_PER_DAY,
    count_selected_vehicles,
    normalize_email_for_limit,
    normalize_phone_for_limit,
    resolve_limit_day_key,
)
from app.services.rate_limit import is_booking_rate_limited
from app.services.email import send_booking_transactional_emails
from app.services.runtime_config import is_demo_mode
from app.services.storage import (
    append_booking_record,
    append_email_failure_record,
    get_bookings_by_identity_and_day,
)

router = APIRouter(prefix="/booking-intakes", tags=["booking"])


def _build_demo_booking_response() -> dict[str, str]:
    """Builds a deterministic demo-mode booking response payload."""
    return {
        "status": "accepted",
        "mode": "demo",
        "bookingId": f"demo_{uuid4().hex[:12]}",
        "receivedAt": datetime.now(timezone.utc).isoformat(),
        "message": "Demo received — no booking created.",
    }


def process_booking_intake(payload: BookingIntakeRequest, client_ip: str | None) -> dict[str, str]:
    """Validates booking intake and executes demo or live processing behavior."""
    if is_booking_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many booking requests. Please try again shortly.")

    if payload.honeypot.strip():
        return {"status": "accepted", "message": "Request accepted."}

    booking_payload = payload.model_dump(exclude={"honeypot"})
    timezone_name = os.getenv("BOOKING_LIMIT_TIMEZONE", "America/Los_Angeles").strip() or "America/Los_Angeles"
    current_day_key = resolve_limit_day_key(datetime.now(timezone.utc).isoformat(), timezone_name)
    normalized_email = normalize_email_for_limit(payload.customer.email)
    normalized_phone = normalize_phone_for_limit(payload.customer.phone)
    incoming_selected_vehicle_count = count_selected_vehicles(booking_payload.get("vehicles", []))
    prior_bookings = get_bookings_by_identity_and_day(
        normalized_email,
        normalized_phone,
        current_day_key,
        timezone_name,
    )
    existing_selected_vehicle_count = sum(
        count_selected_vehicles(record.get("vehicles", []))
        for record in prior_bookings
    )
    if existing_selected_vehicle_count + incoming_selected_vehicle_count > MAX_BOOKED_VEHICLES_PER_DAY:
        raise HTTPException(
            status_code=422,
            detail="Daily vehicle limit exceeded. Maximum 4 vehicles per customer per day.",
        )

    if is_demo_mode():
        return _build_demo_booking_response()

    persisted_booking = append_booking_record(booking_payload)

    try:
        failures = send_booking_transactional_emails(persisted_booking)
    except Exception as exc:  # pragma: no cover - defensive catch for non-blocking email policy
        failures = [
            {
                "bookingId": persisted_booking.get("bookingId", "unknown"),
                "recipientRole": "system",
                "provider": "resend",
                "to": "",
                "errorSummary": f"Unexpected email pipeline error: {str(exc).strip()[:280]}",
                "retryStatus": "pending",
            }
        ]

    for failure in failures:
        append_email_failure_record(failure)

    return {
        "status": "accepted",
        "mode": "live",
        "bookingId": str(persisted_booking.get("bookingId", "")),
        "receivedAt": str(persisted_booking.get("submittedAt", datetime.now(timezone.utc).isoformat())),
        "message": "Booking intake confirmed.",
    }


@router.post("")
def create_booking_intake(payload: BookingIntakeRequest, request: Request) -> dict[str, str]:
    """Handles the booking-intakes endpoint and forwards client IP for policy checks."""
    return process_booking_intake(payload, request.client.host if request.client else None)
