---
name: gamemate-strict-commit-sectioning
description: Enforce strict single-scope commit sectioning for GameMate changes across mobile, backend, docs, and tooling. Use when preparing commits to prevent mixed-scope diffs and to keep reviews auditable after API, auth, env, or contract updates.
---

# Trigger Conditions
- Run before every commit.
- Run when staged files span backend, frontend, and docs together.
- Run when commit message scope does not match staged file scope.

# Required Checks
- Confirm staged files belong to one functional section only.
- Confirm commit message scope matches staged paths and intent.
- Confirm API URL/CORS/auth/header fixes are grouped with relevant tests only.
- Confirm docs-only updates are separated from code changes unless tiny and coupled.
- Confirm no accidental lockfile or generated-file noise is mixed in.

# Fast Triage
```bash
set -e
git status --short
git diff --name-only --cached
git diff --cached --stat
```

# Command Examples
```bash
git add apps/api/app/ apps/api/tests/
git commit -m "fix(api): enforce trailing slash + bearer header checks"
git add apps/mobile/services/ apps/mobile/tests/
git commit -m "fix(mobile): normalize wrapped DRF responses in adapter"
```

# Output Format
```text
COMMIT SECTIONING REPORT
- Proposed section: <api|mobile|docs|infra|tests>
- Staged files reviewed: <count>
- Mixed-scope violations: <none or list>
- Recommended split commits:
  1) <scope + files>
  2) <scope + files>
- Final commit message template: <type(scope): summary>
```

# Anti-Patterns
- One commit containing backend API changes, mobile adapter changes, and doc rewrites.
- Commit scope `fix(api)` while staging mostly mobile files.
- Bundling formatting/noise-only files with logic changes.
- Skipping tests in the same scope for contract/permission/auth changes.

# Done Criteria
- Each commit maps to one clear scope and review unit.
- Commit messages are scoped and traceable to staged files.
- Mixed-scope changes are split before push.
