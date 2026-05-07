import { sendResendEmail, type SendResendEmailResult } from '@/lib/email/resend';

const SUPPORT_PHONE_DISPLAY = '(951)-434-3767';
const SUPPORT_PHONE_TEL = 'tel:+19514343767';

interface ReceiptDisplayAmounts {
  discountPercent: number | null;
  serviceDiscountCents: number | null;
  discountedEstimatedServiceTotalCents: number | null;
  remainingBalanceCents: number | null;
}

interface ReceiptCopy {
  intro: string;
  paymentNote: string;
}

export interface StripeCustomerReceiptInput {
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  clientReferenceId: string | null;
  bookingId: string | null;
  orderId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  vehicleSummary: string | null;
  servicesSummary: string | null;
  estimatedServiceTotalCents: number | null;
  depositSubtotalBeforeDiscountCents: number | null;
  depositPaidTodayCents: number | null;
  discountAppliedCents: number | null;
  remainingBalanceCents: number | null;
}

export type CustomerReceiptSendResult =
  | {
      attempted: false;
      reason: 'not_paid' | 'missing_checkout_session_id' | 'missing_customer_email';
    }
  | {
      attempted: true;
      idempotencyKey: string;
      delivery: SendResendEmailResult;
    };

export type OwnerNotificationSendResult =
  | {
      attempted: false;
      reason: 'not_paid' | 'missing_checkout_session_id' | 'missing_owner_email';
    }
  | {
      attempted: true;
      idempotencyKey: string;
      delivery: SendResendEmailResult;
    };

function getEnvValue(name: string): string {
  return process.env[name]?.trim() || '';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatOptionalValue(value: string | null, fallback: string): string {
  return value?.trim() || fallback;
}

function formatCurrency(cents: number | null): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    return 'Unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function isValidCents(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clampCents(value: number): number {
  return Math.max(Math.round(value), 0);
}

function calculateReceiptDisplayAmounts(input: StripeCustomerReceiptInput): ReceiptDisplayAmounts {
  const estimatedServiceTotalCents = isValidCents(input.estimatedServiceTotalCents)
    ? input.estimatedServiceTotalCents
    : null;
  const depositSubtotalBeforeDiscountCents = isValidCents(input.depositSubtotalBeforeDiscountCents)
    ? input.depositSubtotalBeforeDiscountCents
    : null;
  const depositPaidTodayCents = isValidCents(input.depositPaidTodayCents) ? input.depositPaidTodayCents : null;
  const stripeDiscountCents =
    isValidCents(input.discountAppliedCents) && input.discountAppliedCents > 0 ? input.discountAppliedCents : null;

  if (estimatedServiceTotalCents === null || depositPaidTodayCents === null) {
    return {
      discountPercent: null,
      serviceDiscountCents: null,
      discountedEstimatedServiceTotalCents: estimatedServiceTotalCents,
      remainingBalanceCents: isValidCents(input.remainingBalanceCents) ? input.remainingBalanceCents : null,
    };
  }

  if (depositSubtotalBeforeDiscountCents === null || depositSubtotalBeforeDiscountCents <= 0 || stripeDiscountCents === null) {
    return {
      discountPercent: null,
      serviceDiscountCents: null,
      discountedEstimatedServiceTotalCents: estimatedServiceTotalCents,
      remainingBalanceCents: clampCents(estimatedServiceTotalCents - depositPaidTodayCents),
    };
  }

  const discountRate = Math.min(Math.max(stripeDiscountCents / depositSubtotalBeforeDiscountCents, 0), 1);
  const serviceDiscountCents = clampCents(estimatedServiceTotalCents * discountRate);
  const discountedEstimatedServiceTotalCents = clampCents(estimatedServiceTotalCents - serviceDiscountCents);

  return {
    discountPercent: discountRate * 100,
    serviceDiscountCents,
    discountedEstimatedServiceTotalCents,
    remainingBalanceCents: clampCents(discountedEstimatedServiceTotalCents - depositPaidTodayCents),
  };
}

function formatPercent(value: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '';
  }

  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function buildInfoRow(label: string, value: string): string {
  return (
    '<div style="padding:12px 0;border-top:1px solid #e5e7eb;">' +
    `<p style="margin:0;font-size:12px;font-weight:700;color:#4b5563;">${escapeHtml(label)}</p>` +
    `<p style="margin:4px 0 0 0;font-size:14px;line-height:1.45;color:#111111;">${escapeHtml(value)}</p>` +
    '</div>'
  );
}

