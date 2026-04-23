# Email Operations Runbook (V1)

## Purpose
Operational checks for booking transactional emails and failure handling.

## Daily Checks
1. Confirm API health endpoint responds.
2. Confirm new bookings are written to `data/bookings.json`.
3. Review `data/email_failures.json` for new rows.
4. Verify owner inbox receives recent booking notifications.

## Failure Log Review
- File: `data/email_failures.json`
- Inspect:
- `loggedAt` recency
- `recipientRole` (`owner`, `customer`, `system`)
- repeated `errorSummary` patterns
- unresolved `retryStatus=pending`

## Immediate Mitigations
1. Provider auth issue
- Rotate `RESEND_API_KEY`.
- Restart API process.

2. Invalid owner recipient
- Correct `BOOKING_OWNER_EMAIL`.
- Restart API process.

3. Customer-side surge of failures
- Set `EMAIL_CUSTOMER_ENABLED=false` temporarily.
- Keep owner notifications active.

4. Provider outage
- Keep booking flow live.
- Continue non-blocking behavior.
- Communicate email delay internally.

## Recovery Validation
1. Submit a test booking to `POST /cal-bookings`.
2. Confirm booking row persisted.
3. Confirm owner notification delivery.
4. If customer send enabled + opted in, confirm customer delivery.
5. Confirm no new unexpected failure rows.

## Incident Severity
- P1: booking persistence failing
- P2: booking persists but all email sends failing
- P3: subset/template rendering issues
