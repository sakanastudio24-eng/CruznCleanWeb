# Project Map

Cruizn Clean is a pnpm monorepo.

## Active Code

- `apps/web/`: Next.js App Router website and booking UI
- `apps/api/`: FastAPI service, email/payment helpers, and tests

## Shared Assets and Data

- `attachments/`: imported customer-facing images; do not remove until import audit passes
- `data/`: local JSON data; treat as human-owned unless a task explicitly allows edits

## Operational Docs

- `README.md`
- `DEV_GUIDE.md`
- `docs/front-facing-copy.md`
- Future lean docs target: `docs/deployment.md`, `docs/booking.md`, `docs/repo-map.md`

## Root Config

- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`
- `vercel.json`, `.vercelignore`, `.gitignore`, `LICENSE`

## Known Bloat Candidates

- `docs/*.md`: many long-term memory docs; move or consolidate only after approval
- generated local folders: `node_modules/`, `.pnpm-store/`, `.next*/`, `.venv/`, `.DS_Store`

## Archived Material

- `DetailFlow App/` has been archived under `_archive/DetailFlow App/`
- `skills/gamemate-*` has been archived under `_archive/skills/`
- Generated/cache deletion still requires separate approval
- Permanent deletion of archived material still requires separate approval
