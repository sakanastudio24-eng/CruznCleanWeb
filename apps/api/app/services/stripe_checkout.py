from __future__ import annotations

from typing import Any

import stripe
from fastapi import HTTPException

from app.models.payment import CheckoutSessionRequest
from app.services.discounts import build_vehicle_pricing_breakdown
from app.services.runtime_config import (
    get_stripe_cancel_url,
    get_stripe_deposit_max_cents,
    get_stripe_deposit_min_cents,
    get_stripe_deposit_percent,
    get_stripe_secret_key,
    get_stripe_success_url,
)
from app.services.service_catalog import SERVICE_CATALOG


def calculate_checkout_totals(payload: CheckoutSessionRequest) -> tuple[int, int]:
    """Calculates estimated total and clamped deposit amount in cents."""
    estimated_total_dollars = 0
    for vehicle in payload.vehicles:
        # Frontend totals are previews only; Stripe uses backend pricing rules as the trusted source.
        breakdown = build_vehicle_pricing_breakdown(vehicle.serviceIds, vehicle.size)
        estimated_total_dollars += int(breakdown["estimatedSubtotal"])

    estimated_total_cents = int(estimated_total_dollars * 100)
    raw_deposit_cents = round(estimated_total_cents * (get_stripe_deposit_percent() / 100))
    deposit_cents = min(
        max(raw_deposit_cents, get_stripe_deposit_min_cents()),
        get_stripe_deposit_max_cents(),
    )
    return estimated_total_cents, deposit_cents


def format_vehicle_detail(vehicle: Any) -> str:
    """Formats one vehicle with its own year, make, model, and optional color."""
    vehicle_name = " ".join(
        part
        for part in [vehicle.year.strip(), vehicle.make.strip(), vehicle.model.strip()]
        if part
    )
    if vehicle.color.strip():
        return f"{vehicle_name} ({vehicle.color.strip()})"

    return vehicle_name


def build_services_summary(payload: CheckoutSessionRequest) -> str:
    """Builds Stripe metadata that preserves each vehicle and selected service names."""
    vehicle_summaries = []
    for vehicle in payload.vehicles:
        breakdown = build_vehicle_pricing_breakdown(vehicle.serviceIds, vehicle.size)
        service_names = [
            SERVICE_CATALOG[service_id]["name"]
            for service_id in vehicle.serviceIds
        ]
        savings = f"; savings ${breakdown['savingsTotal']}" if breakdown["savingsTotal"] else ""
        vehicle_summaries.append(
            f"{format_vehicle_detail(vehicle)}: {', '.join(service_names)}; total ${breakdown['estimatedSubtotal']}{savings}"
        )

    return " | ".join(vehicle_summaries)


def create_checkout_session(payload: CheckoutSessionRequest) -> dict[str, Any]:
    """Creates a hosted Stripe Checkout Session for the booking deposit."""
    stripe_secret_key = get_stripe_secret_key()
    if not stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe checkout is not configured.")

    estimated_total_cents, deposit_cents = calculate_checkout_totals(payload)
    if estimated_total_cents <= 0:
        raise HTTPException(status_code=422, detail="Select at least one service before payment.")

    stripe.api_key = stripe_secret_key
    services_summary = build_services_summary(payload)
    savings_total_cents = sum(
        int(build_vehicle_pricing_breakdown(vehicle.serviceIds, vehicle.size)["savingsTotal"]) * 100
        for vehicle in payload.vehicles
    )

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            customer_email=str(payload.customer.email),
            client_reference_id=payload.bookingId,
            success_url=get_stripe_success_url(),
            cancel_url=get_stripe_cancel_url(),
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": "Cruizn Clean booking deposit",
                            "description": "Deposit applied toward the final detailing service total.",
                        },
                        "unit_amount": deposit_cents,
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "bookingId": payload.bookingId,
                "customerName": payload.customer.fullName,
                "vehicleCount": str(len(payload.vehicles)),
                "estimatedTotalCents": str(estimated_total_cents),
                "savingsTotalCents": str(savings_total_cents),
                "depositCents": str(deposit_cents),
                "servicesSummary": services_summary[:500],
            },
        )
    except stripe.StripeError as exc:
        message = getattr(exc, "user_message", None) or str(exc)
        raise HTTPException(status_code=502, detail=f"Stripe checkout failed: {message}") from exc

    checkout_url = getattr(session, "url", None)
    if not checkout_url:
        raise HTTPException(status_code=502, detail="Stripe did not return a checkout URL.")

    return {
        "checkoutUrl": checkout_url,
        "depositCents": deposit_cents,
        "estimatedTotalCents": estimated_total_cents,
    }
