from __future__ import annotations

from typing import Any

SERVICE_CATALOG: dict[str, dict[str, Any]] = {
    "pkg-basic": {"name": "Basic Detail", "price": 99},
    "pkg-standard": {"name": "Standard Detail", "price": 189},
    "pkg-premium": {"name": "Premium Detail", "price": 349},
    "addon-ceramic": {"name": "Ceramic Coating", "price": 500},
    "addon-headlight": {"name": "Headlight Restoration", "price": 75},
    "addon-air": {"name": "Air Freshening Treatment", "price": 125},
    "addon-engine": {"name": "Engine Bay Detail", "price": 100},
}

ALLOWED_SERVICE_IDS = set(SERVICE_CATALOG.keys())
