from __future__ import annotations

from typing import Any, Literal, cast

from app.services.pricing import VehicleSize, get_adjusted_service_price
from app.services.service_catalog import SERVICE_CATALOG

PAINT_COATING_SERVICE_IDS = {"coat-ceramic-3y", "coat-ceramic-6y"}
GLASS_COATING_SERVICE_IDS = {"coat-glass-basic", "coat-glass-polish"}
WHEEL_COATING_SERVICE_IDS = {"coat-wheel-face", "coat-wheel-complete"}
COATING_SERVICE_IDS = PAINT_COATING_SERVICE_IDS | GLASS_COATING_SERVICE_IDS | WHEEL_COATING_SERVICE_IDS
SAVINGS_RATE = 0.2


def normalize_vehicle_size(size: Any) -> VehicleSize:
    """Normalizes incoming vehicle size values to the supported pricing tiers."""
    value = str(size or "sedan_coupe").strip().lower()
    if value in {"sedan_coupe", "small_suv_truck", "large_suv_truck", "oversized"}:
        return cast(VehicleSize, value)

    return "sedan_coupe"


def is_paint_correction(service_id: str) -> bool:
    """Identifies paint correction services that unlock paint coating savings."""
    return service_id.startswith("corr-")


def is_paint_coating(service_id: str) -> bool:
    """Identifies paint coating services eligible for correction and bundle savings."""
    return service_id in PAINT_COATING_SERVICE_IDS


def is_glass_coating(service_id: str) -> bool:
    """Identifies glass coating services used by the coating bundle rule."""
    return service_id in GLASS_COATING_SERVICE_IDS


def is_wheel_coating(service_id: str) -> bool:
    """Identifies wheel coating services used by the coating bundle rule."""
    return service_id in WHEEL_COATING_SERVICE_IDS


def build_vehicle_pricing_breakdown(service_ids: list[str], size: VehicleSize) -> dict[str, Any]:
    """Builds adjusted rows, savings rows, and final total for one vehicle."""
    normalized_service_ids = [service_id for service_id in service_ids if service_id in SERVICE_CATALOG]
    has_correction = any(is_paint_correction(service_id) for service_id in normalized_service_ids)
    has_paint = any(is_paint_coating(service_id) for service_id in normalized_service_ids)
    has_glass = any(is_glass_coating(service_id) for service_id in normalized_service_ids)
    has_wheel = any(is_wheel_coating(service_id) for service_id in normalized_service_ids)
    bundle_qualified = has_paint and has_glass and has_wheel

    def should_discount(service_id: str) -> bool:
        if bundle_qualified:
            return service_id in COATING_SERVICE_IDS

        return has_correction and is_paint_coating(service_id)

    services: list[dict[str, Any]] = []
    subtotal_before_savings = 0
    savings_total = 0

    for service_id in normalized_service_ids:
        service_meta = SERVICE_CATALOG[service_id]
        base_price = int(service_meta["price"])
        original_price = get_adjusted_service_price(base_price, size)
        discount_amount = round(original_price * SAVINGS_RATE) if should_discount(service_id) else 0
        final_price = original_price - discount_amount
        subtotal_before_savings += original_price
        savings_total += discount_amount
        services.append(
            {
                "id": service_id,
                "name": str(service_meta["name"]),
                "basePrice": base_price,
                "originalPrice": original_price,
                "price": final_price,
                "discountAmount": discount_amount,
            }
        )

    savings_label: Literal["Bundle Savings Applied", "Correction Coating Savings Applied"] = (
        "Bundle Savings Applied" if bundle_qualified else "Correction Coating Savings Applied"
    )
    savings_lines = (
        [{"id": "coating-bundle" if bundle_qualified else "correction-coating", "label": savings_label, "amount": savings_total}]
        if savings_total > 0
        else []
    )

    return {
        "services": services,
        "savingsLines": savings_lines,
        "subtotalBeforeSavings": subtotal_before_savings,
        "savingsTotal": savings_total,
        "estimatedSubtotal": subtotal_before_savings - savings_total,
    }
