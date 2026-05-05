---
name: gamemate-postman-jwt-workflow
description: Keep Postman and Newman JWT authentication workflows correct for Django DRF APIs. Use when debugging token acquisition/refresh, Authorization header issues, trailing slash endpoint mismatches, or environment base URL drift between local, device, and CI.
---

# Trigger Conditions
- Run when Postman requests return `401` unexpectedly.
- Run when collections work in app but fail in Newman/CI.
- Run when auth endpoints or JWT lifetimes are changed.

# Required Checks
- Validate login request saves `access` and `refresh` tokens to environment.
- Validate protected requests send `Authorization: Bearer {{access_token}}`.
- Validate refresh flow updates `access_token` before protected calls.
- Validate all request URLs use the active `base_url` env and correct trailing slash.
- Validate environment does not point device tests to unreachable `localhost`.

# Fast Triage
```bash
set -e
rg -n "base_url|access_token|refresh_token|Authorization" postman* docs apps -S || true
newman run postman/GameMate.postman_collection.json -e postman/local.postman_environment.json --bail || true
```

# Command Examples
```bash
newman run postman/GameMate.postman_collection.json -e postman/local.postman_environment.json
newman run postman/GameMate.postman_collection.json -e postman/lan.postman_environment.json --folder "Auth"
curl -i "$API_BASE_URL/api/token/" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"secret"}'
```

# Output Format
```text
POSTMAN JWT WORKFLOW REPORT
- Environment file: <name>
- base_url: <value + reachable yes/no>
- Token capture: <pass/fail>
- Bearer header injection: <pass/fail>
- Refresh flow: <pass/fail>
- Slash alignment: <pass/fail>
- Remediation: <collection/env script updates>
```

# Anti-Patterns
- Using `JWT {{token}}` or missing `Bearer` prefix.
- Storing tokens in globals while reading from environment variables.
- Mixing `/api/token` and `/api/token/` across collection requests.
- Keeping one environment for both simulator-localhost and LAN-device testing.

# Done Criteria
- Auth folder and protected folder pass in Postman/Newman with current env.
- Token acquisition and refresh are automatic and deterministic.
- All request URLs and auth headers are consistent and reusable across environments.
