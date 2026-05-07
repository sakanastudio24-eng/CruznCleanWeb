import { sendResendEmail, type SendResendEmailResult } from '@/lib/email/resend';

const SUPPORT_PHONE_DISPLAY = '(951)-434-3767';
const SUPPORT_PHONE_TEL = 'tel:+19514343767';

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

function buildReceiptRows(input: StripeCustomerReceiptInput): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ['Booking/order reference', formatOptionalValue(input.bookingId || input.orderId || input.clientReferenceId, 'Unavailable')],
    ['Checkout Session ID', formatOptionalValue(input.checkoutSessionId, 'Unavailable')],
    ['Payment Intent ID', formatOptionalValue(input.paymentIntentId, 'Unavailable')],
  ];

  if (input.customerName) {
    rows.push(['Customer name', input.customerName]);
  }

  if (input.customerPhone) {
    rows.push(['Customer phone', input.customerPhone]);
  }

  rows.push(
    ['Vehicle summary', formatOptionalValue(input.vehicleSummary, 'Vehicle to be confirmed')],
    ['Services summary', formatOptionalValue(input.servicesSummary, 'Services to be confirmed')],
    ['Estimated service total', formatCurrency(input.estimatedServiceTotalCents)],
    ['Deposit subtotal before discount', formatCurrency(input.depositSubtotalBeforeDiscountCents)],
    ['Deposit paid today', formatCurrency(input.depositPaidTodayCents)],
  );

  if (typeof input.discountAppliedCents === 'number' && input.discountAppliedCents > 0) {
    rows.push(['Promotion/discount applied', `-${formatCurrency(input.discountAppliedCents)}`]);
  }

  rows.push(['Estimated remaining balance due after service', formatCurrency(input.remainingBalanceCents)]);

  return rows;
}

function buildReceiptEmail(input: StripeCustomerReceiptInput): { subject: string; html: string; text: string } {
  const bookingReference = formatOptionalValue(input.bookingId || input.orderId || input.clientReferenceId, 'your booking');
  const customerName = formatOptionalValue(input.customerName, 'there');
  const rows = buildReceiptRows(input);
  const textRows = rows.map(([label, value]) => `${label}: ${value}`);
  const htmlRows = rows
    .map(
      ([label, value], index) =>
        `<tr><td style="padding:8px;${index > 0 ? 'border-top:1px solid #e5e7eb;' : ''}font-weight:700;font-size:13px;color:#111111;">${escapeHtml(
          label,
        )}</td><td style="padding:8px;${index > 0 ? 'border-top:1px solid #e5e7eb;' : ''}font-size:13px;color:#111111;text-align:right;">${escapeHtml(
          value,
        )}</td></tr>`,
    )
    .join('');

  const text = [
    `Hi ${customerName},`,
    '',
    'Thanks for booking with Cruizn Clean. Your deposit payment has been confirmed.',
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
    '<p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">Thanks for booking with Cruizn Clean. Your deposit payment has been confirmed.</p>' +
    '<h1 style="margin:22px 0 4px 0;font-size:22px;color:#111111;">Payment receipt</h1>' +
    `<p style="margin:0 0 14px 0;font-size:13px;color:#374151;">Booking/order reference: <strong>${escapeHtml(bookingReference)}</strong></p>` +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">' +
    htmlRows +
    '</table>' +
    '<div style="margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;">' +
    '<p style="margin:0;font-size:13px;font-weight:700;color:#2f2f2f;">Final price confirmed after inspection</p>' +
    '<p style="margin:6px 0 0 0;font-size:13px;color:#374151;">Your deposit has been applied toward your estimated service total. The remaining balance is due after service is completed.</p>' +
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
