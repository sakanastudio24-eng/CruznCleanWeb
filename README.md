# DetailFlow V2

Production-oriented detailing website portfolio project with a Next.js frontend and FastAPI backend.

## Tech Stack
- Web: Next.js (App Router), TypeScript, React, Tailwind CSS
- API: FastAPI (Python)
- Email: Resend
- V1 persistence: local JSON files in `data/`

## Core Web Routes
- `/` home
- `/services` multi-vehicle service builder
- `/booking` booking intake
- `/email-preview` public mock preview for customer/owner emails
- `/contact` non-booking questions
- `/quote` quote request
- `/gallery`, `/faq`, `/privacy`, `/terms`

## API Routes
- `POST /cal-bookings` primary booking intake endpoint
- `POST /booking-intakes` compatibility alias (same behavior)
- `POST /contact-messages` contact form endpoint
- `GET /health` health check

## Endpoint Classification
| Endpoint Group | Exposure | Risk Profile | Demo Behavior |
| --- | --- | --- | --- |
| `GET /health` | Public | Safe (no PII, no secrets) | Returns `{"status":"ok"}` |
| `POST /booking-intakes`, `POST /cal-bookings` | Public | PII + write flow | Validate only in demo mode, no writes/emails |
| `POST /contact-messages` | Public | PII + write flow | Validate only in demo mode, no writes |
| `/template-admin/*` | Private/Admin | Sensitive operator controls | Hidden (`404`) when admin disabled |

### Template Admin Routes (Protected)
All template-admin routes require:
- `Authorization: Bearer <TEMPLATE_ADMIN_TOKEN>`

Routes:
- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

## Booking Email Flow
1. Booking payload is validated.
2. Booking is persisted to `data/bookings.json`.
3. Owner notification email is always attempted.
4. Customer confirmation email is attempted only when:
- `customer.sendEmailConfirmation=true`
- `EMAIL_CUSTOMER_ENABLED=true`
5. Email send failures are logged to `data/email_failures.json`.
6. Booking API stays non-blocking on email provider failures.

## Vehicle Size + Pricing Rules
- Built-in 50-vehicle lookup guide (dropdown quick pick + type finder).
- Lookup can auto-fill `make`, `model`, and `size`; manual size override is always allowed.
- Size multipliers:
- `small = 1.00`
- `medium = 1.15`
- `large = 1.30`
- Multipliers apply to packages and add-ons in Services, Booking, Dock, Cart, and backend email estimate totals.
- `Standard Detail` is preselected for new vehicles and emphasized as the best-value package.

## Booking Limit Policy
- Daily cap: maximum `3` vehicles per customer per intake day.
- Identity key: normalized email + phone digits.
- Counting rule: only vehicles with at least one selected service count.
- Frontend: hard blocks adding a 4th vehicle and shows booking disclaimer text.
- Backend: enforces the same rule and returns `422` when exceeded.

## Environment Setup
`.env` files are git-ignored. Keep secrets local/runtime only.

### API `.env` keys
Required:
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `BOOKING_OWNER_EMAIL`
- `EMAIL_FROM`
- `TEMPLATE_ADMIN_TOKEN`

Optional:
- `EMAIL_REPLY_TO` (defaults to `EMAIL_FROM`)
- `EMAIL_CUSTOMER_ENABLED=true|false`
- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- `OWNER_BOOKING_MANAGE_URL` (supports `{booking_id}` placeholder)
- `PUBLIC_SITE_URL`
- `BOOKING_LIMIT_TIMEZONE` (default `America/Los_Angeles`)
- `DEMO_MODE=true|false` (default `false`)
- `ENABLE_TEMPLATE_ADMIN=true|false` (default `true`)
- `API_CORS_ORIGINS` (comma-separated, defaults to localhost origins)

### Web `.env` keys
- `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`)
- `NEXT_PUBLIC_CAL_COM_URL`

## Local Development
### Web
```bash
cd apps/web
npm install
npm run dev
```

### API
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Vercel Subdomain Deployment
The web app lives in `apps/web`. Root-level `vercel.json` is configured to install and build from that directory.

### One-time Vercel setup
1. Import this repository in Vercel.
2. Confirm `Framework Preset = Next.js`.
3. Confirm `Production Branch = main`.
4. Add web env var `NEXT_PUBLIC_API_BASE_URL=<your-api-origin>`.
5. Deploy.

