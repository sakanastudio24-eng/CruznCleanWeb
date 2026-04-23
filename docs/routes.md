# Routes (Current)

## Public Web Routes
- `/`
- `/services`
- `/booking`
- `/gallery`
- `/quote`
- `/contact`
- `/faq`
- `/privacy`
- `/terms`
- `/email-preview` (direct URL only for internal QA)

## Internal Web Route
- `/styleguide`

## API Routes
- `POST /cal-bookings`
- `POST /booking-intakes` (compatibility alias)
- `POST /contact-messages`
- `GET /health`
- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

## Booking vs Contact Intent
- `/booking`: appointment intake + calendar handoff (Cal.com)
- `/contact`: non-booking questions
- `/email-preview`: internal preview surface for transactional template review, not primary site navigation

## Demo Security Posture
- `GET /health` remains public and returns only `{"status":"ok"}`.
- In `DEMO_MODE=true`:
  - `POST /booking-intakes` and `POST /cal-bookings` validate and enforce policy but do not persist or send emails.
  - `POST /contact-messages` validates but does not persist.
- In `ENABLE_TEMPLATE_ADMIN=false`:
  - `/template-admin/*` is not mounted and returns `404`.