function buildPaymentRow(label: string, value: string, strong = false): string {
  const labelStyle = strong ? 'font-size:14px;font-weight:800;color:#111111;' : 'font-size:13px;font-weight:700;color:#374151;';
  const valueStyle = strong ? 'font-size:18px;font-weight:800;color:#111111;' : 'font-size:15px;font-weight:700;color:#111111;';

  return (
    '<div style="display:block;padding:12px 0;border-top:1px solid #e5e7eb;">' +
    `<p style="margin:0;${labelStyle}">${escapeHtml(label)}</p>` +
    `<p style="margin:4px 0 0 0;${valueStyle}">${escapeHtml(value)}</p>` +
    '</div>'
  );
}

function buildReceiptCopy(input: StripeCustomerReceiptInput, displayAmounts: ReceiptDisplayAmounts): ReceiptCopy {
  const paidTodayCents = isValidCents(input.depositPaidTodayCents) ? input.depositPaidTodayCents : null;
  const remainingBalanceCents = isValidCents(displayAmounts.remainingBalanceCents) ? displayAmounts.remainingBalanceCents : null;
  const promotionCoveredToday = paidTodayCents === 0 && isValidCents(input.discountAppliedCents) && input.discountAppliedCents > 0;
  const promotionCoveredServiceBalance = promotionCoveredToday && remainingBalanceCents === 0;

  if (promotionCoveredServiceBalance) {
    return {
      intro: 'Thanks for booking with Cruizn Clean. Your promotion covered today\'s deposit and your estimated service balance.',
      paymentNote:
        'Your promotion has been applied to the estimated service total shown here. No estimated balance is due after service unless the final on-site inspection changes the scope.',
    };
  }

  if (promotionCoveredToday) {
    return {
      intro: 'Thanks for booking with Cruizn Clean. Your promotion covered today\'s deposit.',
      paymentNote:
        'Your promotion covered the deposit due today and has been applied to the estimated service total shown here. Any estimated balance is due after service is completed.',
    };
  }

  return {
    intro: 'Thanks for booking with Cruizn Clean. Your deposit payment has been confirmed.',
    paymentNote:
      'Your deposit has been applied toward your estimated service total. The remaining balance is due after service is completed.',
  };
}

