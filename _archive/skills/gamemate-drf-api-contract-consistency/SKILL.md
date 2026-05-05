---
name: gamemate-drf-api-contract-consistency
description: Enforce consistent Django DRF API contracts for envelopes, pagination, permissions, and status codes. Use when adding/updating endpoints, fixing response drift, validating trailing slash behavior, or aligning frontend adapter expectations with backend responses.
---

# Trigger Conditions
- Run when a DRF view/serializer/router is added or changed.
- Run when frontend parsing breaks after backend updates.
- Run when API status codes differ between similar endpoints.

# Required Checks
- Confirm response envelope schema is consistent for success and errors.
- Confirm pagination shape is stable (`count`, `next`, `previous`, `results` or declared custom schema).
- Confirm permission behavior returns documented status (`401`, `403`, `404`, `200`, `201`, `204`).
- Confirm trailing slash behavior is deterministic (no accidental redirects/404s).
- Confirm auth header expectation is explicit (`Bearer` JWT).

# Fast Triage
```bash
set -e
rg -n "DEFAULT_PAGINATION_CLASS|PAGE_SIZE|DEFAULT_PERMISSION_CLASSES|APPEND_SLASH" apps/api -S
rg -n "Response\\(|status=|permission_classes|pagination_class" apps/api/app -S
pytest apps/api/tests -q -k "contract or pagination or permission" || true
```

# Command Examples
```bash
curl -sS -i "$API_BASE_URL/api/v1/groups/" -H "Authorization: Bearer $JWT"
curl -sS -i "$API_BASE_URL/api/v1/groups" -H "Authorization: Bearer $JWT"
pytest apps/api/tests -q -k "status_code and envelope"
```

# Output Format
```text
DRF CONTRACT CONSISTENCY REPORT
- Endpoint: <method path>
- Envelope: <pass/fail + expected vs actual>
- Pagination: <pass/fail + keys>
- Permissions/status codes: <matrix summary>
- Slash/auth behavior: <pass/fail>
- Required backend changes: <file + action>
- Required frontend adapter changes: <file + action or none>
```

# Anti-Patterns
- Returning raw serializer arrays on one endpoint and wrapped objects on another.
- Using inconsistent error payload shapes across permission/auth failures.
- Relying on implicit redirect from missing trailing slash.
- Returning `200` where creation/deletion semantics require `201`/`204`.

# Done Criteria
- Contract tests pass for envelope, pagination, and status code matrix.
- Slash policy and auth header expectation are explicit and validated.
- Frontend adapter assumptions match backend output for all touched endpoints.
