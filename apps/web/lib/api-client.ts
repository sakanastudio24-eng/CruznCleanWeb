import type {
  BookingIntakeRequest,
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
 * Submits booking intake data to the backend.
 */
export async function submitBookingIntake(payload: {
  customer: CustomerBookingForm;
  vehicles: VehicleProfile[];
  honeypot?: string;
}): Promise<{ status: string; message?: string }> {
  const vehicles: BookingVehicleRequest[] = payload.vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: vehicle.label,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    size: vehicle.size,
    serviceIds: vehicle.serviceIds,
  }));

  const requestPayload: BookingIntakeRequest = {
    customer: payload.customer,
    vehicles,
    honeypot: payload.honeypot ?? '',
  };

  const response = await fetch(`${getApiBaseUrl()}/cal-bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Booking intake submission failed.'));
  }

  return (await response.json()) as { status: string; message?: string };
}

/**
 * Submits contact questions to the backend.
 */
export async function submitContactMessage(payload: ContactForm): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/contact-messages`, {
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
