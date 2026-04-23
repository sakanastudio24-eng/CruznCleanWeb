# Test Implementation: Solved Edge Cases (v1.2)

## Scope
This document lists the edge cases that are now solved and how to test each one.

## Test Environment
1. Start API:
```bash
cd apps/api
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
2. Start Web:
```bash
cd apps/web
npm run dev
```
3. Open booking UI:
- `http://127.0.0.1:3000/booking`

## Solved Edge Cases + Test Implementation

### Booking Cap and Identity/Day Rules
1. `EC-01` Add vehicle #4 is blocked in UI.
- Steps: Click `Add Vehicle` repeatedly on `/booking`.
- Expected: Third add works (3 total). Fourth add is blocked and helper text appears.

2. `EC-02` Booking submit blocked when selected-service vehicles exceed cap.
- Steps: Prepare payload/UI state with more than 3 selected-service vehicles.
- Expected: Inline validation error shows `Maximum 3 vehicles per customer per day.`

3. `EC-03` Backend rejects over-cap payload even if UI is bypassed.
- Steps: `POST /cal-bookings` with 4 vehicles each containing `serviceIds`.
- Expected: Validation error response, request not accepted.

4. `EC-04` Daily cap enforced across multiple submissions on same day.
- Steps: Submit booking A for same email+phone with 2 selected vehicles, then booking B with 2 selected vehicles.
- Expected: Booking B returns `422` with `Daily vehicle limit exceeded. Maximum 3 vehicles per customer per day.`

5. `EC-05` Identity normalization handles email case differences.
- Steps: Submit with `John@Example.com`, then `john@example.com` same phone/day.
- Expected: Treated as same person for cap calculations.

6. `EC-06` Identity normalization handles phone formatting differences.
- Steps: Submit phone as `(555) 123-4567`, then `5551234567` same email/day.
- Expected: Treated as same person for cap calculations.

7. `EC-07` Different email + same phone is not treated as same identity.
- Steps: Submit with same phone, different email.
- Expected: Not merged into previous identity bucket.

8. `EC-08` Daily boundary respects configured timezone.
- Steps: Set `BOOKING_LIMIT_TIMEZONE`, submit around midnight boundary.
- Expected: Day-key grouping follows configured timezone day.

### Payload Validation Hardening
9. `EC-09` Duplicate vehicle IDs are rejected.
- Steps: Send payload where two `vehicles[]` rows share the same `id`.
- Expected: Validation error for unique vehicle ID requirement.

10. `EC-10` Unknown service IDs are rejected.
- Steps: Send service ID not in supported package/add-on catalog.
- Expected: Validation error for invalid service selection.

11. `EC-11` Empty service list per vehicle is rejected.
- Steps: Send vehicle with `serviceIds: []`.
- Expected: Validation error `Select at least one service for each vehicle.`

12. `EC-12` Confirmation channel rules remain enforced.
- Steps: Set both `sendEmailConfirmation=false` and `sendSmsConfirmation=false`.
- Expected: Validation error requiring at least one confirmation channel.

13. `EC-13` SMS consent still required when SMS is selected.
- Steps: `sendSmsConfirmation=true` + `acceptedSmsConsent=false`.
- Expected: Validation error requiring explicit SMS consent.

### Lookup and Vehicle Size UX Edges
14. `EC-14` No query in Type Finder does not force suggestions.
- Steps: Open lookup with empty query.
- Expected: No forced result list; user can use dropdown or manual size chips.

15. `EC-15` Unknown query keeps manual sizing path clear.
- Steps: Enter query that has no catalog match.
- Expected: No-match message shown and manual size remains editable.

16. `EC-16` Ambiguous make/model input is detected.
- Steps: Enter make/model fields that produce multiple catalog matches.
- Expected: Warning banner appears; no auto-apply from ambiguous result.

17. `EC-17` Exact lookup match applies make/model/size.
- Steps: Pick known vehicle from dropdown or finder.
- Expected: Vehicle make/model/size applies immediately.

18. `EC-18` Manual size override remains allowed after a match.
- Steps: Match known vehicle, then change size via manual chips.
- Expected: Override state shown and pricing updates for override size.

### Email + Non-Blocking Delivery Edges
19. `EC-19` Owner email attempt always runs for accepted bookings.
- Steps: Submit accepted booking.
- Expected: Owner send path executes every time.

20. `EC-20` Customer email only sends on opt-in.
- Steps: Submit once with `sendEmailConfirmation=true`, once with `false`.
- Expected: Customer send attempted only in opt-in case.

21. `EC-21` Provider failures do not block accepted booking.
- Steps: Force resend send failure (bad key or network issue) with valid payload.
- Expected: Booking accepted/persisted; failure logged in `data/email_failures.json`.

22. `EC-22` Rejected cap submissions do not trigger email pipeline.
- Steps: Trigger daily cap `422`.
- Expected: No booking persistence and no email send attempts.

23. `EC-23` Fallback email rendering handles malformed/empty service rows safely.
- Steps: Exercise fallback path with unexpected `serviceIds` entries.
- Expected: Sanitized output, no crash, no unsafe/raw output.

### Anti-Bot and Request Handling
24. `EC-24` Honeypot-filled requests short-circuit safely.
- Steps: Send payload with non-empty `honeypot`.
- Expected: Accepted response, no persistence, no email attempts.

25. `EC-25` Rate-limit hook order remains before persistence.
- Steps: Simulate future `is_booking_rate_limited=true`.
- Expected: Early `429` response before save/send.

## API Smoke Payloads

### Valid payload (3 selected-service vehicles max)
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
      "size": "small",
      "serviceIds": ["pkg-standard"]
    }
  ],
  "honeypot": ""
}
```

### Over-cap payload sample
Use 4 vehicles with non-empty `serviceIds` and same customer identity/day.

Expected:
- `HTTP 422`
- Message contains `Daily vehicle limit exceeded. Maximum 3 vehicles per customer per day.`
