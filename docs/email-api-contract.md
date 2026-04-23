# Email API Contract

## Booking Intake APIs

### Primary Endpoint
- Method: `POST`
- Path: `/cal-bookings`
- Success response:
```json
{
  "status": "accepted",
  "message": "Booking intake confirmed."
}
```

### Compatibility Alias
- Method: `POST`
- Path: `/booking-intakes`
- Behavior: same processing logic as `/cal-bookings`

## Booking Request Payload
```json
{
  "customer": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "(555) 123-4567",
    "zipCode": "90210",
    "sendEmailConfirmation": true,
    "sendSmsConfirmation": false,
    "acceptedSmsConsent": false,
    "notes": "Gate code 4242",
    "acceptedConsent": true
  },
  "vehicles": [
    {
      "id": "vehicle-1",
      "label": "Vehicle 1",
      "make": "Toyota",
      "model": "Camry",
      "year": "2021",
      "color": "Silver",
      "size": "sedan_coupe",
      "serviceIds": ["pkg-maintenance", "coat-glass-basic"]
    }
  ],
  "honeypot": ""
}
```

## Validation Rules
1. `customer.fullName` must include first and last name.
2. `customer.email` must be valid email format.
3. `customer.phone` must include at least 10 digits.
4. `customer.zipCode` must be present and valid length.
5. At least one confirmation channel must be selected.
6. SMS consent is required if SMS confirmation is selected.
7. At least one vehicle is required.
8. Each vehicle must include year, make, model, color.
9. Each vehicle must include `size` in (`sedan_coupe`, `small_suv_truck`, `large_suv_truck`, `oversized`).
10. Each vehicle must include at least one service ID.
11. `vehicles[].id` values must be unique within one payload.
12. `serviceIds` must use supported catalog IDs across packages, coatings, and correction services.
13. Selected-service vehicles are capped at `4` per request.
14. Daily cap check applies per normalized customer identity (`email + phone`) and intake day.

## Processing Side Effects
1. Persist booking in `data/bookings.json` first.
2. Attempt owner notification send (always).
3. Attempt customer confirmation send only when:
- `customer.sendEmailConfirmation=true`
- `EMAIL_CUSTOMER_ENABLED=true`
4. Apply size multipliers (`sedan_coupe=1.00`, `small_suv_truck=1.20`, `large_suv_truck=1.40`, `oversized=1.50`) for email estimate service rows/totals.
5. Persist send failures to `data/email_failures.json`.

## Failure Contract
- Honeypot-filled requests return accepted and skip persistence/send.
- Daily cap overflow returns `422` with `Daily vehicle limit exceeded. Maximum 4 vehicles per customer per day.`
- Email send failures do not fail booking acceptance after persistence.
- Storage failure still fails the request.

## Persistence Shapes

### `bookings.json` row
- `bookingId`
- `submittedAt`
- `customer`
- `vehicles`

### `email_failures.json` row
- `loggedAt`
- `bookingId`
- `recipientRole` (`owner`, `customer`, `system`)
- `provider`
- `to`
- `errorSummary`
- `retryStatus`

## Daily Limit Notes
- Identity matching:
  - `email` lowercased + trimmed
  - `phone` digits-only normalization
- Day basis:
  - intake `submittedAt` day key in timezone from `BOOKING_LIMIT_TIMEZONE`
  - default timezone: `America/Los_Angeles`
- Counting rule:
  - only vehicles with at least one selected service count toward the daily cap

## Template Admin API
All `/template-admin/*` routes require:
- `Authorization: Bearer <TEMPLATE_ADMIN_TOKEN>`

### Endpoints
- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

### Create Request Shape
```json
{
  "name": "order-confirmation",
  "html": "<p>Name: {{{PRODUCT}}}</p><p>Total: {{{PRICE}}}</p>",
  "variables": [
    {
      "key": "PRODUCT",
      "type": "string",
      "fallback_value": "item"
    },
    {
      "key": "PRICE",
      "type": "number",
      "fallback_value": 20
    }
  ]
}
```

### Update Request Shape
```json
{
  "name": "order-confirmation-v2",
  "html": "<p>Total: {{{PRICE}}}</p><p>Name: {{{PRODUCT}}}</p>"
}
```

### Response Envelopes
Non-list:
```json
{
  "status": "ok",
  "operation": "create|get|update|publish|duplicate|delete",
  "data": {}
}
```

List:
```json
{
  "status": "ok",
  "operation": "list",
  "templates": [],
  "pagination": {
    "after": null,
    "next": null,
    "has_more": null,
    "object": null
  }
}
```

### Template Admin Error Codes
- `401`: missing or invalid bearer token
- `503`: admin token not configured
- `502`: upstream provider failure (sanitized)
