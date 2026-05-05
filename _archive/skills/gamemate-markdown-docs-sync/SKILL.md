---
name: gamemate-markdown-docs-sync
description: Keep markdown docs synchronized with backend/frontend changes in GameMate. Use when DRF endpoints, permissions, auth flows, environment configuration, or Expo service behavior changes and docs must be updated in the same delivery cycle.
---

# Trigger Conditions
- Run after backend or frontend behavior changes.
- Run when env/setup instructions become stale after local-network fixes.
- Run before release notes, handoff, or PR finalization.

# Required Checks
- Update API docs for endpoint path, methods, envelope, pagination, and status codes.
- Update auth docs for JWT header format and token refresh behavior.
- Update local setup docs for API base URL, ALLOWED_HOSTS, CORS, and device testing mode.
- Update frontend docs when adapter expectations or response mapping change.
- Ensure examples use correct trailing slash policy.

# Fast Triage
```bash
set -e
git diff --name-only HEAD~1..HEAD | sed -n '1,200p'
rg -n "api/v1|Authorization|Bearer|ALLOWED_HOSTS|CORS|EXPO_PUBLIC|trailing slash|pagination" docs README.md -S
```

# Command Examples
```bash
git diff --name-only --cached
rg -n "APIView|ViewSet|permission_classes|pagination" apps/api/app -S
rg -n "API_URL|baseURL|adapter|Authorization" apps -S
```

# Output Format
```text
DOCS SYNC REPORT
- Code changes detected: <backend/frontend paths>
- Docs touched: <files>
- Coverage:
  API contract=<pass/fail>
  auth workflow=<pass/fail>
  env/network setup=<pass/fail>
  adapter behavior=<pass/fail>
- Missing doc updates: <list>
- Required markdown edits: <file + section>
```

# Anti-Patterns
- Shipping API contract changes without updating docs.
- Leaving stale `.env` examples that point to wrong host for physical device testing.
- Documenting auth with ambiguous header format.
- Hiding major docs updates inside unrelated mixed-scope commits.

# Done Criteria
- All changed backend/frontend behavior has matching markdown updates.
- Setup docs are runnable for simulator and physical-device paths.
- API/auth examples are consistent with current contract and slash policy.
