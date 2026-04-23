from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.services.booking_policy import MAX_BOOKED_VEHICLES_PER_DAY
from app.services.service_catalog import ALLOWED_SERVICE_IDS


class CustomerBooking(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    zipCode: str
    sendEmailConfirmation: bool = True
    sendSmsConfirmation: bool = False
    acceptedSmsConsent: bool = False
    notes: str = ""
    acceptedConsent: bool

    @field_validator("fullName")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        """Ensures the customer provides first and last name."""
        normalized = " ".join(value.strip().split())
        if len(normalized.split(" ")) < 2:
            raise ValueError("Enter both first and last name.")

        return normalized

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        """Ensures phone is present and at least 10 digits."""
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 10:
            raise ValueError("Enter a valid phone number with at least 10 digits.")

        return value.strip()

    @field_validator("zipCode")
    @classmethod
    def validate_zip_code(cls, value: str) -> str:
        """Ensures ZIP code is provided."""
        normalized = value.strip()
        if len(normalized) < 5:
            raise ValueError("Enter a valid ZIP code.")

        return normalized

    @model_validator(mode="after")
    def validate_confirmation_preferences(self) -> "CustomerBooking":
        """Ensures at least one confirmation channel is selected and SMS consent is explicit."""
        if not (self.sendEmailConfirmation or self.sendSmsConfirmation):
            raise ValueError("Select at least one confirmation channel.")

        if self.sendSmsConfirmation and not self.acceptedSmsConsent:
            raise ValueError("SMS confirmations require explicit text-message consent.")

        return self


class VehicleSelection(BaseModel):
    id: str
    label: str
    make: str
    model: str
    year: str
    color: str
    size: Literal["small", "medium", "large"]
    serviceIds: list[str]

    @field_validator("year", "make", "model", "color")
    @classmethod
    def validate_required_vehicle_fields(cls, value: str) -> str:
        """Ensures required vehicle fields are not blank."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Vehicle details are required.")

        return normalized

    @field_validator("serviceIds")
    @classmethod
    def validate_service_ids(cls, value: list[str]) -> list[str]:
        """Ensures at least one service is selected for each submitted vehicle."""
        cleaned = [service_id.strip() for service_id in value if service_id.strip()]
        if not cleaned:
            raise ValueError("Select at least one service for each vehicle.")

        unknown_services = [service_id for service_id in cleaned if service_id not in ALLOWED_SERVICE_IDS]
        if unknown_services:
            raise ValueError(f"Invalid service selection: {unknown_services[0]}.")

        return cleaned


class BookingIntakeRequest(BaseModel):
    customer: CustomerBooking
    vehicles: list[VehicleSelection]
    honeypot: str = ""

    @model_validator(mode="after")
    def validate_vehicle_list(self) -> "BookingIntakeRequest":
        """Ensures at least one vehicle payload is provided."""
        if not self.vehicles:
            raise ValueError("At least one vehicle is required.")

        selected_vehicle_count = sum(1 for vehicle in self.vehicles if vehicle.serviceIds)
        if selected_vehicle_count > MAX_BOOKED_VEHICLES_PER_DAY:
            raise ValueError("Daily vehicle limit exceeded. Maximum 3 vehicles per customer per day.")

        vehicle_ids = [vehicle.id.strip() for vehicle in self.vehicles]
        if len(vehicle_ids) != len(set(vehicle_ids)):
            raise ValueError("Each vehicle entry must use a unique ID.")

        return self
