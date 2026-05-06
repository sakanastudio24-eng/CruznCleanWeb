import { createHmac, timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STRIPE_SIGNATURE_TOLERANCE_SECONDS = 300;
const APPROVED_STRIPE_EVENT_TYPES = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
  'charge.dispute.created',
] as const;

type ApprovedStripeEventType = (typeof APPROVED_STRIPE_EVENT_TYPES)[number];

interface StripeWebhookEvent {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: unknown;
  };
}

interface StripeCheckoutSession {
  id?: string;
  payment_intent?: string | { id?: string } | null;
  client_reference_id?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  payment_status?: string | null;
  status?: string | null;
  amount_subtotal?: number | null;
  amount_total?: number | null;
  total_details?: {
    amount_discount?: number | null;
  } | null;
  metadata?: Record<string, string> | null;
}

interface StripePaymentIntent {
  id?: string;
  status?: string | null;
  amount?: number | null;
  amount_received?: number | null;
  currency?: string | null;
  customer?: string | { id?: string } | null;
  latest_charge?: string | { id?: string } | null;
  receipt_email?: string | null;
  metadata?: Record<string, string> | null;
  last_payment_error?: {
    code?: string | null;
    decline_code?: string | null;
    message?: string | null;
  } | null;
}

interface StripeCharge {
  id?: string;
  payment_intent?: string | { id?: string } | null;
  amount?: number | null;
  amount_refunded?: number | null;
  currency?: string | null;
  refunded?: boolean | null;
  billing_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string> | null;
}

interface StripeDispute {
  id?: string;
  charge?: string | { id?: string } | null;
  payment_intent?: string | { id?: string } | null;
  amount?: number | null;
  currency?: string | null;
  reason?: string | null;
  status?: string | null;
  metadata?: Record<string, string> | null;
}

type StripeWebhookHandlingResult =
  | {
      handled: true;
      eventId?: string;
      eventType: ApprovedStripeEventType;
      normalized: Record<string, unknown>;
    }
  | {
      handled: false;
      eventId?: string;
      eventType?: string;
      reason: string;
    };

function getStripeWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || '';
}

function parseStripeSignature(signatureHeader: string): { timestamp: string; signatures: string[] } | null {
  const values = signatureHeader.split(',').reduce(
    (accumulator, item) => {
      const [key, ...valueParts] = item.split('=');
      const value = valueParts.join('=');

      if (key === 't') {
        accumulator.timestamp = value;
      }

      if (key === 'v1' && value) {
        accumulator.signatures.push(value);
      }

      return accumulator;
    },
    { timestamp: '', signatures: [] as string[] },
  );

  if (!values.timestamp || values.signatures.length === 0) {
    return null;
  }

  return values;
}

function isFreshStripeTimestamp(timestamp: string): boolean {
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const currentSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(currentSeconds - timestampSeconds) <= STRIPE_SIGNATURE_TOLERANCE_SECONDS;
}

function hasMatchingSignature(payload: string, signatureHeader: string, webhookSecret: string): boolean {
  const parsedSignature = parseStripeSignature(signatureHeader);
  if (!parsedSignature || !isFreshStripeTimestamp(parsedSignature.timestamp)) {
    return false;
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(`${parsedSignature.timestamp}.${payload}`, 'utf8')
    .digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  return parsedSignature.signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, 'hex');
    return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isApprovedStripeEventType(eventType: string | undefined): eventType is ApprovedStripeEventType {
  return APPROVED_STRIPE_EVENT_TYPES.includes(eventType as ApprovedStripeEventType);
}

function getEventObject(event: StripeWebhookEvent): Record<string, unknown> | null {
  return isRecord(event.data?.object) ? event.data.object : null;
}

function getObjectId(value: string | { id?: string } | null | undefined): string | null {
  if (typeof value === 'string' && value) {
    return value;
  }

  if (isRecord(value) && typeof value.id === 'string' && value.id) {
    return value.id;
  }

  return null;
}

function getMetadataString(metadata: Record<string, string> | null | undefined, key: string): string | null {
  const value = metadata?.[key]?.trim();
  return value || null;
}

function parseCents(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed);
}

