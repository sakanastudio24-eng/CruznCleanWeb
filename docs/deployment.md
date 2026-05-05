# Deployment And Operations

This is the compact operational reference for Vercel, API email delivery, and booking-email troubleshooting. Long-term rollout history belongs in Notion.

## Vercel Web Deployment

- Root `vercel.json` sets:
  - `installCommand`: `pnpm install --frozen-lockfile`
  - `buildCommand`: `pnpm vercel-build`
  - `devCommand`: `pnpm --dir apps/web dev`
- Root `package.json` sets `vercel-build` to `pnpm --dir apps/web build`
- The Vercel project root should be the repo root, not `apps/web`
- Framework preset: `Next.js`
- Production branch: `main`
- Required public web envs:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_CAL_COM_URL`
  - `NEXT_PUBLIC_CAL_COM_LINK`

If Vercel says `No Next.js version detected`, verify the root project setting, root `vercel.json`, and `apps/web/package.json` dependency on `next`.

## Domains

Add production domains in Vercel Project Settings > Domains, then create the DNS records Vercel requests. Wait for verification and SSL issuance before testing production flows.

## Booking Email API

Primary intake endpoint:

- `POST /cal-bookings`

Compatibility endpoint:

- `POST /booking-intakes`

Successful intake response:

```json
{
  "status": "accepted",
  "message": "Booking intake confirmed."
}
```

Failure behavior:

- Honeypot-filled requests return accepted and skip persistence/send
- Daily cap overflow returns `422` with `Daily vehicle limit exceeded. Maximum 4 vehicles per customer per day.`
- Email send failures do not fail accepted bookings after persistence
- Storage failure still fails the request

## Booking Email Payload Requirements

- Customer full name must include first and last name
- Customer email must be valid
- Customer phone must include at least 10 digits
- Customer ZIP code is required
- At least one confirmation channel is required
- SMS consent is required if SMS confirmation is selected
- At least one vehicle is required
- Each vehicle needs unique `id`, year, make, model, color, size, and at least one known service ID
- Selected-service vehicles are capped at 4 per customer per intake day

## API Email Environment

Required for booking emails:

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `BOOKING_OWNER_EMAIL`
- `EMAIL_FROM`

Required for template admin routes:

- `TEMPLATE_ADMIN_TOKEN`

Optional:

- `EMAIL_REPLY_TO`
- `EMAIL_CUSTOMER_ENABLED`
- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- `OWNER_BOOKING_MANAGE_URL`
- `PUBLIC_SITE_URL`
- `BOOKING_LIMIT_TIMEZONE`

Keep real secrets in runtime `.env` files or Vercel env vars only. Empty template IDs use fallback inline email bodies.

## Template Admin API

All `/template-admin/*` routes require `Authorization: Bearer <TEMPLATE_ADMIN_TOKEN>`.

Routes:

- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

Common errors:

- `401`: missing or invalid bearer token
- `503`: admin token not configured
- `502`: upstream provider failure

## Email Operations

Daily checks:

- Confirm API health endpoint responds
- Confirm new bookings are written to `data/bookings.json`
- Review `data/email_failures.json`
- Verify owner inbox receives recent booking notifications

If bookings save but no emails arrive:

- Verify `EMAIL_PROVIDER=resend`
- Verify `RESEND_API_KEY`, `BOOKING_OWNER_EMAIL`, and `EMAIL_FROM`
- Inspect `data/email_failures.json`

If only customer email fails:

- Verify `customer.sendEmailConfirmation=true`
- Verify `EMAIL_CUSTOMER_ENABLED=true`
- Check failure rows with `recipientRole=customer`

If provider failures spike:

- Keep booking endpoint live
- Temporarily set `EMAIL_CUSTOMER_ENABLED=false`
- Keep owner notifications active when possible
- Re-enable customer sends after a successful smoke test

## Recovery Smoke Test

1. Submit a test booking to `POST /cal-bookings`
2. Confirm booking row persisted
3. Confirm owner notification delivery
4. If customer sends are enabled and opted in, confirm customer delivery
5. Confirm no new unexpected failure rows
