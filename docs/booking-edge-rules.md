# Booking Edge Rules (v1.2)

## Daily Vehicle Cap
- Rule: `max 4` selected-service vehicles per customer per intake day.
- Identity key: `normalized(customer.email) + normalized(customer.phone)`.
- Day key timezone: `BOOKING_LIMIT_TIMEZONE` (default `America/Los_Angeles`).

## Vehicle Counting
- Counted: vehicles with at least one selected service.
- Not counted: empty vehicle entries without service selections.

## Request Validation
- `customer.fullName`: first + last name required.
- `customer.email`: valid email format required.
- `customer.phone`: minimum 10 digits required.
- `customer.zipCode`: minimum valid length required.
- At least one confirmation channel required.
- SMS requires explicit SMS consent.
- `vehicles[]`: at least one required.
- `vehicles[].id`: unique in payload.
- `vehicles[].size`: `sedan_coupe|small_suv_truck|large_suv_truck|oversized`.
- `vehicles[].serviceIds`: must be supported package, coating, or correction IDs.
- Selected-service vehicle count must be `<= 4`.

## Bot / Abuse Guards
- Honeypot filled: returns accepted and skips persistence/email.
- Rate-limit hook exists (placeholder for per-IP throttling).

## Email Pipeline Rules
- Owner email: always attempted for accepted bookings.
- Customer email: attempted only when opt-in is true and feature flag allows it.
- Email failures: logged to `data/email_failures.json`.
- Booking persistence remains non-blocking on email send failures.

## UI Behavior (Booking Page)
- Hard block when trying to add vehicle #5.
- Error helper shown for over-limit submission attempts.
- Disclaimer shown:
  - near Vehicle Deck controls
  - near submit/status area
