# Booking Flow

## Customer Path
1. Customer selects services in `/services`.
2. Customer opens `/booking` with selected vehicle/service state preserved.
3. Customer completes details, vehicle information, and communication consent.
4. Frontend posts the intake to `POST /cal-bookings`.
5. The schedule step renders the inline Cal.com calendar after intake is saved.
6. Customer chooses date and time in Cal.com.
7. The payment step creates a hosted Stripe Checkout Session for the deposit.
8. Stripe redirects successful payments to `/thank-you`.

## Trusted Pricing
- Frontend prices are previews only.
- The API recalculates totals from known service IDs, vehicle size multipliers, and conditional savings rules before email summaries and Stripe deposit creation.
- Stripe Checkout uses the backend recalculated discounted total, not a browser-supplied total.
- Deposit amount is 10% of the recalculated estimate, clamped between `$25` and `$100`.

## API Processing Order
1. Validate payload fields, vehicle service selections, consent rules, and known service IDs.
2. Run rate-limit placeholder hook.
3. Run anti-bot honeypot check.
4. Run daily vehicle-cap guard: maximum 4 selected-service vehicles per customer per intake day.
5. Persist booking in `data/bookings.json`.
6. Recalculate service totals with size adjustments and conditional savings.
7. Trigger transactional email pipeline with backend-derived estimate values.
8. Log email failures in `data/email_failures.json`.
9. Return accepted response when persistence succeeds.

## Stripe Processing
1. Payment step posts booking ID, customer details, vehicle details, selected service IDs, and vehicle sizes to `POST /payments/checkout-session`.
2. API recalculates discounted totals.
3. API creates a hosted Stripe Checkout Session with booking metadata and deposit line item.
4. Customer completes deposit on Stripe.
5. Stripe success redirects to `/thank-you`; cancel redirects to `/booking`.

## Conditional Savings
- Any paint correction service unlocks 20% savings on selected paint coating lines.
- Selecting one paint coating, one glass coating, and one wheel coating applies 20% savings across selected coating lines.
- Savings do not stack. The broader coating bundle savings wins when both rules qualify.
- Savings appear in web totals, email summaries, and Stripe metadata.

## Vehicle Cap Policy
- Maximum: `4` vehicles per customer per intake day.
- Identity key: normalized `customer.email` plus normalized `customer.phone`.
- Day basis: intake submission day.
- Day timezone: `BOOKING_LIMIT_TIMEZONE` env var, default `America/Los_Angeles`.
- Count basis: only vehicles with at least one selected service.
- API behavior: returns `422` with `Daily vehicle limit exceeded. Maximum 4 vehicles per customer per day.`

## Size Pricing Rules
- `sedan_coupe = 1.00`
- `small_suv_truck = 1.20`
- `large_suv_truck = 1.40`
- `oversized = 1.50`
- The services page hides oversized as a standard selection and routes oversized, lifted, modified, specialty, or unlisted vehicles to quote review.

## Email Send Rules
- Owner notification is always attempted.
- Customer confirmation is attempted only when `customer.sendEmailConfirmation=true` and `EMAIL_CUSTOMER_ENABLED=true`.
- SMS preference is captured and validated, but SMS delivery is not part of V1.

## Parallel Contact Flow
- `/contact` submits to `POST /contact-messages`.
- Contact payloads are persisted to `data/contacts.json`.
