# Git Commit Notes

## Commit Style
Use short, scoped messages:
- `feat(scope): ...` for new functionality
- `fix(scope): ...` for bug fixes
- `docs(scope): ...` for documentation updates
- `refactor(scope): ...` for internal cleanup without behavior changes
- `chore(scope): ...` for maintenance/config

## Section-Based Workflow
For this project workflow:
1. Complete one functional section.
2. Confirm local behavior/tests.
3. Commit that section before moving on.

## Suggested Commit Message Pattern
```text
<type>(<scope>): <summary>

- <key change 1>
- <key change 2>
- <key validation/result>
```

## Current Phase Suggested Commits
1. `feat(booking): enforce 3-car daily cap across UI and API`
- Adds backend daily cap guard with identity/day normalization.
- Adds frontend hard-block and disclaimer placement.
- Keeps email pipeline non-blocking for accepted bookings.

2. `feat(lookup): add ambiguous vehicle-match handling for size guide`
- Adds multi-match helper APIs.
- Prevents implicit auto-apply on ambiguous make/model.
- Preserves manual size override behavior.

3. `refactor(api): centralize service catalog metadata`
- Moves API catalog IDs/prices to shared module.
- Reuses catalog in booking validation and email rendering.
- Reduces duplicate constants.

4. `docs(project): add edge-rule tests and commit notes`
- Adds solved edge-case implementation checklist.
- Updates README documentation index and policy notes.
- Documents commit guidance for section-based workflow.

## Security Note for Commits
- Never include real API keys, tokens, or personal secrets in commits.
- Keep `.env` values local only.
