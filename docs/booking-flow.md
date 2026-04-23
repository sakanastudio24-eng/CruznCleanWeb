# Booking Flow (Current)

## Customer Path
1. Customer selects vehicle size using cards or the 50-vehicle lookup guide in `/services`.
2. Customer selects services per vehicle in `/services`.
3. Size-based pricing updates instantly for package/add-on cards and totals.
4. Vehicle/service state is carried into `/booking`.
5. Customer completes intake fields and communication preferences.
6. Frontend posts payload to `POST /cal-bookings`.
7. API returns accepted and frontend shows confirmation state.
8. Customer proceeds to Cal.com for slot selection.

## API Processing Order
1. Validate payload (name, email, vehicle fields, `size`, service selection, consent rules).
2. Run rate-limit placeholder hook.
3. Run anti-bot honeypot check.
4. Run daily vehicle-cap guard (`max 3` selected-service vehicles per customer per intake day).
5. Persist booking in `data/bookings.json`.
6. Trigger transactional email pipeline with size-adjusted service estimate values.
7. Log any email failure rows in `data/email_failures.json`.
8. Return accepted response regardless of send failure if persistence succeeded.

## Vehicle Cap Policy
- Maximum: `3` vehicles per customer per intake day.
- Identity key: normalized `customer.email` + normalized `customer.phone` (digits only).
- Day basis: intake submission day (not appointment day).
- Day timezone: `BOOKING_LIMIT_TIMEZONE` env var (default `America/Los_Angeles`).
- Count basis: only vehicles with at least one selected service.
- UI behavior: hard block add-vehicle beyond 3 with helper text + disclaimer on booking page.
- API behavior: returns `422` with `Daily vehicle limit exceeded. Maximum 3 vehicles per customer per day.`

## Size Pricing Rules
- Multipliers:
- `small = 1.00`
- `medium = 1.15`
- `large = 1.30`
- Applies to package and add-on totals across Services, Booking, Dock/Cart, and backend email estimates.
- Manual size override remains available after lookup matches.

## Email Send Rules
- Owner notification: always attempted.
- Customer confirmation: attempted only when `customer.sendEmailConfirmation=true` and `EMAIL_CUSTOMER_ENABLED=true`.
- SMS preference is captured/validated, but SMS delivery is not part of V1.

## Parallel Contact Flow
- `/contact` submits to `POST /contact-messages`.
- Contact payloads are persisted to `data/contacts.json`.
