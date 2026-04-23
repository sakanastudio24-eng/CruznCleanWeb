from __future__ import annotations

from typing import Literal

VehicleSize = Literal["sedan_coupe", "small_suv_truck", "large_suv_truck", "oversized"]

# Keep values mirrored with web pricing constants in apps/web/lib/pricing.ts.
SIZE_MULTIPLIERS: dict[VehicleSize, float] = {
    "sedan_coupe": 1.0,
    "small_suv_truck": 1.20,
    "large_suv_truck": 1.40,
    "oversized": 1.50,
}


def get_size_multiplier(size: VehicleSize) -> float:
    """Returns one configured size multiplier."""
    return SIZE_MULTIPLIERS[size]


def get_adjusted_service_price(base_price: int | float, size: VehicleSize) -> int:
    """Returns a whole-dollar service price adjusted by vehicle size."""
    return round(float(base_price) * get_size_multiplier(size))