function buildReceiptEmail(input: StripeCustomerReceiptInput): { subject: string; html: string; text: string } {
  const bookingReference = formatOptionalValue(input.bookingId || input.orderId || input.clientReferenceId, 'your booking');
  const customerName = formatOptionalValue(input.customerName, 'there');
  const displayAmounts = calculateReceiptDisplayAmounts(input);
  const promotionApplied = isValidCents(displayAmounts.serviceDiscountCents) && displayAmounts.serviceDiscountCents > 0;
  const promotionPercentLabel = promotionApplied
    ? `Promotion applied: ${formatPercent(displayAmounts.discountPercent)}% off estimated service`
    : null;
  const receiptCopy = buildReceiptCopy(input, displayAmounts);
  const hasPaymentIntentId = Boolean(input.paymentIntentId?.trim());
  const customerRows = [
    ...(input.customerName ? [`Customer name: ${input.customerName}`] : []),
    ...(input.customerPhone ? [`Customer phone: ${input.customerPhone}`] : []),
  ];
  const textRows = [
    `Booking/order reference: ${bookingReference}`,
    ...customerRows,
    `Vehicle summary: ${formatOptionalValue(input.vehicleSummary, 'Vehicle to be confirmed')}`,
    `Services summary: ${formatOptionalValue(input.servicesSummary, 'Services to be confirmed')}`,
    `Estimated service total: ${formatCurrency(input.estimatedServiceTotalCents)}`,
    ...(promotionPercentLabel ? [promotionPercentLabel] : []),
    ...(promotionApplied ? [`Promotion savings: -${formatCurrency(displayAmounts.serviceDiscountCents)}`] : []),
    `Discounted estimated total: ${formatCurrency(displayAmounts.discountedEstimatedServiceTotalCents)}`,
    `Deposit paid today: ${formatCurrency(input.depositPaidTodayCents)}`,
    `Estimated balance due after service: ${formatCurrency(displayAmounts.remainingBalanceCents)}`,
    `Checkout Session ID: ${formatOptionalValue(input.checkoutSessionId, 'Unavailable')}`,
    ...(hasPaymentIntentId ? [`Payment Intent ID: ${input.paymentIntentId?.trim()}`] : []),
  ];

  const customerDetailsHtml = [
    ...(input.customerName ? [buildInfoRow('Customer name', input.customerName)] : []),
    ...(input.customerPhone ? [buildInfoRow('Customer phone', input.customerPhone)] : []),
  ].join('');

  const paymentSummaryHtml = [
    buildPaymentRow('Estimated service total', formatCurrency(input.estimatedServiceTotalCents)),
    ...(promotionPercentLabel ? [buildPaymentRow('Promotion', promotionPercentLabel)] : []),
    ...(promotionApplied ? [buildPaymentRow('Promotion savings', `-${formatCurrency(displayAmounts.serviceDiscountCents)}`)] : []),
    buildPaymentRow('Discounted estimated total', formatCurrency(displayAmounts.discountedEstimatedServiceTotalCents)),
    buildPaymentRow('Deposit paid today', formatCurrency(input.depositPaidTodayCents)),
    buildPaymentRow('Estimated balance due after service', formatCurrency(displayAmounts.remainingBalanceCents), true),
  ].join('');

  const text = [
    `Hi ${customerName},`,
    '',
    receiptCopy.intro,
    '',
    ...textRows,
    '',
    'Final price confirmed after inspection.',
    `Need to make a change? Call ${SUPPORT_PHONE_DISPLAY}.`,
    '',
    'Thank you,',
    'Cruizn Clean',
  ].join('\n');

  const html = (
    '<div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111111;">' +
    '<div style="max-width:700px;margin:0 auto;padding:24px 16px;">' +
    '<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">' +
    '<div style="background:#111111;padding:16px 20px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr>' +
    '<td style="color:#ffffff;font-size:22px;font-weight:700;">Cruizn Clean</td>' +
    `<td style="text-align:right;font-size:12px;"><a href="${SUPPORT_PHONE_TEL}" style="color:#e5e7eb;text-decoration:none;">${SUPPORT_PHONE_DISPLAY}</a></td>` +
    '</tr></table></div>' +
    '<div style="padding:20px;">' +
    `<p style="margin:0;font-size:16px;color:#111111;">Hi ${escapeHtml(customerName)},</p>` +
    `<p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(receiptCopy.intro)}</p>` +
    '<h1 style="margin:22px 0 4px 0;font-size:22px;color:#111111;">Payment receipt</h1>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:10px;">' +
    '<p style="margin:0;font-size:12px;font-weight:700;color:#4b5563;">Booking/order reference</p>' +
    `<p style="margin:4px 0 0 0;font-size:18px;font-weight:800;color:#111111;">${escapeHtml(bookingReference)}</p>` +
    customerDetailsHtml +
    '</div>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;">' +
    '<p style="margin:0;font-size:16px;font-weight:800;color:#111111;">Vehicle and services</p>' +
    `${buildInfoRow('Vehicle summary', formatOptionalValue(input.vehicleSummary, 'Vehicle to be confirmed'))}` +
    `${buildInfoRow('Services summary', formatOptionalValue(input.servicesSummary, 'Services to be confirmed'))}` +
    '</div>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;">' +
    '<p style="margin:0;font-size:16px;font-weight:800;color:#111111;">Payment summary</p>' +
    paymentSummaryHtml +
    '</div>' +
    '<div style="margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;">' +
    '<p style="margin:0;font-size:13px;font-weight:700;color:#2f2f2f;">Final price confirmed after inspection</p>' +
    `<p style="margin:6px 0 0 0;font-size:13px;color:#374151;">${escapeHtml(receiptCopy.paymentNote)}</p>` +
    '</div>' +
    '<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;background:#ffffff;border-radius:10px;">' +
    '<p style="margin:0;font-size:12px;font-weight:700;color:#6b7280;">Receipt references</p>' +
    `<p style="margin:6px 0 0 0;font-size:11px;line-height:1.45;color:#6b7280;">Checkout Session ID: ${escapeHtml(
      formatOptionalValue(input.checkoutSessionId, 'Unavailable'),
    )}${hasPaymentIntentId ? `<br/>Payment Intent ID: ${escapeHtml(input.paymentIntentId?.trim() || '')}` : ''}</p>` +
    '</div>' +
    '<p style="margin:14px 0 0 0;font-size:13px;color:#374151;">Need to make a change? Call ' +
    `<a href="${SUPPORT_PHONE_TEL}" style="color:#2f2f2f;font-weight:700;text-decoration:none;">${SUPPORT_PHONE_DISPLAY}</a>.</p>` +
    '<p style="margin:18px 0 0 0;font-size:13px;color:#374151;">Thank you,<br/>Cruizn Clean</p>' +
    '</div></div></div></div>'
  );

  return {
    subject: `Cruizn Clean receipt - ${bookingReference}`,
    html,
    text,
  };
}

