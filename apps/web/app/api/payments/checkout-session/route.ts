import { NextResponse } from 'next/server';

import type { BookingVehicleRequest, VehicleSize, VehicleSizeSource } from '@/lib/booking-types';
import { getVehiclePricingBreakdown } from '@/lib/pricing';
import { findServiceById } from '@/lib/services-catalog';

export const runtime = 'nodejs';

interface CheckoutSessionRequest {
  bookingId?: unknown;
  customer?: {
    email?: unknown;
    fullName?: unknown;
    phone?: unknown;
  };
  vehicles?: unknown;
}

interface CheckoutTotals {
  estimatedTotalCents: number;
  depositCents: number;
  savingsTotalCents: number;
  servicesSummary: string;
}

const STRIPE_CHECKOUT_SESSIONS_URL = 'https://api.stripe.com/v1/checkout/sessions';
const VALID_VEHICLE_SIZES: VehicleSize[] = ['sedan_coupe', 'small_suv_truck', 'large_suv_truck', 'oversized'];
const VALID_VEHICLE_SIZE_SOURCES: VehicleSizeSource[] = ['guide', 'manual'];
const VEHICLE_SIZE_LABELS: Record<VehicleSize, string> = {
  sedan_coupe: 'Sedan/Coupe',
  small_suv_truck: 'Small SUV/Truck',
  large_suv_truck: 'Large SUV/Truck',
  oversized: 'Oversized',
};

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getVehicleSizeSource(value: unknown): VehicleSizeSource | null {
  const sizeSource = getString(value) as VehicleSizeSource;
  return VALID_VEHICLE_SIZE_SOURCES.includes(sizeSource) ? sizeSource : null;
}

function getEnvNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || 'https://www.cruiznclean.com';
}

