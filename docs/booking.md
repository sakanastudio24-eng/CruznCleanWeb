# Booking Operations

This is the compact booking-flow reference. Frontend prices are previews only; backend pricing remains the trusted source for emails and Stripe deposits.

## Customer Path

1. Customer selects services in `/services`
2. Customer opens `/booking` with selected vehicle/service state preserved
3. Customer completes details, vehicle information, and communication consent
4. Frontend posts the intake to `POST /cal-bookings`
5. Schedule step renders the inline Cal.com calendar after intake is saved
6. Customer chooses date and time in Cal.com
7. Payment step creates a hosted Stripe Checkout Session for the deposit
8. Stripe redirects successful payments to `/thank-you`

## Trusted Pricing

- Frontend prices are previews only
- API recalculates totals from known service IDs, vehicle size multipliers, and conditional savings rules
- Stripe Checkout uses backend recalculated discounted totals, not browser-supplied totals
- Deposit amount is 10% of recalculated estimate, clamped between $25 and $100
- Final pricing may change after inspection, condition review, incorrect booking details, or added work

## API Processing Order

1. Validate customer fields, vehicle selections, consent rules, and known service IDs
2. Run rate-limit placeholder hook
3. Run anti-bot honeypot check
4. Run daily vehicle-cap guard
5. Persist booking in `data/bookings.json`
6. Recalculate service totals with size adjustments and conditional savings
7. Trigger transactional email pipeline with backend-derived estimate values
8. Log email failures in `data/email_failures.json`
9. Return accepted response when persistence succeeds

## Stripe Processing

1. Payment step posts booking ID, customer details, vehicle details, selected service IDs, and vehicle sizes to `POST /payments/checkout-session`
2. API recalculates discounted totals
3. API creates a hosted Stripe Checkout Session with booking metadata and deposit line item
4. Customer completes deposit on Stripe
5. Stripe success redirects to `/thank-you`; cancel redirects to `/booking`

Do not use the success page alone as payment confirmation. Stripe webhook confirmation is the source of truth for payment status.

## Conditional Savings

- Any paint correction service unlocks 20% savings on selected paint coating lines
- Selecting one paint coating, one glass coating, and one wheel coating applies 20% savings across selected coating lines
- Savings do not stack; the broader coating bundle wins when both rules qualify
- Savings appear in web totals, email summaries, and Stripe metadata

## Vehicle Cap Policy

- Maximum: 4 selected-service vehicles per customer per intake day
- Identity key: normalized customer email plus normalized phone
- Day timezone: `BOOKING_LIMIT_TIMEZONE`, default `America/Los_Angeles`
- Count basis: vehicles with at least one selected service
- API overflow response: `422` with `Daily vehicle limit exceeded. Maximum 4 vehicles per customer per day.`

## Vehicle Size Pricing

- `sedan_coupe = 1.00`
- `small_suv_truck = 1.20`
- `large_suv_truck = 1.40`
- `oversized = 1.50`

Oversized, lifted, modified, specialty, or unlisted vehicles should route to quote review.

## Validation Rules

- Customer full name requires first and last name
- Customer email must be valid
- Customer phone requires at least 10 digits
- Customer ZIP code is required
- At least one confirmation channel is required
- SMS requires explicit SMS consent when selected
- Vehicle IDs must be unique
- Vehicle size must be `sedan_coupe`, `small_suv_truck`, `large_suv_truck`, or `oversized`
- Service IDs must be supported catalog IDs
- Every submitted vehicle must have at least one selected service

## Email Rules

- Owner notification is always attempted for accepted bookings
- Customer confirmation is attempted only when opted in and `EMAIL_CUSTOMER_ENABLED=true`
- SMS preference may be captured and validated, but SMS delivery is not part of V1
- Email failures are logged and do not block accepted bookings after persistence

## Test Checklist

- Add vehicle #5 is blocked in UI
- Backend rejects over-cap payloads even if UI is bypassed
- Daily cap is enforced across same email + phone on the same day
- Unknown service IDs are rejected
- Duplicate vehicle IDs are rejected
- Confirmation channel rules are enforced
- Honeypot-filled requests short-circuit without persistence or email
- Owner email attempt runs for accepted bookings
- Provider email failures do not block accepted booking persistence
