---
name: gamemate-figma-runtime-parity-expo
description: Validate Figma-to-runtime parity for Expo screens with production-safe behavior. Use when implementing or reviewing screen UI against Figma, especially where API envelope handling, auth-state rendering, spacing tokens, and interaction states must match design intent.
---

# Trigger Conditions
- Run when shipping or refactoring an Expo screen from Figma.
- Run when UI looks correct in static mocks but diverges at runtime data states.
- Run when token/theme/spacing changes affect screen fidelity.

# Required Checks
- Compare runtime screen to Figma for layout, spacing, typography, color, and component states.
- Validate loading, empty, error, and permission-denied states using real adapter outputs.
- Validate wrapped API responses render correctly (no raw envelope leaks in UI).
- Validate base URL/env selection does not break design-critical data fetch on device.
- Validate auth and trailing slash errors show intentional fallback UI.

# Fast Triage
```bash
set -e
rg -n "useQuery|fetch|axios|adapter|loading|empty|error|permission" apps -S
rg -n "font|spacing|color|theme|token" apps -S
npx expo start --lan
```

# Command Examples
```bash
rg -n "Screen|View|Text|StyleSheet" apps/mobile -S
npm test -- --runInBand --testPathPattern=screen
curl -i "$API_BASE_URL/api/v1/groups/" -H "Authorization: Bearer $JWT"
```

# Output Format
```text
FIGMA RUNTIME PARITY REPORT
- Screen: <name>
- Visual parity: <pass/fail + top diffs>
- Runtime-state parity:
  loading=<pass/fail>, empty=<pass/fail>, error=<pass/fail>, unauthorized=<pass/fail>
- API integration parity: <pass/fail + envelope/auth/slash notes>
- Required fixes: <design token, layout, state, or adapter changes>
```

# Anti-Patterns
- Checking only default happy-path mock data against Figma.
- Hardcoding temporary UI values that bypass adapter contracts.
- Ignoring typography/spacing token drift because "close enough."
- Bundling Figma parity fixes with unrelated backend contract changes in one commit.

# Done Criteria
- Visual and state parity are validated against Figma for target screens.
- Runtime data flows (including auth and error paths) match design intent.
- Any parity gap has explicit code fix or approved design deviation note.
