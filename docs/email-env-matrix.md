# Email Environment Matrix

## API Variables

### Required for Booking Emails
- `EMAIL_PROVIDER`
- Default: `resend`
- V1 supported value: `resend`

- `RESEND_API_KEY`
- Resend secret API key used by booking and template-admin sends.

- `BOOKING_OWNER_EMAIL`
- Owner recipient for booking notifications (always attempted).

- `EMAIL_FROM`
- Transactional sender address.

### Required for Template Admin API
- `TEMPLATE_ADMIN_TOKEN`
- Bearer token required by `/template-admin/*` routes.

### Optional
- `EMAIL_REPLY_TO`
- Default: `EMAIL_FROM`

- `EMAIL_CUSTOMER_ENABLED`
- Default: `true`
- Gates customer confirmation sends only.

- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- Template ID for customer confirmation email.

- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- Template ID for owner notification email.

- `OWNER_BOOKING_MANAGE_URL`
- Optional owner manage URL.
- Supports `{booking_id}` placeholder.

- `PUBLIC_SITE_URL`
- Used for links in fallback customer email content.

- `BOOKING_LIMIT_TIMEZONE`
- Default: `America/Los_Angeles`
- Timezone used for daily vehicle-cap checks.

## Web Variables
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_CAL_COM_URL`

## Local API Example
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_replace_me
BOOKING_OWNER_EMAIL=owner@cruznclean.com
EMAIL_FROM=bookings@cruznclean.com
EMAIL_REPLY_TO=hello@cruznclean.com
EMAIL_CUSTOMER_ENABLED=true
RESEND_TEMPLATE_CUSTOMER_CONFIRMATION=
RESEND_TEMPLATE_OWNER_NOTIFICATION=
OWNER_BOOKING_MANAGE_URL=
PUBLIC_SITE_URL=https://www.cruznclean.com
BOOKING_LIMIT_TIMEZONE=America/Los_Angeles
TEMPLATE_ADMIN_TOKEN=replace_with_secure_admin_token
```

## Notes
- Keep real secrets in local/runtime `.env` only.
- Empty template IDs use inline fallback HTML/text bodies.
