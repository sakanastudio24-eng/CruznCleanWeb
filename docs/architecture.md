# Architecture

## Monorepo Layout
- `apps/web`: Next.js frontend (App Router)
- `apps/api`: FastAPI backend
- `data`: local JSON persistence for V1 (`bookings.json`, `contacts.json`, `email_failures.json`)
- `docs`: implementation and operations documentation

## Runtime Flow
1. Customer configures services/vehicles in the web app.
2. Web submits intake payload to `POST /cal-bookings`.
3. FastAPI validates payload and anti-abuse checks (honeypot + rate-limit placeholder).
4. FastAPI persists booking to local storage.
5. FastAPI attempts transactional sends via Resend:
- Owner notification: always attempted.
- Customer confirmation: attempted only when `sendEmailConfirmation=true` and customer emails are enabled.
6. Any send failure is logged to `data/email_failures.json`.
7. API still returns accepted when persistence succeeds.
8. Frontend continues to calendar scheduling via Cal.com link.

## Email Rendering Model
- Provider templates are supported through template IDs.
- Inline fallback HTML/text emails are used when template IDs are not configured.
- Customer and owner fallback templates share brand styling and structured receipt data.

## Template Admin Layer
- FastAPI exposes protected `/template-admin/*` routes.
- Routes call Resend template APIs through Python SDK.
- Auth uses bearer token `TEMPLATE_ADMIN_TOKEN`.

## Current Limits and Deferred Work
- Storage is local JSON (not durable for distributed/serverless production).
- Rate limit logic is a placeholder and returns `False` by default.
- SMS delivery is not implemented in V1.
- Webhook-driven post-booking lifecycle (created/cancelled/rescheduled) is planned for next phase.
