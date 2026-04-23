# Email Confirmation Specification (V1)

## Purpose
Define transactional booking email behavior for Cruzn Clean using:
- FastAPI for validation, trigger order, and failure policy
- Resend for delivery and template hosting

## Scope
- Owner notification email for every accepted booking intake
- Customer confirmation email when customer opts in
- Failure logging without blocking booking acceptance

## Non-Goals
- SMS delivery implementation
- Retry worker/queue automation
- Marketing campaigns

## Trigger Source
- Primary endpoint: `POST /cal-bookings`
- Compatibility alias: `POST /booking-intakes`
- Trigger moment: after booking persistence to `data/bookings.json`

## Processing Order
1. Validate request payload.
2. Reject via rate-limit guard when applicable.
3. Ignore bot traffic when honeypot is filled.
4. Persist booking record.
5. Attempt owner notification send.
6. Attempt customer confirmation send when allowed.
7. Persist any email failures to `data/email_failures.json`.
8. Return accepted response when persistence succeeded.

## Send Rules
1. Owner notification
- Always attempted.
- Recipient is `BOOKING_OWNER_EMAIL`.

2. Customer confirmation
- Attempted only when both are true:
- `customer.sendEmailConfirmation=true`
- `EMAIL_CUSTOMER_ENABLED=true` (default true)

3. SMS preference
- `sendSmsConfirmation` and `acceptedSmsConsent` are validated and stored.
- SMS delivery is out of scope for V1.

## Delivery Model
- Provider: `EMAIL_PROVIDER=resend`
- Template-first send attempts when template IDs exist:
- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- Fallback HTML/text send is used when template IDs are missing or template request payload shape fails.

## Failure Policy
- Booking acceptance is non-blocking on email delivery.
- Each failed send logs one row to `data/email_failures.json`.
- Failure row fields:
- `loggedAt`
- `bookingId`
- `recipientRole` (`owner`, `customer`, `system`)
- `provider`
- `to`
- `errorSummary`
- `retryStatus` (`pending` in V1)

## Security Notes
- `RESEND_API_KEY` is env-only and never returned in API responses.
- `TEMPLATE_ADMIN_TOKEN` protects template admin routes.
- Logs contain sanitized provider errors only.
