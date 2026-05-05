# Debloat Manifest

This manifest captures repo cleanup candidates from the debloat audit. It is a planning file only.

No files should be deleted, moved, archived, renamed, or consolidated from this manifest without explicit human approval.

## Keep In Repo

- `apps/web/**`: active Next.js application source, UI, tests, and web assets
- `apps/api/**`: active FastAPI source, templates, helpers, and tests
- `attachments/*`: imported image assets used by the frontend until an import audit proves otherwise
- `data/*.json`: local booking/contact/runtime data; keep human-owned for now
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`: package manager and workspace config
- `vercel.json`, `.vercelignore`, `.gitignore`: deployment and ignore behavior
- `README.md`, `DEV_GUIDE.md`, `LICENSE`
- `docs/front-facing-copy.md`: active customer-facing copy reference

## Keep But Shorten Or Consolidate Later

- `docs/vercel-subdomain-deployment.md`
- `docs/email-api-contract.md`
- `docs/email-env-matrix.md`
- `docs/email-ops-runbook.md`
- `docs/email-troubleshooting.md`
- `docs/booking-flow.md`
- `docs/booking-edge-rules.md`
- `docs/routes.md`
- `docs/structure.md`
- `docs/test-implementation.md`

Target consolidated repo docs:

- `docs/deployment.md`
- `docs/booking.md`
- `docs/repo-map.md`

## Move To Notion Manually Before Repo Cleanup

- `docs/architecture.md`
- `docs/project-overview.md`
- `docs/design-system.md`
- `docs/homepage-v1.md`
- `docs/ui-parity-pass.md`
- `docs/client-handoff-checklist.md`
- `docs/accessibility-readiness.md`
- `docs/email-confirmation-spec.md`
- `docs/email-rollout-plan.md`
- `docs/email-testing-checklist.md`

These are long-term decisions, historical notes, rollout memory, or client handoff material. Notion is the source of truth for that content.

## Archive Outside Repo After Approval

- `DetailFlow App/**`: duplicate-looking project snapshot with nested app/docs/assets/dependencies
- `skills/gamemate-*/SKILL.md`: unrelated reusable AI skill content
- `docs/git-commit-notes.md`: historical commit planning

Archive first, then remove from repo only after human review confirms nothing active depends on these files.

## Delete Later After Approval

Generated or local-only artifacts:

- `node_modules/**`
- `apps/web/node_modules/**`
- `DetailFlow App/**/node_modules/**`
- `.pnpm-store/**`
- `apps/web/.next/**`
- `apps/web/.next.stale.1771112970/**`
- `apps/api/.venv/**`
- `.DS_Store`
- `attachments/.DS_Store`

Do not delete these during the controlled prep phase. Deletion still needs approval.

## Do Not Touch Without Separate Approval

- source code
- tests
- package/config files
- lockfiles
- env examples or schemas
- legal and policy docs
- deployment docs
- files referenced by package scripts, README, imports, tests, or deployment configuration
- auth, payment, Stripe, Cal.com, booking, API, webhook, or navigation behavior
- `data/*.json`
- `attachments/*`

## Phase 2 Approval Prompt

```md
Approve Controlled Debloat Phase 2:

1. Move long-term docs identified in `docs/debloat-manifest.md` to Notion manually before repo cleanup.
2. Consolidate operational docs into `docs/deployment.md`, `docs/booking.md`, and `docs/repo-map.md`.
3. Archive `DetailFlow App/**`, `skills/gamemate-*/`, and `docs/git-commit-notes.md` outside the repo.
4. Delete only generated local artifacts after archive review: `node_modules/**`, `.pnpm-store/**`, `.next*/**`, `.venv/**`, `.DS_Store`.

Do not touch `apps/web`, `apps/api`, `attachments`, `data`, env files, lockfiles, package/config, legal/policy, deployment, payment, Stripe, Cal.com, booking, API, or navigation without separate approval.
```
