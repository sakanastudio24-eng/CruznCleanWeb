---
name: gamemate-frontend-service-adapter
description: Keep Expo/React Native service adapters compatible with wrapped DRF API responses and error contracts. Use when backend response envelopes, pagination, status codes, auth behavior, or base URL configuration changes and frontend data parsing must stay stable.
---

# Trigger Conditions
- Run when backend contract changes or frontend parsing errors appear.
- Run when list/detail data mapping diverges between endpoints.
- Run when auth failures are not surfaced correctly in app UI.

# Required Checks
- Normalize wrapped and paginated responses into stable frontend models.
- Normalize error envelopes into consistent app-domain errors.
- Validate API base URL resolution for local vs LAN vs production envs.
- Validate auth header injection (`Bearer`) in all protected service calls.
- Validate request URL builder enforces trailing slash policy consistently.

# Fast Triage
```bash
set -e
rg -n "baseURL|API_URL|Authorization|Bearer|adapter|normalize|results|count" apps -S
rg -n "fetch\\(|axios\\.|client\\." apps -S
npm test -- --runInBand --testPathPattern=adapter || true
```

# Command Examples
```bash
npm test -- --runInBand --testPathPattern=services
rg -n "EXPO_PUBLIC.*API|API_URL|BASE_URL" .env* apps -S
curl -s "$API_BASE_URL/api/v1/groups/" -H "Authorization: Bearer $JWT"
```

# Output Format
```text
FRONTEND ADAPTER COMPAT REPORT
- Endpoint contract inspected: <path>
- Mapping result: <pass/fail + normalized shape>
- Pagination compatibility: <pass/fail>
- Error normalization: <pass/fail>
- Auth/slash/base URL checks: <pass/fail + mismatch>
- Required code changes: <file + function + reason>
```

# Anti-Patterns
- Reading raw `response.data` directly in screens instead of adapter output.
- Assuming list responses are always arrays (ignoring `results` wrappers).
- Concatenating paths manually and creating slash bugs.
- Mixing endpoint contract fixes with unrelated UI styling changes in one commit.

# Done Criteria
- Adapter tests pass for success, pagination, and error paths.
- Screens consume normalized adapter outputs only.
- Base URL, slash policy, and auth header behavior are stable across environments.
