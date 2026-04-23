from __future__ import annotations

from typing import Literal

VehicleSize = Literal["small", "medium", "large"]

# Keep values mirrored with web pricing constants in apps/web/lib/pricing.ts.
SIZE_MULTIPLIERS: dict[VehicleSize, float] = {
    "small": 1.0,
    "medium": 1.15,
    "large": 1.30,
}


def get_size_multiplier(size: VehicleSize) -> float:
    """Returns one configured size multiplier."""
    return SIZE_MULTIPLIERS[size]


def get_adjusted_service_price(base_price: int | float, size: VehicleSize) -> int:
    """Returns a whole-dollar service price adjusted by vehicle size."""
    return round(float(base_price) * get_size_multiplier(size))
