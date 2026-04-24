from __future__ import annotations

import json
import os
from pathlib import Path
import sys
from urllib import error, request


API_BASE_URL = os.getenv("TEMPLATE_ADMIN_API_BASE_URL", os.getenv("API_BASE_URL", "http://127.0.0.1:8000")).rstrip("/")
TEMPLATE_PATH = Path(__file__).resolve().parents[1] / "templates" / "resend_customer_confirmation_test.json"


def _load_template_payload() -> bytes:
    """Loads the safe test template payload bundled with the API app."""
    return TEMPLATE_PATH.read_bytes()


def _extract_template_id(response_body: str) -> str:
    """Extracts the provider template ID from the template-admin response."""
    try:
        payload = json.loads(response_body)
    except json.JSONDecodeError:
        return ""

    data = payload.get("data")
    if isinstance(data, dict):
        template_id = data.get("id")
        if isinstance(template_id, str):
            return template_id

    return ""


def main() -> int:
    """Creates one Resend test template through the protected template-admin API."""
    admin_token = os.getenv("TEMPLATE_ADMIN_TOKEN", "").strip()
    if not admin_token:
        print("TEMPLATE_ADMIN_TOKEN is required.", file=sys.stderr)
        return 2

    endpoint = f"{API_BASE_URL}/template-admin/templates"
    req = request.Request(endpoint, data=_load_template_payload(), method="POST")
    req.add_header("Authorization", f"Bearer {admin_token}")
    req.add_header("Content-Type", "application/json")

    try:
        with request.urlopen(req, timeout=30) as response:
            response_body = response.read().decode("utf-8", errors="ignore")
    except error.HTTPError as exc:
        response_body = exc.read().decode("utf-8", errors="ignore")
        print(f"Template seed failed with HTTP {exc.code}: {response_body}", file=sys.stderr)
        return 1
    except error.URLError as exc:
        print(f"Template seed failed: {exc.reason}", file=sys.stderr)
        return 1

    template_id = _extract_template_id(response_body)
    if template_id:
        print(f"Created Resend template: {template_id}")
        print("Set RESEND_TEMPLATE_CUSTOMER_CONFIRMATION to this ID for template-send testing.")
    else:
        print(response_body)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
