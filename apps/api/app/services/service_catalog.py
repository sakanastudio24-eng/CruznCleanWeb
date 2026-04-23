from __future__ import annotations

from typing import Any

SERVICE_CATALOG: dict[str, dict[str, Any]] = {
    "pkg-mini": {"name": "Mini Detail", "price": 60},
    "pkg-maintenance": {"name": "Maintenance Detail", "price": 99},
    "pkg-full-interior": {"name": "Full Interior", "price": 179},
    "pkg-full-exterior": {"name": "Full Exterior", "price": 279},
    "pkg-full-reset": {"name": "The Full Reset", "price": 399},
    "coat-ceramic-3y": {"name": "3 Year Ceramic Coating", "price": 499},
    "coat-ceramic-6y": {"name": "6 Year Ceramic Coating", "price": 799},
    "coat-wheel-face": {"name": "Wheel Face Ceramic Coating", "price": 249},
    "coat-wheel-complete": {"name": "Wheel Face + Barrel + Caliper Ceramic Coating", "price": 499},
    "coat-glass-basic": {"name": "Glass Ceramic Coating", "price": 200},
    "coat-glass-polish": {"name": "Glass Ceramic Coating + Polish", "price": 279},
    "corr-1-step": {"name": "1 Step Paint Correction", "price": 449},
    "corr-2-step": {"name": "2 Step Paint Correction", "price": 649},
    "corr-3-step": {"name": "3 Step Paint Correction", "price": 799},
}

ALLOWED_SERVICE_IDS = set(SERVICE_CATALOG.keys())
