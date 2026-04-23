# Client Handoff Checklist (Demo)

## 1) Environment and Secrets
- [ ] Create local/runtime `.env` files for web and API only (never commit real values).
- [ ] Set `RESEND_API_KEY`.
- [ ] Set `TEMPLATE_ADMIN_TOKEN` (long random token, operator-only).
- [ ] Set `EMAIL_FROM`, `EMAIL_REPLY_TO`, and `BOOKING_OWNER_EMAIL`.
- [ ] Set `PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE_URL`.
- [ ] Set `NEXT_PUBLIC_CAL_COM_URL`.
- [ ] Set `DEMO_MODE` and `ENABLE_TEMPLATE_ADMIN` based on deployment target.
- [ ] Optional: set `API_CORS_ORIGINS` for deployed origins.

## 2) Deployment Mode Matrix
### Demo deployment
- [ ] `DEMO_MODE=true`
- [ ] `ENABLE_TEMPLATE_ADMIN=false`

### Production/client deployment
- [ ] `DEMO_MODE=false`
- [ ] `ENABLE_TEMPLATE_ADMIN=true`
- [ ] `TEMPLATE_ADMIN_TOKEN=<strong secret>`

## 3) Endpoint Readiness Verification
### Demo mode expectations
- [ ] `GET /health` returns exactly `{"status":"ok"}`.
- [ ] `POST /booking-intakes` accepts valid payload and returns accepted demo response with `mode`, `bookingId`, and `receivedAt`.
- [ ] `POST /cal-bookings` mirrors `/booking-intakes` demo behavior.
- [ ] `POST /contact-messages` accepts valid payload and returns accepted response without persistence.
- [ ] `/template-admin/*` returns `404` when `ENABLE_TEMPLATE_ADMIN=false`.

### Production mode expectations
- [ ] `POST /booking-intakes` persists booking and attempts email pipeline.
- [ ] `POST /cal-bookings` matches booking alias behavior.
- [ ] `POST /contact-messages` persists contact message.
- [ ] `/template-admin/*` returns `401` without bearer token.
- [ ] `/template-admin/*` works with valid bearer token.

## 4) Security Verification (Demo Baseline)
- [ ] Confirm no secrets are committed in git history or tracked files.
- [ ] Confirm template-admin token is never sent from frontend browser code.
- [ ] Confirm CORS is appropriate for demo hosts.
- [ ] Confirm booking honeypot behavior works (filled honeypot accepted silently).
- [ ] Confirm 3-vehicle/day policy returns `422` when exceeded.

## 5) Email Flow Verification
### Demo mode
- [ ] Booking with customer opt-in true does not send email.
- [ ] Booking with customer opt-in false does not send email.

### Production mode
- [ ] Booking with customer opt-in true attempts owner + customer emails.
- [ ] Booking with customer opt-in false attempts owner email only.
- [ ] Provider failure logs rows to `data/email_failures.json`.
- [ ] Customer/owner emails show Cruzn Clean branding and grayscale styling.

## 6) UX and Demo Script Checks
- [ ] Home, services, booking, quote, gallery, and email preview routes load.
- [ ] Mobile bottom nav and footer behavior render correctly at demo breakpoints.
- [ ] Booking submission shows clear success state and validation messages.
- [ ] Email preview page clearly indicates mock-only preview behavior.

## 7) Deployment and Ops
- [ ] Deploy web and API to demo hosts with HTTPS.
- [ ] Verify API base URL in web env points to deployed API.
- [ ] Verify Resend domain auth (SPF/DKIM) before live sends.
- [ ] Confirm logs for booking, contact, and email failures are accessible.

## 8) Final Notes
- Demo-safe guarantees:
  - booking/contact requests validate but do not persist in demo mode,
  - booking/contact requests do not send emails in demo mode,
  - template-admin surface is hidden in demo mode.
- Known non-production limitations:
  - booking rate limiter is placeholder,
  - contact endpoint lacks anti-spam controls,
  - local JSON storage is not ideal for concurrent production traffic.
- Recommended next hardening phase:
1. Implement real per-IP rate limiting for booking and contact endpoints.
2. Add contact honeypot/captcha.
3. Move persistence from local JSON files to Supabase/Postgres.
4. Add structured request logging + alerting for repeated failures.
