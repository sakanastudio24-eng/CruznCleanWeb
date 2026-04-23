from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.booking_intakes import router as booking_router
from app.routes.cal_bookings import router as cal_booking_router
from app.routes.contact_messages import router as contact_router
from app.routes.health import router as health_router
from app.routes.template_admin import router as template_admin_router
from app.services.runtime_config import get_cors_origins, is_template_admin_enabled

app = FastAPI(title="Cruzn Clean API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(booking_router)
app.include_router(cal_booking_router)
app.include_router(contact_router)
if is_template_admin_enabled():
    app.include_router(template_admin_router)
