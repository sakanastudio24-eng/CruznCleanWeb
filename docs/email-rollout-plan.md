# Email Rollout Plan (V1)

## Stage 1: Local Baseline
1. Configure API `.env` with test addresses and placeholder-safe values.
2. Send sample bookings through `/cal-bookings`.
3. Verify owner notifications and failure logs.

## Stage 2: Template Readiness
1. Create customer + owner templates in Resend.
2. Set `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION` and `RESEND_TEMPLATE_OWNER_NOTIFICATION`.
3. Verify variable mapping for multi-vehicle payloads.

## Stage 3: Domain Authentication
1. Configure SPF/DKIM for sender domain.
2. Verify domain status in Resend.
3. Run inbox checks (Gmail + Apple Mail baseline).

## Stage 4: Controlled Enablement
1. Keep owner notifications active.
2. Enable customer sends (`EMAIL_CUSTOMER_ENABLED=true`).
3. Run smoke tests from booking UI and review failure logs.

## Stage 5: Early Monitoring (First 7 Days)
1. Review `data/email_failures.json` daily.
2. Track repeating provider error classes.
3. Confirm booking acceptance rate is unaffected.

## Rollback Strategy
- If delivery is unstable:
- set `EMAIL_CUSTOMER_ENABLED=false`
- keep owner notifications active
- keep booking endpoint non-blocking and live

## Deferred Work
- Add retry worker for pending failures.
- Add delivery-status webhooks.
- Add SMS provider delivery flow.
