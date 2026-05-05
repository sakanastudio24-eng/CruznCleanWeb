---
name: gamemate-mobile-network-reliability
description: Stabilize Expo + React Native physical-device testing against a Django DRF backend on local networks. Use when debugging device-to-API connectivity, API URL environment mismatches, ALLOWED_HOSTS/CORS failures, trailing-slash issues, auth header issues, or flaky LAN/tunnel behavior.
---

# Trigger Conditions
- Run when app works in simulator/web but fails on a physical device.
- Run when requests fail with `Network Error`, `ECONNREFUSED`, `401`, `403`, `404`, or `CORS` errors.
- Run when backend is reachable from laptop but not from phone.

# Required Checks
- Resolve API base URL from active Expo env and confirm it is not `localhost` for physical devices.
- Verify phone and backend host are on the same reachable network path (`LAN`, `Tunnel`, or USB reverse).
- Verify DRF `ALLOWED_HOSTS` contains host/IP actually used by Expo client.
- Verify CORS config allows mobile/web origins used in local testing.
- Verify request path style (trailing slash policy) matches DRF router config.
- Verify `Authorization: Bearer <token>` header is sent on protected endpoints.

# Fast Triage
```bash
set -e
ipconfig getifaddr en0 || ifconfig | rg "inet "
rg -n "EXPO_PUBLIC.*API|API_URL|BASE_URL" .env* apps -S
curl -i "${API_BASE_URL:-http://127.0.0.1:8000}/health/" || true
curl -i "${API_BASE_URL:-http://127.0.0.1:8000}/api/" -H "Authorization: Bearer ${JWT:-invalid}" || true
```

# Command Examples
```bash
npx expo start --lan
adb reverse tcp:8000 tcp:8000
curl -i "http://192.168.1.25:8000/api/v1/groups/" -H "Authorization: Bearer $JWT"
```

# Output Format
```text
MOBILE NETWORK RELIABILITY REPORT
- Active mode: <LAN|Tunnel|USB reverse>
- API base URL source: <file + variable + value>
- Reachability: <pass/fail + endpoint + status>
- Auth/trailing-slash check: <pass/fail + example request>
- ALLOWED_HOSTS/CORS findings: <exact mismatch and fix>
- Remediation steps:
  1) ...
  2) ...
```

# Anti-Patterns
- Using `localhost` or `127.0.0.1` in Expo env for physical-device testing.
- Allowing wildcard CORS/hosts instead of exact local origins/hosts.
- Mixing URL styles (`/endpoint` and `/endpoint/`) across app services.
- Debugging auth failures before validating network path and base URL.

# Done Criteria
- Physical device successfully reaches health and one protected endpoint.
- Expo env base URL is correct for the chosen network mode.
- DRF host/CORS settings match runtime origin and host.
- Auth header and trailing slash behavior are consistent across tested calls.
