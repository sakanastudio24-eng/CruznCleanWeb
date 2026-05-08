import type {
  BookingVehicleRequest,
  ContactForm,
  CustomerBookingForm,
  VehicleProfile,
} from '@/lib/booking-types';
import { getRuntimeConfig } from '@/lib/runtime-config';

/**
 * Returns the configured backend API base URL from the runtime config snapshot.
 */
export function getApiBaseUrl(): string {
  return getRuntimeConfig().apiBaseUrl;
}

/**
 * Returns the preferred calendar booking URL from request-time config.
 */
export function getCalendarBookingUrl(): string {
  return getRuntimeConfig().calendarUrl;
}

/**
 * Returns the Cal.com event link slug used by inline embeds.
 */
export function getCalendarBookingLink(): string {
  return getRuntimeConfig().calendarLink;
}

/**
 * Parses API error payloads into human-readable messages.
 */
async function getApiErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown; message?: string };
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.detail === 'string' && payload.detail.trim()) {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      const message = payload.detail
        .map((entry) => (typeof entry === 'object' && entry && 'msg' in entry ? String(entry.msg) : ''))
        .filter(Boolean)
        .join(' ');
      if (message) {
        return message;
      }
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

/**
 * Creates a server-side Stripe Checkout Session for the saved booking deposit.
 */
export async function createStripeCheckoutSession(payload: {
  bookingId: string;
  customer: Pick<CustomerBookingForm, 'email' | 'fullName' | 'phone'>;
  vehicles: VehicleProfile[];
}): Promise<{ checkoutUrl: string; depositCents: number; estimatedTotalCents: number }> {
  const vehicles: BookingVehicleRequest[] = payload.vehicles
    .filter((vehicle) => vehicle.serviceIds.length > 0)
    .map((vehicle) => ({
      id: vehicle.id,
      label: vehicle.label,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      size: vehicle.size,
      sizeSource: vehicle.sizeSource,
      customLabel: vehicle.customLabel,
      serviceIds: vehicle.serviceIds,
    }));

  const response = await fetch('/api/payments/checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bookingId: payload.bookingId,
      customer: payload.customer,
      vehicles,
    }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Stripe checkout session creation failed.'));
  }

  return (await response.json()) as { checkoutUrl: string; depositCents: number; estimatedTotalCents: number };
}

/**
 * Submits contact questions to the backend.
 */
export async function submitContactMessage(payload: ContactForm): Promise<void> {
  const response = await fetch('/api/contact-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Contact message submission failed.'));
  }
}
