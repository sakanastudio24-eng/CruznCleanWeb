from fastapi import APIRouter, Request

from app.models.booking import BookingIntakeRequest
from app.routes.booking_intakes import process_booking_intake

router = APIRouter(prefix="/cal-bookings", tags=["booking"])


@router.post("")
def create_cal_booking(payload: BookingIntakeRequest, request: Request) -> dict[str, str]:
    """Accepts Cal.com-ready booking intake payloads."""
    return process_booking_intake(payload, request.client.host if request.client else None)
