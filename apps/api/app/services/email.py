from __future__ import annotations

from datetime import datetime, timezone
from html import escape
import json
import os
from typing import Any
from urllib import error, request

from app.services.discounts import build_vehicle_pricing_breakdown, normalize_vehicle_size

RESEND_API_URL = "https://api.resend.com/emails"
SUPPORT_PHONE_DISPLAY = "(951)-434-3767"
SUPPORT_PHONE_TEL = "tel:+19514343767"


class EmailDeliveryError(RuntimeError):
    """Represents a recoverable outbound email delivery failure."""


def _env_flag(name: str, default: bool) -> bool:
    """Parses a boolean environment flag with a safe default."""
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _sanitize_error(error_text: str) -> str:
    """Normalizes provider error text into a short, log-safe summary."""
    compact = " ".join(error_text.split())
    return compact[:300] if compact else "Unknown email delivery error."


def _extract_recipient(recipient: Any) -> str:
    """Returns the normalized email recipient value for logs."""
    if isinstance(recipient, str):
        return recipient

    return ""


def _build_vehicle_breakdown(vehicles: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    """Builds enriched vehicle rows with service metadata and estimated subtotals."""
    enriched: list[dict[str, Any]] = []
    grand_total = 0

    for vehicle in vehicles:
        raw_service_ids = vehicle.get("serviceIds", [])
        service_ids = [str(service_id).strip() for service_id in raw_service_ids if str(service_id).strip()] if isinstance(raw_service_ids, list) else []
        normalized_size = normalize_vehicle_size(vehicle.get("size", "sedan_coupe"))
        pricing_breakdown = build_vehicle_pricing_breakdown(service_ids, normalized_size)
        service_rows = pricing_breakdown["services"]
        vehicle_total = int(pricing_breakdown["estimatedSubtotal"])

        grand_total += vehicle_total
        enriched.append(
            {
                "id": vehicle.get("id", ""),
                "label": vehicle.get("label", "Vehicle"),
                "make": vehicle.get("make", ""),
                "model": vehicle.get("model", ""),
                "year": vehicle.get("year", ""),
                "color": vehicle.get("color", ""),
                "size": normalized_size,
                "services": service_rows,
                "savingsLines": pricing_breakdown["savingsLines"],
                "subtotalBeforeSavings": pricing_breakdown["subtotalBeforeSavings"],
                "savingsTotal": pricing_breakdown["savingsTotal"],
                "estimatedSubtotal": vehicle_total,
            }
        )

    return enriched, grand_total


def _build_services_summary(vehicles: list[dict[str, Any]]) -> str:
    """Builds a flat services summary for provider-managed test templates."""
    service_groups: list[str] = []
    for vehicle in vehicles:
        services = vehicle.get("services", [])
        service_names = [str(service.get("name", "")).strip() for service in services if str(service.get("name", "")).strip()]
        vehicle_detail = " ".join(
            str(vehicle.get(part, "")).strip()
            for part in ["year", "make", "model"]
            if str(vehicle.get(part, "")).strip()
        ) or str(vehicle.get("label", "Vehicle")).strip() or "Vehicle"
        savings_summary = f"; savings ${vehicle['savingsTotal']}" if int(vehicle.get("savingsTotal", 0)) > 0 else ""
        service_groups.append(
            f"{vehicle_detail}: {', '.join(service_names) if service_names else 'No services selected'}; total ${vehicle['estimatedSubtotal']}{savings_summary}"
        )

    return " | ".join(service_groups) if service_groups else "No services selected"


def _build_template_variables(booking_record: dict[str, Any]) -> dict[str, Any]:
    """Builds the structured variable payload used by template and fallback sends."""
    customer = booking_record.get("customer", {})
    vehicles = booking_record.get("vehicles", [])
    enriched_vehicles, grand_total = _build_vehicle_breakdown(vehicles)
    subtotal_before_savings = sum(int(vehicle.get("subtotalBeforeSavings", 0)) for vehicle in enriched_vehicles)
    savings_total = sum(int(vehicle.get("savingsTotal", 0)) for vehicle in enriched_vehicles)
    savings_summary = " | ".join(
        f"{line['label']}: -${line['amount']}"
        for vehicle in enriched_vehicles
        for line in vehicle.get("savingsLines", [])
    )
    booking_id = str(booking_record.get("bookingId", "unknown"))
    customer_name = str(customer.get("fullName", "")).strip()
    services_summary = _build_services_summary(enriched_vehicles)
    site_url = os.getenv("PUBLIC_SITE_URL", "https://www.cruiznclean.com").rstrip("/")

    return {
        "CUSTOMER_NAME": customer_name or "Customer",
        "BOOKING_ID": booking_id,
        "ESTIMATE_TOTAL": grand_total,
        "SUBTOTAL_BEFORE_SAVINGS": subtotal_before_savings,
        "SAVINGS_TOTAL": savings_total,
        "SAVINGS_SUMMARY": savings_summary,
        "VEHICLE_COUNT": len(enriched_vehicles),
        "SERVICES_SUMMARY": services_summary,
        "SITE_URL": site_url,
        "booking": {
            "bookingId": booking_id,
            "submittedAt": booking_record.get("submittedAt", datetime.now(timezone.utc).isoformat()),
            "scheduledAt": booking_record.get("scheduledAt", ""),
            "scheduledTimezone": booking_record.get("scheduledTimezone", ""),
        },
        "customer": {
            "fullName": customer.get("fullName", ""),
            "email": customer.get("email", ""),
            "phone": customer.get("phone", ""),
            "zipCode": customer.get("zipCode", ""),
            "notes": customer.get("notes", ""),
        },
        "preferences": {
            "sendEmailConfirmation": bool(customer.get("sendEmailConfirmation", False)),
            "sendSmsConfirmation": bool(customer.get("sendSmsConfirmation", False)),
            "acceptedSmsConsent": bool(customer.get("acceptedSmsConsent", False)),
        },
        "vehicles": enriched_vehicles,
        "estimate": {
            "grandTotal": grand_total,
            "subtotalBeforeSavings": subtotal_before_savings,
            "savingsTotal": savings_total,
            "savingsSummary": savings_summary,
            "vehicleCount": len(enriched_vehicles),
        },
    }


def _format_currency(value: int | float) -> str:
    """Formats numeric amounts as USD-like two-decimal strings."""
    return f"{float(value):,.2f}"


def _get_env_number(name: str, fallback: float) -> float:
    """Parses numeric email display configuration with the same safe defaults as checkout."""
    try:
        value = float(os.getenv(name, ""))
        return value if value > 0 else fallback
    except ValueError:
        return fallback


def _calculate_deposit_amount(estimate_total: int | float) -> float:
    """Calculates the displayed deposit amount from the trusted backend estimate."""
    percent = _get_env_number("STRIPE_DEPOSIT_PERCENT", 10)
    min_amount = _get_env_number("STRIPE_DEPOSIT_MIN_CENTS", 2500) / 100
    max_amount = _get_env_number("STRIPE_DEPOSIT_MAX_CENTS", 10000) / 100
    raw_deposit = float(estimate_total) * (percent / 100)
    return min(max(raw_deposit, min_amount), max_amount)


def _format_vehicle_label(vehicle: dict[str, Any]) -> str:
    """Formats one vehicle as Year Make Model — Color."""
    vehicle_name = " ".join(
        str(vehicle.get(part, "")).strip()
        for part in ["year", "make", "model"]
        if str(vehicle.get(part, "")).strip()
    ) or str(vehicle.get("label", "Vehicle")).strip() or "Vehicle"
    color = str(vehicle.get("color", "")).strip()
    return f"{vehicle_name} — {color}" if color else vehicle_name


def _format_vehicle_summary(vehicles: list[dict[str, Any]]) -> str:
    """Formats all booked vehicles for email summaries."""
    labels = [_format_vehicle_label(vehicle) for vehicle in vehicles]
    return " | ".join(labels) if labels else "Vehicle to be confirmed"


def _get_service_names(vehicles: list[dict[str, Any]], *, packages_only: bool | None = None) -> list[str]:
    """Returns selected service names, optionally filtered by package/add-on role."""
    service_names: list[str] = []
    for vehicle in vehicles:
        for service in vehicle.get("services", []):
            service_id = str(service.get("id", "")).strip()
            is_package = service_id.startswith("pkg-")
            if packages_only is True and not is_package:
                continue
            if packages_only is False and is_package:
                continue

            service_name = str(service.get("name", "")).strip()
            if service_name:
                service_names.append(service_name)

    return service_names


def _format_selected_service(vehicles: list[dict[str, Any]]) -> str:
    """Returns the primary selected package or a compact fallback service list."""
    package_names = _get_service_names(vehicles, packages_only=True)
    if package_names:
        return ", ".join(package_names)

    service_names = _get_service_names(vehicles)
    return ", ".join(service_names) if service_names else "Service to be confirmed"


def _format_add_ons(vehicles: list[dict[str, Any]]) -> str:
    """Returns selected non-package add-ons for owner job summaries."""
    add_on_names = _get_service_names(vehicles, packages_only=False)
    return ", ".join(add_on_names) if add_on_names else "None"


def _format_service_address(customer: dict[str, Any]) -> str:
    """Formats the best available service location without inventing a street address."""
    address = str(customer.get("address", "")).strip()
    if address:
        return address

    zip_code = str(customer.get("zipCode", "")).strip()
    return f"ZIP {zip_code} - full address confirmed during scheduling" if zip_code else "Service address to be confirmed"


def _format_appointment_label(booking: dict[str, Any]) -> str:
    """Formats appointment timing when present; otherwise keeps the email accurate."""
    scheduled_at = str(booking.get("scheduledAt", "")).strip()
    timezone_hint = str(booking.get("scheduledTimezone", "")).strip()
    if not scheduled_at:
        return "Scheduling in progress"

    return _format_booking_datetime_label(scheduled_at, timezone_hint)


def _resolve_booking_timestamp(booking: dict[str, Any]) -> tuple[str, str]:
    """Resolves the best booking datetime source and optional timezone hint."""
    scheduled_at = str(booking.get("scheduledAt", "")).strip()
    submitted_at = str(booking.get("submittedAt", "")).strip()
    timezone_hint = str(booking.get("scheduledTimezone", "")).strip()
    return (scheduled_at or submitted_at), timezone_hint


def _parse_submitted_timestamp(submitted_at: str) -> datetime:
    """Parses booking timestamps and returns a timezone-aware datetime."""
    try:
        normalized = submitted_at.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)

        return parsed
    except ValueError:
        return datetime.now(timezone.utc)


