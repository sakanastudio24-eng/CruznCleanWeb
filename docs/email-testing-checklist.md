# Email Testing Checklist

## Validation
- [ ] Reject payload when no confirmation channel is selected.
- [ ] Reject payload when SMS confirmation is selected without SMS consent.
- [ ] Reject payload when full name does not include first + last name.
- [ ] Reject payload when vehicle/service requirements are missing.

## Booking + Email Integration
- [ ] `POST /cal-bookings` persists booking record.
- [ ] `POST /booking-intakes` alias behaves the same as `/cal-bookings`.
- [ ] Owner notification send is attempted for accepted bookings.
- [ ] Customer send is attempted only when opted in and enabled.
- [ ] API returns accepted when provider send fails after persistence.
- [ ] Failed sends append rows to `data/email_failures.json`.

## Template and Fallback Behavior
- [ ] Template IDs set: provider template send succeeds.
- [ ] Template IDs empty: fallback HTML/text send succeeds.
- [ ] Provider/template errors are sanitized and do not leak secrets.

## UI Contract
- [ ] Booking form displays email opt-in consent text clearly.
- [ ] Invalid fields show helper message + red error state.
- [ ] Success state shows confirmation checkmark/message after submit.
- [ ] Calendar handoff goes to Cal.com URL (or configured fallback).

## Responsive Regression
- [ ] `<=479px` booking flow usable.
- [ ] `480-767px` bottom nav and form controls do not overlap.
- [ ] `768-1023px` tablet layout remains stable.
- [ ] `>=1024px` desktop booking summary remains aligned.

## Email Client QA
- [ ] Customer email renders correctly in Gmail.
- [ ] Customer email renders correctly in Apple Mail.
- [ ] Owner email renders in the same brand style.
- [ ] Links and plain-text fallback are readable.