function buildOwnerNotificationEmail(input: StripeCustomerReceiptInput): { subject: string; html: string; text: string } {
  const bookingReference = formatOptionalValue(input.bookingId || input.orderId || input.clientReferenceId, 'Unavailable');
  const customerName = formatOptionalValue(input.customerName, 'Customer name unavailable');
  const customerPhone = formatOptionalValue(input.customerPhone, 'Customer phone unavailable');
  const customerEmail = formatOptionalValue(input.customerEmail, 'Customer email unavailable');
  const displayAmounts = calculateReceiptDisplayAmounts(input);
  const promotionApplied = isValidCents(displayAmounts.serviceDiscountCents) && displayAmounts.serviceDiscountCents > 0;
  const promotionPercentLabel = promotionApplied
    ? `Promotion applied: ${formatPercent(displayAmounts.discountPercent)}% off estimated service`
    : null;
  const hasPaymentIntentId = Boolean(input.paymentIntentId?.trim());
  const textRows = [
    `Booking/order reference: ${bookingReference}`,
    `Paid status: Paid`,
    `Customer name: ${customerName}`,
    `Customer phone: ${customerPhone}`,
    `Customer email: ${customerEmail}`,
    `Vehicle summary: ${formatOptionalValue(input.vehicleSummary, 'Vehicle to be confirmed')}`,
    `Services summary: ${formatOptionalValue(input.servicesSummary, 'Services to be confirmed')}`,
    `Estimated service total: ${formatCurrency(input.estimatedServiceTotalCents)}`,
    ...(promotionPercentLabel ? [promotionPercentLabel] : []),
    ...(promotionApplied ? [`Promotion savings: -${formatCurrency(displayAmounts.serviceDiscountCents)}`] : []),
    `Discounted estimated total: ${formatCurrency(displayAmounts.discountedEstimatedServiceTotalCents)}`,
    `Deposit paid today: ${formatCurrency(input.depositPaidTodayCents)}`,
    `Estimated remaining balance due after service: ${formatCurrency(displayAmounts.remainingBalanceCents)}`,
    `Checkout Session ID: ${formatOptionalValue(input.checkoutSessionId, 'Unavailable')}`,
    ...(hasPaymentIntentId ? [`Payment Intent ID: ${input.paymentIntentId?.trim()}`] : []),
  ];
  const paymentSummaryHtml = [
    buildPaymentRow('Estimated service total', formatCurrency(input.estimatedServiceTotalCents)),
    ...(promotionPercentLabel ? [buildPaymentRow('Promotion', promotionPercentLabel)] : []),
    ...(promotionApplied ? [buildPaymentRow('Promotion savings', `-${formatCurrency(displayAmounts.serviceDiscountCents)}`)] : []),
    buildPaymentRow('Discounted estimated total', formatCurrency(displayAmounts.discountedEstimatedServiceTotalCents)),
    buildPaymentRow('Deposit paid today', formatCurrency(input.depositPaidTodayCents)),
    buildPaymentRow('Estimated remaining balance due after service', formatCurrency(displayAmounts.remainingBalanceCents), true),
  ].join('');
  const paymentIntentReference = hasPaymentIntentId
    ? `<br/>Payment Intent ID: ${escapeHtml(input.paymentIntentId?.trim() || '')}`
    : '';

  const text = [
    'Paid booking received.',
    '',
    ...textRows,
    '',
    'Final price confirmed after inspection.',
    `Owner note: Customer-facing changes can be handled through ${SUPPORT_PHONE_DISPLAY}.`,
  ].join('\n');

  const html = (
    '<div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111111;">' +
    '<div style="max-width:700px;margin:0 auto;padding:24px 16px;">' +
    '<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">' +
    '<div style="background:#111111;padding:16px 20px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr>' +
    '<td style="color:#ffffff;font-size:22px;font-weight:700;">Cruizn Clean</td>' +
    `<td style="text-align:right;font-size:12px;color:#e5e7eb;">Owner Alert</td>` +
    '</tr></table></div>' +
    '<div style="padding:20px;">' +
    '<p style="margin:0;font-size:13px;font-weight:800;color:#16a34a;">Paid status: Paid</p>' +
    '<h1 style="margin:6px 0 4px 0;font-size:22px;color:#111111;">Paid booking received</h1>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:10px;">' +
    '<p style="margin:0;font-size:12px;font-weight:700;color:#4b5563;">Booking/order reference</p>' +
    `<p style="margin:4px 0 0 0;font-size:18px;font-weight:800;color:#111111;">${escapeHtml(bookingReference)}</p>` +
    '</div>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;">' +
    '<p style="margin:0;font-size:16px;font-weight:800;color:#111111;">Customer</p>' +
    `${buildInfoRow('Customer name', customerName)}` +
    `${buildInfoRow('Customer phone', customerPhone)}` +
    `${buildInfoRow('Customer email', customerEmail)}` +
    '</div>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;">' +
    '<p style="margin:0;font-size:16px;font-weight:800;color:#111111;">Vehicle and services</p>' +
    `${buildInfoRow('Vehicle summary', formatOptionalValue(input.vehicleSummary, 'Vehicle to be confirmed'))}` +
    `${buildInfoRow('Services summary', formatOptionalValue(input.servicesSummary, 'Services to be confirmed'))}` +
    '</div>' +
    '<div style="margin-top:14px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;">' +
    '<p style="margin:0;font-size:16px;font-weight:800;color:#111111;">Payment summary</p>' +
    paymentSummaryHtml +
    '</div>' +
    '<div style="margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;">' +
    '<p style="margin:0;font-size:13px;font-weight:700;color:#2f2f2f;">Final price confirmed after inspection</p>' +
    '<p style="margin:6px 0 0 0;font-size:13px;color:#374151;">This payment summary uses Stripe-confirmed paid values and the current launch receipt discount interpretation. Confirm final pricing after vehicle inspection and condition review.</p>' +
    '</div>' +
    '<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;background:#ffffff;border-radius:10px;">' +
    '<p style="margin:0;font-size:12px;font-weight:700;color:#6b7280;">Receipt references</p>' +
    `<p style="margin:6px 0 0 0;font-size:11px;line-height:1.45;color:#6b7280;">Checkout Session ID: ${escapeHtml(
      formatOptionalValue(input.checkoutSessionId, 'Unavailable'),
    )}${paymentIntentReference}</p>` +
    '</div>' +
    '<p style="margin:14px 0 0 0;font-size:13px;color:#374151;">Customer-facing support phone: ' +
    `<a href="${SUPPORT_PHONE_TEL}" style="color:#2f2f2f;font-weight:700;text-decoration:none;">${SUPPORT_PHONE_DISPLAY}</a>.</p>` +
    '</div></div></div></div>'
  );

  return {
    subject: `Paid Cruizn Clean booking - ${bookingReference}`,
    html,
    text,
  };
}