def _format_booking_date_label(submitted_at: str) -> str:
    """Formats a submitted timestamp into a month/day owner subject label."""
    submitted_dt = _parse_submitted_timestamp(submitted_at)
    return f"{submitted_dt.strftime('%B')} {submitted_dt.day}"


def _format_booking_datetime_label(submitted_at: str, timezone_hint: str = "") -> str:
    """Formats a submitted timestamp with explicit timezone context."""
    submitted_dt = _parse_submitted_timestamp(submitted_at)
    timezone_label = timezone_hint or submitted_dt.tzname() or "UTC"
    return f"{submitted_dt.strftime('%B')} {submitted_dt.day}, {submitted_dt.year} at {submitted_dt.strftime('%I:%M %p')} ({timezone_label})"


def _build_owner_manage_link(booking_id: str) -> str:
    """Builds an optional owner-manage URL from environment config."""
    base_url = os.getenv("OWNER_BOOKING_MANAGE_URL", "").strip()
    if not base_url:
        return ""

    if "{booking_id}" in base_url:
        return base_url.replace("{booking_id}", booking_id)

    separator = "&" if "?" in base_url else "?"
    return f"{base_url}{separator}bookingId={booking_id}"


def _build_owner_fallback_content(template_variables: dict[str, Any]) -> dict[str, str]:
    """Builds fallback HTML/text content for owner booking notifications."""
    booking = template_variables["booking"]
    customer = template_variables["customer"]
    vehicles = template_variables["vehicles"]
    estimate = template_variables["estimate"]
    booking_id = str(booking["bookingId"])
    appointment_label = _format_appointment_label(booking)
    vehicle_summary = _format_vehicle_summary(vehicles)
    selected_service = _format_selected_service(vehicles)
    add_ons = _format_add_ons(vehicles)
    service_address = _format_service_address(customer)
    notes = str(customer.get("notes", "")).strip() or "None"
    estimated_total = int(estimate["grandTotal"])
    deposit_paid = _calculate_deposit_amount(estimated_total)
    remaining_balance = max(float(estimated_total) - deposit_paid, 0)
    deposit_label = "Deposit Paid" if booking.get("depositPaid") else "Deposit Due"

    lines = [
        "New booking received.",
        "",
        f"Booking Reference: {booking_id}",
        "",
        f"Customer: {customer['fullName']}",
        f"Phone: {customer['phone']}",
        f"Email: {customer['email']}",
        "",
        f"Appointment: {appointment_label}",
        f"Service Address: {service_address}",
        f"Vehicle: {vehicle_summary}",
        f"Selected Service: {selected_service}",
        f"Add-ons: {add_ons}",
        "",
        "Payment Summary",
        f"Estimated Total: ${_format_currency(estimated_total)}",
        f"{deposit_label}: ${_format_currency(deposit_paid)}",
        f"Estimated Balance Due After Service: ${_format_currency(remaining_balance)}",
        "",
        "Status:",
        "Appointment scheduled" if appointment_label != "Scheduling in progress" else "Appointment scheduling in progress",
        "Deposit paid" if booking.get("depositPaid") else "Deposit payment pending",
        "",
        "Notes:",
        "Final price should be confirmed after vehicle inspection and condition review.",
        f"Customer notes: {notes}",
    ]

    html = (
        "<div style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111111;'>"
        "<div style='max-width:700px;margin:0 auto;padding:24px 16px;'>"
        "<div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;'>"
        "<div style='background:#111111;padding:16px 20px;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr>"
        "<td style='color:#ffffff;font-size:22px;font-weight:700;'>Cruizn Clean</td>"
        "<td style='text-align:right;font-size:12px;'>"
        "<span style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Owner Job Summary</span>"
        "</td>"
        "</tr>"
        "</table>"
        "</div>"
        "<div style='padding:20px;'>"
        "<p style='margin:0;font-size:23px;font-weight:800;color:#2f2f2f;'>New booking received.</p>"
        f"<p style='margin:6px 0 0 0;font-size:13px;color:#374151;'>Booking Reference: <strong>{escape(booking_id)}</strong></p>"
        "<div style='margin-top:16px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Customer</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>{escape(customer['fullName'])}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Phone</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(customer['phone'])}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Email</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(customer['email'])}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Appointment</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(appointment_label)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Service Address</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(service_address)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Vehicle</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(vehicle_summary)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Selected Service</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(selected_service)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Add-ons</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(add_ons)}</td></tr>"
        "</table>"
        "</div>"
        "<h2 style='margin:18px 0 8px 0;font-size:18px;color:#111111;'>Payment Summary</h2>"
        "<div style='border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Estimated Total</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>${_format_currency(estimated_total)}</td></tr>"
        f"<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>{escape(deposit_label)}</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>${_format_currency(deposit_paid)}</td></tr>"
        "<tr><td style='padding:10px;background:#111827;color:#ffffff;font-size:14px;font-weight:800;'>Estimated Balance Due After Service</td>"
        f"<td style='padding:10px;background:#111827;color:#ffffff;font-size:14px;font-weight:800;text-align:right;'>${_format_currency(remaining_balance)}</td></tr>"
        "</table>"
        "</div>"
        "<div style='margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;'>"
        "<p style='margin:0;font-size:13px;font-weight:700;color:#2f2f2f;'>Status</p>"
        f"<p style='margin:6px 0 0 0;font-size:13px;color:#374151;'>{'Appointment scheduled' if appointment_label != 'Scheduling in progress' else 'Appointment scheduling in progress'}<br/>{'Deposit paid' if booking.get('depositPaid') else 'Deposit payment pending'}</p>"
        "</div>"
        "<p style='margin:14px 0 0 0;font-size:13px;color:#374151;'>Final price should be confirmed after vehicle inspection and condition review.</p>"
        f"<p style='margin:8px 0 0 0;font-size:13px;color:#374151;'>Customer notes: {escape(notes)}</p>"
        "</div>"
        "</div>"
        "</div>"
        "</div>"
    )

    return {
        "subject": f"New Cruizn Clean Booking — {booking_id}",
        "text": "\n".join(lines),
        "html": html,
    }