function getStripeSuccessUrl(): string {
  return process.env.STRIPE_SUCCESS_URL?.trim() || `${getSiteUrl()}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
}

function getStripeCancelUrl(): string {
  return process.env.STRIPE_CANCEL_URL?.trim() || `${getSiteUrl()}/booking`;
}

function clampDepositCents(estimatedTotalCents: number): number {
  const percent = getEnvNumber('STRIPE_DEPOSIT_PERCENT', 10);
  const minCents = getEnvNumber('STRIPE_DEPOSIT_MIN_CENTS', 2500);
  const maxCents = getEnvNumber('STRIPE_DEPOSIT_MAX_CENTS', 10000);
  const rawDepositCents = Math.round(estimatedTotalCents * (percent / 100));

  return Math.min(Math.max(rawDepositCents, minCents), maxCents);
}

function normalizeVehicles(rawVehicles: unknown): BookingVehicleRequest[] {
  if (!Array.isArray(rawVehicles)) {
    return [];
  }

  return rawVehicles
    .map((vehicle): BookingVehicleRequest | null => {
      if (!vehicle || typeof vehicle !== 'object') {
        return null;
      }

      const record = vehicle as Record<string, unknown>;
      const size = getString(record.size) as VehicleSize;
      const serviceIds = Array.isArray(record.serviceIds)
        ? record.serviceIds.map(getString).filter(Boolean)
        : [];

      if (!VALID_VEHICLE_SIZES.includes(size)) {
        return null;
      }

      return {
        id: getString(record.id),
        label: getString(record.label),
        make: getString(record.make),
        model: getString(record.model),
        year: getString(record.year),
        color: getString(record.color),
        size,
        sizeSource: getVehicleSizeSource(record.sizeSource),
        customLabel: getString(record.customLabel) || undefined,
        serviceIds,
      };
    })
    .filter((vehicle): vehicle is BookingVehicleRequest => Boolean(vehicle));
}

function formatVehicleDetail(vehicle: BookingVehicleRequest): string {
  const vehicleName = vehicle.customLabel || [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ').trim();
  const fallbackName = vehicleName || vehicle.label || 'Vehicle';
  const displayName = vehicle.color ? `${fallbackName} (${vehicle.color})` : fallbackName;
  const customPrefix = vehicle.customLabel || vehicle.sizeSource === 'manual' ? 'Custom vehicle: ' : '';
  return `${customPrefix}${displayName} — ${VEHICLE_SIZE_LABELS[vehicle.size]}`;
}

function formatMetadataDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function calculateCheckoutTotals(vehicles: BookingVehicleRequest[]): CheckoutTotals {
  let estimatedTotalDollars = 0;
  let savingsTotalDollars = 0;
  const summaryParts: string[] = [];

  vehicles.forEach((vehicle) => {
    const services = vehicle.serviceIds.map((serviceId) => {
      const service = findServiceById(serviceId);
      if (!service) {
        throw new Error(`Unknown service selected: ${serviceId}`);
      }

      return service;
    });

    if (services.length === 0) {
      return;
    }

    const breakdown = getVehiclePricingBreakdown(services, vehicle.size);
    estimatedTotalDollars += breakdown.total;
    savingsTotalDollars += breakdown.savingsTotal;

    const serviceNames = services.map((service) => service.name).join(', ');
    const savingsSummary = breakdown.savingsTotal > 0 ? `; savings $${breakdown.savingsTotal}` : '';
    summaryParts.push(`${formatVehicleDetail(vehicle)}: ${serviceNames}; total $${breakdown.total}${savingsSummary}`);
  });

  const estimatedTotalCents = Math.round(estimatedTotalDollars * 100);

  return {
    estimatedTotalCents,
    depositCents: clampDepositCents(estimatedTotalCents),
    savingsTotalCents: Math.round(savingsTotalDollars * 100),
    servicesSummary: summaryParts.join(' | '),
  };
}

function appendStripeField(body: URLSearchParams, key: string, value: string | number): void {
  body.append(key, String(value));
}

export async function POST(request: Request): Promise<NextResponse> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return NextResponse.json({ detail: 'Stripe checkout is not configured' }, { status: 503 });
  }

  let payload: CheckoutSessionRequest;
  try {
    payload = (await request.json()) as CheckoutSessionRequest;
  } catch {
    return NextResponse.json({ detail: 'Invalid checkout request payload' }, { status: 400 });
  }

  const bookingId = getString(payload.bookingId);
  const customerEmail = getString(payload.customer?.email);
  const customerName = getString(payload.customer?.fullName);
  const customerPhone = getString(payload.customer?.phone);
  const vehicles = normalizeVehicles(payload.vehicles).filter((vehicle) => vehicle.serviceIds.length > 0);

  if (!bookingId || !customerEmail || vehicles.length === 0) {
    return NextResponse.json({ detail: 'Booking id, customer email, and selected services are required' }, { status: 422 });
  }

  let totals: CheckoutTotals;
  try {
    totals = calculateCheckoutTotals(vehicles);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Unable to calculate checkout total' },
      { status: 422 },
    );
  }

  if (totals.estimatedTotalCents <= 0) {
    return NextResponse.json({ detail: 'Select at least one service before payment' }, { status: 422 });
  }

  // ---------------------------------------------------------------------------
  // Stripe Metadata Contract
  // ---------------------------------------------------------------------------
  // Webhook normalization and receipt emails depend on these metadata keys.
  // Do not rename them casually; future refactors should map these values from
  // the canonical Booking object instead of rebuilding them inside this route.

  const stripePayload = new URLSearchParams();
  appendStripeField(stripePayload, 'mode', 'payment');
  appendStripeField(stripePayload, 'customer_email', customerEmail);
  appendStripeField(stripePayload, 'client_reference_id', bookingId);
  appendStripeField(stripePayload, 'allow_promotion_codes', 'true');
  appendStripeField(stripePayload, 'success_url', getStripeSuccessUrl());
  appendStripeField(stripePayload, 'cancel_url', getStripeCancelUrl());
  appendStripeField(stripePayload, 'line_items[0][price_data][currency]', 'usd');
  appendStripeField(stripePayload, 'line_items[0][price_data][product_data][name]', 'Cruizn Clean booking deposit');
  appendStripeField(
    stripePayload,
    'line_items[0][price_data][product_data][description]',
    'Deposit applied toward the final detailing service total',
  );
  appendStripeField(stripePayload, 'line_items[0][price_data][unit_amount]', totals.depositCents);
  appendStripeField(stripePayload, 'line_items[0][quantity]', 1);
  appendStripeField(stripePayload, 'metadata[bookingId]', bookingId);
  appendStripeField(stripePayload, 'metadata[orderId]', bookingId);
  appendStripeField(stripePayload, 'metadata[customerName]', customerName);
  appendStripeField(stripePayload, 'metadata[customerEmail]', customerEmail);
  appendStripeField(stripePayload, 'metadata[customerPhone]', customerPhone);
  appendStripeField(stripePayload, 'metadata[vehicle]', vehicles.map(formatVehicleDetail).join(' | ').slice(0, 500));
  appendStripeField(stripePayload, 'metadata[vehicleCount]', vehicles.length);
  appendStripeField(stripePayload, 'metadata[estimatedTotalCents]', totals.estimatedTotalCents);
  appendStripeField(stripePayload, 'metadata[estimateTotal]', formatMetadataDollars(totals.estimatedTotalCents));
  appendStripeField(stripePayload, 'metadata[savingsTotalCents]', totals.savingsTotalCents);
  appendStripeField(stripePayload, 'metadata[depositCents]', totals.depositCents);
  appendStripeField(stripePayload, 'metadata[depositAmount]', formatMetadataDollars(totals.depositCents));
  appendStripeField(
    stripePayload,
    'metadata[remainingBalance]',
    formatMetadataDollars(totals.estimatedTotalCents - totals.depositCents),
  );
  appendStripeField(stripePayload, 'metadata[servicesSummary]', totals.servicesSummary.slice(0, 500));

  const stripeResponse = await fetch(STRIPE_CHECKOUT_SESSIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: stripePayload,
  });

  const stripeJson = (await stripeResponse.json()) as { url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !stripeJson.url) {
    return NextResponse.json(
      { detail: `Stripe checkout failed: ${stripeJson.error?.message || 'No checkout URL returned'}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    checkoutUrl: stripeJson.url,
    depositCents: totals.depositCents,
    estimatedTotalCents: totals.estimatedTotalCents,
  });
}
