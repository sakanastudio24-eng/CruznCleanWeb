# Email Troubleshooting Guide

## Symptom: bookings save but no emails arrive
Checks:
1. Verify `EMAIL_PROVIDER=resend`.
2. Verify `RESEND_API_KEY` exists and is valid.
3. Verify `BOOKING_OWNER_EMAIL` is configured.
4. Inspect `data/email_failures.json` for recent errors.

## Symptom: customer email not sent
Checks:
1. Verify payload has `customer.sendEmailConfirmation=true`.
2. Verify `EMAIL_CUSTOMER_ENABLED=true`.
3. Check failure rows where `recipientRole=customer`.

## Symptom: owner email not sent
Checks:
1. Verify `BOOKING_OWNER_EMAIL` value is correct.
2. Check failure rows where `recipientRole=owner`.
3. Confirm provider/domain is not blocked.

## Symptom: template variables missing
Checks:
1. Verify template IDs point to expected templates.
2. Verify provider template variable names match payload keys.
3. Temporarily clear template IDs to validate fallback HTML/text output.

## Symptom: validation error on booking submit
Checks:
1. Ensure full name contains first + last name.
2. Ensure at least one confirmation channel selected.
3. Ensure SMS consent is checked when SMS confirmations are selected.
4. Ensure each vehicle has required fields and at least one service.

## Symptom: high failure volume
Actions:
1. Keep booking endpoint active (non-blocking policy).
2. Temporarily disable customer sends (`EMAIL_CUSTOMER_ENABLED=false`).
3. Investigate provider status + credentials.
4. Re-enable after successful smoke test.