def _build_customer_fallback_content(template_variables: dict[str, Any]) -> dict[str, str]:
    """Builds fallback HTML/text content for customer confirmation emails."""
    booking = template_variables["booking"]
    customer = template_variables["customer"]
    vehicles = template_variables["vehicles"]
    estimate = template_variables["estimate"]
    site_url = os.getenv("PUBLIC_SITE_URL", "https://www.cruiznclean.com").rstrip("/")
    support_email = os.getenv("EMAIL_REPLY_TO", os.getenv("EMAIL_FROM", "hello@cruiznclean.com")).strip()
    booking_id = str(booking["bookingId"])
    customer_name = str(customer["fullName"])
    appointment_label = _format_appointment_label(booking)
    vehicle_summary = _format_vehicle_summary(vehicles)
    selected_service = _format_selected_service(vehicles)
    service_address = _format_service_address(customer)
    estimated_total = int(estimate["grandTotal"])
    deposit_paid = _calculate_deposit_amount(estimated_total)
    remaining_balance = max(float(estimated_total) - deposit_paid, 0)
    deposit_received = bool(booking.get("depositPaid"))
    deposit_label = "Deposit Paid Today" if deposit_received else "Deposit Due Today"
    intro_sentence = (
        "Thanks for booking with Cruizn Clean. Your appointment has been scheduled and your deposit has been paid."
        if deposit_received and appointment_label != "Scheduling in progress"
        else "Thanks for booking with Cruizn Clean. Your booking intake has been saved and your deposit is ready for secure payment."
    )
    lines = [
        f"Hi {customer_name},",
        "",
        intro_sentence,
        "",
        "Booking Details",
        f"Booking Reference: {booking_id}",
        f"Appointment: {appointment_label}",
        f"Vehicle: {vehicle_summary}",
        f"Selected Service: {selected_service}",
        f"Service Address: {service_address}",
        "",
        "Payment Summary",
        f"Estimated Service Total: ${_format_currency(estimated_total)}",
        f"{deposit_label}: ${_format_currency(deposit_paid)}",
        f"Estimated Balance Due After Service: ${_format_currency(remaining_balance)}",
        "",
        "Your deposit has been applied toward your estimated service total. The remaining balance is due after your service is completed."
        if deposit_received
        else "Your deposit will be applied toward your estimated service total. The remaining balance is due after your service is completed.",
        "",
        "Deposit Policy",
        "Deposits are calculated as 10% of the estimated total, with a $25 minimum and $100 maximum.",
        "",
        "Important Note",
        "Final pricing is confirmed on-site after vehicle inspection and condition review. Pricing may change if the vehicle requires additional work or if extra services are added.",
        "",
        "Need to make a change?",
        f"Reply to this email or contact us at {SUPPORT_PHONE_DISPLAY}.",
        "",
        "Thank you,",
        "Cruizn Clean",
    ]

    html = (
        "<div style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111111;'>"
        "<div style='max-width:700px;margin:0 auto;padding:24px 16px;'>"
        "<div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;'>"
        "<div style='background:#111111;padding:16px 20px;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr>"
        "<td style='color:#ffffff;font-size:22px;font-weight:700;'>Cruizn Clean</td>"
        "<td style='text-align:right;font-size:12px;'>"
        f"<a href='{site_url}' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Home</a>"
        f"<a href='{site_url}/services' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Services</a>"
        f"<a href='{SUPPORT_PHONE_TEL}' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>{SUPPORT_PHONE_DISPLAY}</a>"
        "</td>"
        "</tr>"
        "</table>"
        "</div>"
        "<div style='padding:20px;'>"
        f"<p style='margin:0;font-size:16px;color:#111111;'>Hi {escape(customer_name)},</p>"
        f"<p style='margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#374151;'>{escape(intro_sentence)}</p>"
        "<h2 style='margin:22px 0 8px 0;font-size:18px;color:#111111;'>Booking Details</h2>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Booking Reference</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>{escape(booking_id)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Appointment</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(appointment_label)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Vehicle</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(vehicle_summary)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Selected Service</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(selected_service)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Service Address</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(service_address)}</td></tr>"
        "</table>"
        "<h2 style='margin:22px 0 8px 0;font-size:18px;color:#111111;'>Payment Summary</h2>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Estimated Service Total</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>${_format_currency(estimated_total)}</td></tr>"
        f"<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>{escape(deposit_label)}</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>${_format_currency(deposit_paid)}</td></tr>"
        "<tr><td style='padding:10px;background:#111827;color:#ffffff;font-size:14px;font-weight:800;'>Estimated Balance Due After Service</td>"
        f"<td style='padding:10px;background:#111827;color:#ffffff;font-size:14px;font-weight:800;text-align:right;'>${_format_currency(remaining_balance)}</td></tr>"
        "</table>"
        f"<p style='margin:12px 0 0 0;font-size:13px;line-height:1.5;color:#374151;'>{escape('Your deposit has been applied toward your estimated service total. The remaining balance is due after your service is completed.' if deposit_received else 'Your deposit will be applied toward your estimated service total. The remaining balance is due after your service is completed.')}</p>"
        "<div style='margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;'>"
        "<p style='margin:0;font-size:13px;font-weight:700;color:#2f2f2f;'>Deposit Policy</p>"
        "<p style='margin:6px 0 0 0;font-size:13px;color:#2f2f2f;'>Deposits are calculated as 10% of the estimated total, with a $25 minimum and $100 maximum.</p>"
        "</div>"
        "<div style='margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;'>"
        "<p style='margin:0;font-size:13px;font-weight:700;color:#2f2f2f;'>Important Note</p>"
        "<p style='margin:6px 0 0 0;font-size:13px;color:#2f2f2f;'>Final pricing is confirmed on-site after vehicle inspection and condition review. Pricing may change if the vehicle requires additional work or if extra services are added.</p>"
        "</div>"
        "<p style='margin:14px 0 0 0;font-size:13px;color:#374151;'>Need to make a change?</p>"
        f"<p style='margin:4px 0 0 0;font-size:13px;color:#374151;'>Reply to this email or contact us at <a href='{SUPPORT_PHONE_TEL}' style='color:#2f2f2f;font-weight:700;text-decoration:none;'>{SUPPORT_PHONE_DISPLAY}</a>.</p>"
        f"<p style='margin:10px 0 0 0;font-size:13px;color:#6b7280;'>Email support: {escape(support_email)}</p>"
        "<p style='margin:18px 0 0 0;font-size:13px;color:#374151;'>Thank you,<br/>Cruizn Clean</p>"
        "</div>"
        "</div>"
        "</div>"
        "</div>"
    )

    return {
        "subject": "Cruizn Clean Booking Confirmed — Deposit Received" if deposit_received else "Cruizn Clean Booking Received — Deposit Pending",
        "text": "\n".join(lines),
        "html": html,
    }


