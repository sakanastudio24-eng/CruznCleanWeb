from fastapi import APIRouter

from app.models.contact import ContactMessageRequest
from app.services.runtime_config import is_demo_mode
from app.services.storage import append_contact_record

router = APIRouter(prefix="/contact-messages", tags=["contact"])


@router.post("")
def create_contact_message(payload: ContactMessageRequest) -> dict[str, str]:
    """Validates contact inquiries and persists only when not in demo mode."""
    if is_demo_mode():
        return {
            "status": "accepted",
            "message": "Demo received — no contact message stored.",
        }

    append_contact_record(payload.model_dump())
    return {"status": "accepted"}
