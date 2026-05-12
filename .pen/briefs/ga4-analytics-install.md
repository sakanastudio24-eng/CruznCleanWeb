# GA4 Analytics Install Plan

## Mode
Plan

## Goal
Plan a safe Google Analytics 4 installation for Cruizn Clean that tracks meaningful business actions without sending private customer information to Google Analytics.

Do not implement GA4 yet. Inspect relevant files first and produce a build-ready implementation plan.

## Read / Inspect First
Inspect only files relevant to GA4 planning:

- Root and web package files
- App/root layout files
- Env schema and setup/deployment docs
- Existing analytics, tag, runtime config, or site-profile utilities if present
- Services page and service selection components
- Booking page and booking-entry components
- Contact and quote form files
- Footer/header/social link components
- Checkout start and thank-you/success page files
- Existing Stripe checkout/success logic for inspection only

## Inspect Only
Read only:

- `package.json`
- `apps/web/package.json`
- `apps/web/app/layout.tsx`
- `docs/deployment.md`
- Existing analytics/tag/runtime config files under `apps/web/lib`
- Service selection files under `apps/web/app/services` and `apps/web/components/sections`
- Booking page and booking UI files under `apps/web/app/booking` and `apps/web/components/booking`
- Contact and quote page files under `apps/web/app/contact` and `apps/web/app/quote`
- Header/footer/social link components under `apps/web/components/layout`
- Checkout and success files under `apps/web/app/api/payments`, `apps/web/app/thank-you`, and `apps/web/lib/api-client.ts`

Do not inspect real `.env*` files or customer data files.

## Plan Requirements

### Global GA Tag Install
Plan how to add the GA4 global tag safely:

- Use `NEXT_PUBLIC_GA_ID`
- Load GA only when `NEXT_PUBLIC_GA_ID` exists
- Do not hardcode a real GA ID
- Do not break rendering when the env value is missing
- Prefer the existing Next.js layout/script patterns in the repo

### Reusable Analytics Helper
Plan a small reusable analytics helper:

- No-op on the server
- No-op when `window.gtag` is unavailable
- Optionally log missing GA only in development
- Send events with `window.gtag("event", eventName, params)`
- Keep event names and params typed where practical

### TypeScript Global Types
Plan TypeScript globals for:

- `window.gtag`
- `window.dataLayer`

### Business Event Placement
Plan where to add only meaningful business events:

- `click_book_now`
- `click_call`
- `click_instagram`
- `select_service`
- `start_booking`
- `generate_lead`
- `begin_checkout`
- `purchase` only after a safe confirmed payment/success state exists

Recommended GA4 key events later:

- `generate_lead`
- `click_call`
- `purchase`

### Privacy Protections
Do not send private customer information to GA.

Never send:

- Customer name
- Phone number
- Email
- Address
- Customer notes
- License plate
- Private booking details

Allowed event params:

- `page`
- `location`
- `form_name`
- `lead_type`
- `service_interest`
- `service_name`
- Generic `vehicle_type` only
- `selected_total` if already shown publicly
- `currency`
- `value`
- `checkout_type`
- Safe transaction/order reference only if it is not private customer data

### Docs / Env Plan
Plan updates for:

- `NEXT_PUBLIC_GA_ID` in env schema/docs
- GA4 Realtime or DebugView testing
- GA4 key events to mark later:
  - `generate_lead`
  - `click_call`
  - `purchase`

## Approval Required Before
Human approval is required before:

- Adding or changing env variables
- Editing deployment settings
- Reading or editing customer data files
- Changing Stripe/payment success logic
- Adding checkout success or purchase event logic
- Changing webhook behavior
- Running production testing
- Deploying
- Running production payment, booking, Cal.com, or email flows

## Do Not Touch
Do not edit or inspect secrets from:

- `.env`
- `.env.local`
- `.env.production`
- Stripe secret keys
- Webhook secrets

Do not use or mutate:

- Real customer data
- Production Vercel settings
- Production Stripe
- Production Cal.com
- Production Resend/email sends

## Done When
The planning task is complete when Codex reports:

- Pen check result
- Whether the Approval Gate includes the explicit approval items
- Relevant files inspected
- Current analytics/env findings
- Proposed GA4 architecture
- Proposed event map with file locations
- Events safe to build now
- Events that should wait
- Docs/env updates needed
- Privacy protections
- Test plan
- Risks/open questions
- Whether the GA4 task is ready for Build mode
- Commit/push status with no commit and no push

## Output Required
Return a Plan-mode implementation plan with:

- Goal completed? yes/no/partial
- Relevant files inspected
- Current analytics/tag/env findings
- Proposed GA4 architecture
- Proposed event map
- Privacy protections
- Env/docs updates
- Approval gates confirmed
- Test plan
- Risks / open questions
- Commit / push status: no commit, no push
