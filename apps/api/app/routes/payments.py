from __future__ import annotations

from fastapi import APIRouter

from app.models.payment import CheckoutSessionRequest, CheckoutSessionResponse
from app.services.stripe_checkout import create_checkout_session

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout-session", response_model=CheckoutSessionResponse)
def create_payment_checkout_session(payload: CheckoutSessionRequest) -> dict:
    """Creates a Stripe Checkout Session for a booking deposit."""
    return create_checkout_session(payload)
