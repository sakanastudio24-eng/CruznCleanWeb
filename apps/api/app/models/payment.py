from __future__ import annotations

from pydantic import BaseModel, EmailStr, field_validator

from app.models.booking import VehicleSelection


class PaymentCustomer(BaseModel):
    fullName: str
    email: EmailStr

    @field_validator("fullName")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        """Ensures Stripe Checkout metadata has a customer name."""
        normalized = " ".join(value.strip().split())
        if not normalized:
            raise ValueError("Customer name is required.")

        return normalized


class CheckoutSessionRequest(BaseModel):
    bookingId: str
    customer: PaymentCustomer
    vehicles: list[VehicleSelection]

    @field_validator("bookingId")
    @classmethod
    def validate_booking_id(cls, value: str) -> str:
        """Ensures checkout sessions are tied back to one saved booking intake."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Booking ID is required.")

        return normalized


class CheckoutSessionResponse(BaseModel):
    checkoutUrl: str
    depositCents: int
    estimatedTotalCents: int