def _post_resend_email(payload: dict[str, Any]) -> None:
    """Sends one email payload to Resend and raises EmailDeliveryError on failure."""
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        raise EmailDeliveryError("RESEND_API_KEY is not configured.")

    request_body = json.dumps(payload).encode("utf-8")
    req = request.Request(RESEND_API_URL, data=request_body, method="POST")
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Content-Type", "application/json")

    try:
        with request.urlopen(req, timeout=20) as response:
            if response.status >= 300:
                response_body = response.read().decode("utf-8", errors="ignore")
                raise EmailDeliveryError(_sanitize_error(response_body))
    except error.HTTPError as exc:
        response_body = exc.read().decode("utf-8", errors="ignore")
        raise EmailDeliveryError(_sanitize_error(f"HTTP {exc.code}: {response_body or exc.reason}")) from exc
    except error.URLError as exc:
        raise EmailDeliveryError(_sanitize_error(str(exc.reason))) from exc


def _send_resend_email(
    *,
    to_address: str,
    subject: str,
    template_id: str,
    template_variables: dict[str, Any],
    fallback_html: str,
    fallback_text: str,
) -> None:
    """Sends via provider template when configured and falls back to inline HTML/text."""
    from_address = os.getenv("EMAIL_FROM", "").strip()
    if not from_address:
        raise EmailDeliveryError("EMAIL_FROM is not configured.")

    reply_to = os.getenv("EMAIL_REPLY_TO", from_address).strip()
    base_payload = {
        "from": from_address,
        "to": [to_address],
        "reply_to": reply_to,
        "subject": subject,
    }

    template_attempt_errors: list[str] = []
    if template_id:
        template_payload_options = [
            {**base_payload, "template_id": template_id, "variables": template_variables},
            {**base_payload, "template_id": template_id, "template_data": template_variables},
            {**base_payload, "templateId": template_id, "variables": template_variables},
        ]

        for candidate in template_payload_options:
            try:
                _post_resend_email(candidate)
                return
            except EmailDeliveryError as exc:
                template_attempt_errors.append(str(exc))

    try:
        _post_resend_email(
            {
                **base_payload,
                "html": fallback_html,
                "text": fallback_text,
            }
        )
    except EmailDeliveryError as exc:
        if template_attempt_errors:
            template_error = _sanitize_error(" | ".join(template_attempt_errors))
            raise EmailDeliveryError(
                f"Template send failed ({template_error}); fallback send failed ({_sanitize_error(str(exc))})."
            ) from exc

        raise


