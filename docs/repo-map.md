# Repo Map

This is the compact map for day-to-day development. Long-term architecture and client history belong in Notion.

## Structure

```text
.
├── apps/
│   ├── web/         # Next.js + TypeScript frontend
│   └── api/         # FastAPI backend
├── attachments/    # Imported image assets used by the frontend
├── data/           # Local JSON persistence for V0
├── docs/           # Short operational docs only
├── .pen/           # Tiny Codex operating context
└── _archive/       # Archived duplicate/history material, not active source
```

## Active App Areas

- `apps/web`: customer-facing Next.js app, booking UI, services UI, gallery, quote/contact pages, and runtime config route
- `apps/api`: FastAPI booking/contact endpoints, email handling, template admin routes, Stripe checkout endpoint, and health route
- `attachments`: image assets imported by web components
- `data`: local JSON persistence used by current V0 flows

## Public Web Routes

- `/`
- `/services`
- `/booking`
- `/gallery`
- `/quote`
- `/contact`
- `/faq`
- `/privacy`
- `/terms`
- `/email-preview` for direct internal QA

## Internal Web Route

- `/styleguide`

## API Routes

- `GET /health`
- `POST /cal-bookings`
- `POST /booking-intakes`
- `POST /contact-messages`
- `POST /payments/checkout-session`
- `/template-admin/*` routes when enabled

## Intent Boundaries

- `/booking`: appointment intake, Cal.com schedule handoff, and Stripe deposit flow
- `/services`: service planning and pricing preview
- `/quote`: custom quote/request flow
- `/contact`: non-booking questions
- `/email-preview`: transactional template QA surface

## Demo And Admin Posture

- `GET /health` is public and returns only status
- `DEMO_MODE=true` validates booking/contact payloads without persistence or sends
- `ENABLE_TEMPLATE_ADMIN=false` keeps `/template-admin/*` unmounted

## Verification Commands

Use only when relevant to the active task:

```bash
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web build
```

API checks depend on the active Python environment and should be run only when the task touches API behavior.