function parseDollarStringToCents(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

function coalesceCents(...values: Array<number | null | undefined>): number | null {
  return values.find((value): value is number => typeof value === 'number' && Number.isFinite(value)) ?? null;
}

function getEstimatedServiceTotalCents(metadata: Record<string, string> | null | undefined): number | null {
  return coalesceCents(
    parseCents(getMetadataString(metadata, 'estimatedTotalCents')),
    parseDollarStringToCents(getMetadataString(metadata, 'estimateTotal')),
  );
}

function calculateRemainingBalanceCents(estimatedServiceTotalCents: number | null, depositPaidCents: number | null): number | null {
  if (estimatedServiceTotalCents === null || depositPaidCents === null) {
    return null;
  }

  return Math.max(estimatedServiceTotalCents - depositPaidCents, 0);
}

function getBookingId(metadata: Record<string, string> | null | undefined, fallbackId?: string | null): string | null {
  return getMetadataString(metadata, 'bookingId') || getMetadataString(metadata, 'orderId') || fallbackId || null;
}

function handleCheckoutSessionCompleted(
  event: StripeWebhookEvent,
  object: Record<string, unknown>,
): StripeWebhookHandlingResult {
  const session = object as StripeCheckoutSession;
  const estimatedServiceTotalCents = getEstimatedServiceTotalCents(session.metadata);
  const stripeConfirmedAmountPaidCents = session.payment_status === 'paid' ? coalesceCents(session.amount_total) : null;
  const normalized = {
    source: 'checkout.session.completed',
    receiptEligible: session.payment_status === 'paid',
    checkoutSessionId: session.id ?? null,
    paymentIntentId: getObjectId(session.payment_intent),
    clientReferenceId: session.client_reference_id ?? null,
    bookingId: getBookingId(session.metadata, session.client_reference_id),
    orderId: getMetadataString(session.metadata, 'orderId') || session.client_reference_id || null,
    customerEmail:
      session.customer_email || session.customer_details?.email || getMetadataString(session.metadata, 'customerEmail'),
    customerName: session.customer_details?.name || getMetadataString(session.metadata, 'customerName'),
    customerPhone: session.customer_details?.phone || getMetadataString(session.metadata, 'customerPhone'),
    vehicleSummary: getMetadataString(session.metadata, 'vehicle'),
    servicesSummary: getMetadataString(session.metadata, 'servicesSummary'),
    paymentStatus: session.payment_status ?? null,
    checkoutStatus: session.status ?? null,
    estimatedServiceTotalCents,
    depositSubtotalBeforeDiscountCents: coalesceCents(session.amount_subtotal),
    stripeConfirmedAmountPaidCents,
    stripeDiscountAmountCents: coalesceCents(session.total_details?.amount_discount),
    remainingBalanceCents: calculateRemainingBalanceCents(estimatedServiceTotalCents, stripeConfirmedAmountPaidCents),
  };

  return {
    handled: true,
    eventId: event.id,
    eventType: 'checkout.session.completed',
    normalized,
  };
}

function handlePaymentIntentSucceeded(
  event: StripeWebhookEvent,
  object: Record<string, unknown>,
): StripeWebhookHandlingResult {
  const paymentIntent = object as StripePaymentIntent;
  const normalized = {
    source: 'payment_intent.succeeded',
    reconciliationOnly: true,
    paymentIntentId: paymentIntent.id ?? null,
    latestChargeId: getObjectId(paymentIntent.latest_charge),
    bookingId: getBookingId(paymentIntent.metadata),
    orderId: getMetadataString(paymentIntent.metadata, 'orderId'),
    paymentStatus: paymentIntent.status ?? null,
    stripeConfirmedAmountPaidCents: coalesceCents(paymentIntent.amount_received),
    intendedAmountCents: coalesceCents(paymentIntent.amount),
    currency: paymentIntent.currency ?? null,
    customerId: getObjectId(paymentIntent.customer),
    customerEmail: paymentIntent.receipt_email || getMetadataString(paymentIntent.metadata, 'customerEmail'),
  };

  return {
    handled: true,
    eventId: event.id,
    eventType: 'payment_intent.succeeded',
    normalized,
  };
}

function handlePaymentIntentPaymentFailed(
  event: StripeWebhookEvent,
  object: Record<string, unknown>,
): StripeWebhookHandlingResult {
  const paymentIntent = object as StripePaymentIntent;
  const normalized = {
    source: 'payment_intent.payment_failed',
    paymentIntentId: paymentIntent.id ?? null,
    latestChargeId: getObjectId(paymentIntent.latest_charge),
    bookingId: getBookingId(paymentIntent.metadata),
    orderId: getMetadataString(paymentIntent.metadata, 'orderId'),
    paymentStatus: paymentIntent.status ?? null,
    intendedAmountCents: coalesceCents(paymentIntent.amount),
    currency: paymentIntent.currency ?? null,
    customerId: getObjectId(paymentIntent.customer),
    customerEmail: paymentIntent.receipt_email || getMetadataString(paymentIntent.metadata, 'customerEmail'),
    failureCode: paymentIntent.last_payment_error?.code ?? null,
    declineCode: paymentIntent.last_payment_error?.decline_code ?? null,
    failureMessage: paymentIntent.last_payment_error?.message ?? null,
  };

  return {
    handled: true,
    eventId: event.id,
    eventType: 'payment_intent.payment_failed',
    normalized,
  };
}

function handleChargeRefunded(event: StripeWebhookEvent, object: Record<string, unknown>): StripeWebhookHandlingResult {
  const charge = object as StripeCharge;
  const normalized = {
    source: 'charge.refunded',
    chargeId: charge.id ?? null,
    paymentIntentId: getObjectId(charge.payment_intent),
    bookingId: getBookingId(charge.metadata),
    orderId: getMetadataString(charge.metadata, 'orderId'),
    chargeAmountCents: coalesceCents(charge.amount),
    refundedAmountCents: coalesceCents(charge.amount_refunded),
    refunded: charge.refunded ?? null,
    currency: charge.currency ?? null,
    customerEmail: charge.billing_details?.email || getMetadataString(charge.metadata, 'customerEmail'),
    customerName: charge.billing_details?.name || getMetadataString(charge.metadata, 'customerName'),
    customerPhone: charge.billing_details?.phone || getMetadataString(charge.metadata, 'customerPhone'),
  };

  return {
    handled: true,
    eventId: event.id,
    eventType: 'charge.refunded',
    normalized,
  };
}

function handleChargeDisputeCreated(
  event: StripeWebhookEvent,
  object: Record<string, unknown>,
): StripeWebhookHandlingResult {
  const dispute = object as StripeDispute;
  const normalized = {
    source: 'charge.dispute.created',
    disputeId: dispute.id ?? null,
    chargeId: getObjectId(dispute.charge),
    paymentIntentId: getObjectId(dispute.payment_intent),
    bookingId: getBookingId(dispute.metadata),
    orderId: getMetadataString(dispute.metadata, 'orderId'),
    disputedAmountCents: coalesceCents(dispute.amount),
    currency: dispute.currency ?? null,
    disputeReason: dispute.reason ?? null,
    disputeStatus: dispute.status ?? null,
  };

  return {
    handled: true,
    eventId: event.id,
    eventType: 'charge.dispute.created',
    normalized,
  };
}

function handleStripeEvent(event: StripeWebhookEvent): StripeWebhookHandlingResult {
  if (!isApprovedStripeEventType(event.type)) {
    return {
      handled: false,
      eventId: event.id,
      eventType: event.type,
      reason: 'Event type is not handled by this webhook foundation',
    };
  }

  const object = getEventObject(event);
  if (!object) {
    return {
      handled: false,
      eventId: event.id,
      eventType: event.type,
      reason: 'Stripe event data.object is missing or invalid',
    };
  }

  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutSessionCompleted(event, object);
    case 'payment_intent.succeeded':
      return handlePaymentIntentSucceeded(event, object);
    case 'payment_intent.payment_failed':
      return handlePaymentIntentPaymentFailed(event, object);
    case 'charge.refunded':
      return handleChargeRefunded(event, object);
    case 'charge.dispute.created':
      return handleChargeDisputeCreated(event, object);
  }
}

function logStripeHandlingResult(result: StripeWebhookHandlingResult): void {
  if (!result.handled) {
    console.info('stripe.webhook.ignored', result);
    return;
  }

  console.info('stripe.webhook.handled', result);
}

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ detail: 'Stripe webhook is not configured' }, { status: 503 });
  }

  const signatureHeader = request.headers.get('stripe-signature') || '';
  if (!signatureHeader) {
    return NextResponse.json({ detail: 'Missing Stripe signature' }, { status: 400 });
  }

  const payload = await request.text();
  if (!hasMatchingSignature(payload, signatureHeader, webhookSecret)) {
    return NextResponse.json({ detail: 'Invalid Stripe signature' }, { status: 400 });
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(payload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ detail: 'Invalid Stripe webhook payload' }, { status: 400 });
  }

  const handlingResult = handleStripeEvent(event);
  logStripeHandlingResult(handlingResult);

  return NextResponse.json({ received: true, result: handlingResult });
}