export async function sendStripeCustomerReceipt(input: StripeCustomerReceiptInput): Promise<CustomerReceiptSendResult> {
  if (!input.checkoutSessionId) {
    return {
      attempted: false,
      reason: 'missing_checkout_session_id',
    };
  }

  if (!input.customerEmail) {
    return {
      attempted: false,
      reason: 'missing_customer_email',
    };
  }

  if (typeof input.depositPaidTodayCents !== 'number') {
    return {
      attempted: false,
      reason: 'not_paid',
    };
  }

  const idempotencyKey = `stripe-checkout/${input.checkoutSessionId}/customer-receipt`;
  const email = buildReceiptEmail(input);

  return {
    attempted: true,
    idempotencyKey,
    delivery: await sendResendEmail({
      to: input.customerEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey,
    }),
  };
}

export async function sendStripeOwnerNotification(input: StripeCustomerReceiptInput): Promise<OwnerNotificationSendResult> {
  if (!input.checkoutSessionId) {
    return {
      attempted: false,
      reason: 'missing_checkout_session_id',
    };
  }

  if (typeof input.depositPaidTodayCents !== 'number') {
    return {
      attempted: false,
      reason: 'not_paid',
    };
  }

  const ownerEmail = getEnvValue('BOOKING_OWNER_EMAIL');
  if (!ownerEmail) {
    return {
      attempted: false,
      reason: 'missing_owner_email',
    };
  }

  const idempotencyKey = `stripe-checkout/${input.checkoutSessionId}/owner-notification`;
  const email = buildOwnerNotificationEmail(input);

  return {
    attempted: true,
    idempotencyKey,
    delivery: await sendResendEmail({
      to: ownerEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey,
    }),
  };
}