### Attach your portfolio subdomain
1. Open Vercel project `Settings > Domains`.
2. Add subdomain (example: `detailflow.yourdomain.com`).
3. Create the CNAME record in your DNS provider using Vercel's value.
4. Wait for HTTPS certificate issuance and verify the production URL.

If logs show `No Next.js version detected`, verify Vercel is pointed at this repo path and has not been linked to a parent folder.

## Accessibility Baseline
Current shared UI accessibility baseline:
- Skip link to main content in global layout.
- Landmarks and labeled navigation regions.
- `aria-expanded`/`aria-controls` on cart and quick-help interactions.
- Keyboard-visible focus styles for links, buttons, and form fields.

Pre-launch checks:
1. Keyboard-only pass on Home, Services, Booking, Contact.
2. Lighthouse accessibility audit on Vercel preview and production URLs.
3. 200% zoom pass on desktop and mobile layouts.

## Security Notes
- Never commit real API keys or tokens.
- Keep template admin token private and rotate if exposed.
- `/email-preview` is mock-only and does not use provider credentials.

## Endpoint Security + Demo Readiness
Current status for demo use:
- `GET /health`: ready.
- `POST /booking-intakes` and `POST /cal-bookings`: demo-ready with strong validation, honeypot handling, and 3-vehicle/day policy.
- `POST /contact-messages`: demo-ready with request validation and no PII persistence in demo mode.
- `POST /template-admin/*`: bearer-protected in live mode and hidden in demo mode.

Known limits before production hardening:
- Booking rate limiting is still a placeholder (`is_booking_rate_limited` returns `False`).
- Contact endpoint currently has no rate-limit/honeypot guard.
- Data persistence is local JSON files (no DB transactions or concurrency controls).

Demo vs production environment defaults:
- Demo deployment:
  - `DEMO_MODE=true`
  - `ENABLE_TEMPLATE_ADMIN=false`
- Production/client deployment:
  - `DEMO_MODE=false`
  - `ENABLE_TEMPLATE_ADMIN=true`
  - `TEMPLATE_ADMIN_TOKEN=<secret>`

Behavior details in `DEMO_MODE=true`:
- `POST /booking-intakes` and `POST /cal-bookings`:
  - keeps validation and booking policy checks,
  - returns accepted demo response with `mode`, `bookingId`, and `receivedAt`,
  - does not write files,
  - does not send emails.
- `POST /contact-messages`:
  - validates and returns accepted response,
  - does not write files.
- `/template-admin/*`:
  - returns `404` when `ENABLE_TEMPLATE_ADMIN=false`.

Minimum pre-demo security checklist:
1. Use strong, unique values for `RESEND_API_KEY` and `TEMPLATE_ADMIN_TOKEN`.
2. Verify `EMAIL_FROM` sender domain (SPF/DKIM) in Resend.
3. Set `BOOKING_OWNER_EMAIL` and `EMAIL_REPLY_TO` to real monitored inboxes.
4. Keep template-admin token private and never expose it in frontend code.
5. Run API behind HTTPS (localhost exception for development only).
6. Confirm `PUBLIC_SITE_URL` and Cal.com URL point to your demo environment.

See full operational handoff steps in:
- `docs/client-handoff-checklist.md`

## Git Commit Notes
- Commit by functional section (small, reviewable commits).
- Use scoped commit messages like `feat(booking): ...` or `docs(api): ...`.
- Reference `docs/git-commit-notes.md` for commit templates and suggested messages.

## Documentation Index
- `docs/architecture.md`
- `docs/booking-flow.md`
- `docs/booking-edge-rules.md`
- `docs/client-handoff-checklist.md`
- `docs/accessibility-readiness.md`
- `docs/git-commit-notes.md`
- `docs/project-overview.md`
- `docs/routes.md`
- `docs/vercel-subdomain-deployment.md`
- `docs/email-confirmation-spec.md`
- `docs/email-api-contract.md`
- `docs/email-env-matrix.md`
- `docs/email-ops-runbook.md`
- `docs/email-rollout-plan.md`
- `docs/email-testing-checklist.md`
- `docs/test-implementation.md`
- `docs/email-troubleshooting.md`
