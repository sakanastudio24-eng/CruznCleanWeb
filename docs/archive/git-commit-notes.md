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
1. `feat(pricing): apply conditional savings across booking flow`
- Recalculates savings from service IDs and vehicle size rules.
- Keeps frontend totals as previews only.
- Uses backend-derived totals for email and Stripe deposit creation.

2. `feat(content): add service requirements and premium promo copy`
- Adds service-readiness requirements to customer-facing help surfaces.
- Keeps the seasonal banner visually premium without changing booking logic.
- Preserves the 3-step booking flow: details, schedule, payment.

3. `docs(copy): refresh front-facing site copy`
- Documents current customer-visible copy by route.
- Captures trusted-pricing and payment-flow expectations.
- Keeps launch review wording in one place.

## Security Note for Commits
- Never include real API keys, tokens, or personal secrets in commits.
- Keep `.env` values local only.
