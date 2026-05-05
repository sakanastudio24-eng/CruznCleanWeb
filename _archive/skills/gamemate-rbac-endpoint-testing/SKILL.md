---
name: gamemate-rbac-endpoint-testing
description: Validate role-based access control for group endpoints in Django DRF across owner, admin, member, non-member, and anonymous users. Use when changing group permissions, membership logic, or endpoint access rules and status code behavior.
---

# Trigger Conditions
- Run when group membership or role permissions change.
- Run when protected endpoint behavior differs by user role.
- Run when non-member access should be hidden or forbidden.

# Required Checks
- Test each endpoint/action against `owner`, `admin`, `member`, `non-member`, `anonymous`.
- Validate expected status code per role and method (`GET`, `POST`, `PATCH`, `DELETE`).
- Validate payload shape consistency for denied responses.
- Validate auth header handling (`Bearer`) for protected routes.
- Validate route style with and without trailing slash for each protected endpoint.

# Fast Triage
```bash
set -e
rg -n "IsAuthenticated|permission_classes|has_object_permission|role|membership" apps/api/app -S
pytest apps/api/tests -q -k "group and (permission or role or member)" || true
```

# Command Examples
```bash
pytest apps/api/tests -q -k "owner or admin or member or non_member"
pytest apps/api/tests/test_groups_permissions.py -q
curl -i "$API_BASE_URL/api/v1/groups/$GROUP_ID/" -H "Authorization: Bearer $MEMBER_JWT"
```

# Output Format
```text
RBAC ENDPOINT TEST REPORT
- Endpoint: <method path>
- Expected outcomes:
  owner=<code>, admin=<code>, member=<code>, non_member=<code>, anonymous=<code>
- Actual outcomes:
  owner=<code>, admin=<code>, member=<code>, non_member=<code>, anonymous=<code>
- Contract check: <pass/fail for response shape>
- Failures: <role + endpoint + mismatch>
- Fix plan: <permission/test updates>
```

# Anti-Patterns
- Testing only authenticated vs unauthenticated, skipping role variants.
- Returning `403` where API policy expects hidden-resource `404` for non-members.
- Hardcoding one JWT token across role tests.
- Mixing role-rule changes with unrelated frontend/docs changes in one commit.

# Done Criteria
- Role matrix tests exist and pass for all touched group endpoints.
- Denied responses are contract-consistent and policy-correct.
- Any changed role policy is documented and reflected in tests.