def send_owner_notification_email(booking_record: dict[str, Any]) -> None:
    """Sends owner booking notifications using the configured provider/template path."""
    owner_email = os.getenv("BOOKING_OWNER_EMAIL", "").strip()
    if not owner_email:
        raise EmailDeliveryError("BOOKING_OWNER_EMAIL is not configured.")

    template_variables = _build_template_variables(booking_record)
    fallback_content = _build_owner_fallback_content(template_variables)
    template_id = os.getenv("RESEND_TEMPLATE_OWNER_NOTIFICATION", "").strip()

    _send_resend_email(
        to_address=owner_email,
        subject=fallback_content["subject"],
        template_id=template_id,
        template_variables=template_variables,
        fallback_html=fallback_content["html"],
        fallback_text=fallback_content["text"],
    )


def send_customer_confirmation_email(booking_record: dict[str, Any]) -> None:
    """Sends customer booking confirmations using the configured provider/template path."""
    customer = booking_record.get("customer", {})
    customer_email = _extract_recipient(customer.get("email"))
    if not customer_email:
        raise EmailDeliveryError("Customer email is missing from booking payload.")

    template_variables = _build_template_variables(booking_record)
    fallback_content = _build_customer_fallback_content(template_variables)
    template_id = os.getenv("RESEND_TEMPLATE_CUSTOMER_CONFIRMATION", "").strip()

    _send_resend_email(
        to_address=customer_email,
        subject=fallback_content["subject"],
        template_id=template_id,
        template_variables=template_variables,
        fallback_html=fallback_content["html"],
        fallback_text=fallback_content["text"],
    )


