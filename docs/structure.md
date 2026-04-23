# Project Structure (Section B)

```text
/Users/zech/Downloads/The-Big-One/Portfolio
├── apps/
│   ├── web/         # Next.js + TypeScript frontend
│   └── api/         # FastAPI backend
├── data/            # Local JSON persistence for V0
└── docs/            # Planning and architecture docs
```

## Notes
- `apps/web` is mobile-first and uses Tailwind + shadcn/ui as primary UI.
- `apps/api` exposes minimal endpoints for booking intake and health checks.
- `data/bookings.json` is a temporary storage adapter target until Supabase migration.
