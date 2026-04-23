# Project Structure

```text
/Users/zech/Downloads/The-Big-One/CruznCLEANv2
├── apps/
│   ├── web/         # Next.js + TypeScript frontend
│   └── api/         # FastAPI backend
├── data/            # Local JSON persistence for V0
└── docs/            # Planning and architecture docs
```

## Notes
- `apps/web` is mobile-first, grayscale-first, and uses a runtime config route for public env injection.
- `apps/api` exposes booking, contact, health, and template-admin endpoints.
- `data/bookings.json` remains the active storage adapter until the Supabase scaffold is wired.
- `docs/front-facing-copy.md` is the client-facing content reference by screen.