def _build_failure_payload(
    *,
    booking_id: str,
    recipient_role: str,
    recipient: str,
    provider: str,
    error_summary: str,
) -> dict[str, str]:
    """Builds one normalized failure log payload row."""
    return {
        "bookingId": booking_id,
        "recipientRole": recipient_role,
        "provider": provider,
        "to": recipient,
        "errorSummary": _sanitize_error(error_summary),
        "retryStatus": "pending",
    }


def send_booking_transactional_emails(booking_record: dict[str, Any]) -> list[dict[str, str]]:
    """Runs owner/customer transactional sends and returns failure rows for persistence."""
    provider = os.getenv("EMAIL_PROVIDER", "resend").strip().lower()
    booking_id = str(booking_record.get("bookingId", "unknown"))
    customer = booking_record.get("customer", {})

    customer_enabled = _env_flag("EMAIL_CUSTOMER_ENABLED", default=True)
    customer_requested_email = bool(customer.get("sendEmailConfirmation", False))

    failures: list[dict[str, str]] = []

    if provider != "resend":
        error_summary = f"Unsupported EMAIL_PROVIDER '{provider}'."
        failures.append(
            _build_failure_payload(
                booking_id=booking_id,
                recipient_role="owner",
                recipient=os.getenv("BOOKING_OWNER_EMAIL", "").strip(),
                provider=provider,
                error_summary=error_summary,
            )
        )

        if customer_enabled and customer_requested_email:
            failures.append(
                _build_failure_payload(
                    booking_id=booking_id,
                    recipient_role="customer",
                    recipient=_extract_recipient(customer.get("email")),
                    provider=provider,
                    error_summary=error_summary,
                )
            )

        return failures

    try:
        send_owner_notification_email(booking_record)
    except EmailDeliveryError as exc:
        failures.append(
            _build_failure_payload(
                booking_id=booking_id,
                recipient_role="owner",
                recipient=os.getenv("BOOKING_OWNER_EMAIL", "").strip(),
                provider=provider,
                error_summary=str(exc),
            )
        )

    if customer_enabled and customer_requested_email:
        try:
            send_customer_confirmation_email(booking_record)
        except EmailDeliveryError as exc:
            failures.append(
                _build_failure_payload(
                    booking_id=booking_id,
                    recipient_role="customer",
                    recipient=_extract_recipient(customer.get("email")),
                    provider=provider,
                    error_summary=str(exc),
                )
            )

    return failures
