export type BookingSessionStatus = 'draft' | 'details_complete' | 'scheduled' | 'payment_started';

export interface BookingContextSnapshot {
  bookingId: string;
  estimatedTotal: number;
  servicesSummary: string;
  vehicleCount: number;
}

export interface ScheduledAppointmentSnapshot {
  bookingId: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  eventTypeId: number | null;
  status: string;
  paymentRequired: boolean | null;
  isRecurring: boolean | null;
}

export interface StoredBookingSession {
  bookingSessionId: string;
  bookingReference: string;
  bookingStatus: BookingSessionStatus;
  draftSignature: string;
  submittedBookingContext?: BookingContextSnapshot;
  scheduledAppointment?: ScheduledAppointmentSnapshot;
  checkoutSessionId?: string;
  checkoutUrl?: string;
  checkoutIdempotencyKey?: string;
  updatedAt: string;
}

export const BOOKING_SESSION_STORAGE_KEY = 'cruizn-clean-booking-session-v1';

function nowIso(): string {
  return new Date().toISOString();
}

function randomToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replaceAll('-', '');
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function createBookingSession(draftSignature: string): StoredBookingSession {
  const token = randomToken();
  const timestamp = Date.now().toString(36);

  return {
    bookingSessionId: `bs_${token}`,
    bookingReference: `web-${timestamp}-${token.slice(0, 10)}`,
    bookingStatus: 'draft',
    draftSignature,
    updatedAt: nowIso(),
  };
}

export function getBookingDraftFingerprint(draftSignature: string): string {
  let hash = 2166136261;

  for (let index = 0; index < draftSignature.length; index += 1) {
    hash ^= draftSignature.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `draft-${(hash >>> 0).toString(36)}-${draftSignature.length.toString(36)}`;
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function isStoredBookingSession(value: unknown): value is StoredBookingSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<StoredBookingSession>;
  return (
    typeof record.bookingSessionId === 'string'
    && typeof record.bookingReference === 'string'
    && typeof record.bookingStatus === 'string'
    && typeof record.draftSignature === 'string'
  );
}

export function readStoredBookingSession(): StoredBookingSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BOOKING_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isStoredBookingSession(parsed) ? parsed : null;
  } catch {
    window.localStorage.removeItem(BOOKING_SESSION_STORAGE_KEY);
    return null;
  }
}

export function writeStoredBookingSession(session: StoredBookingSession): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    BOOKING_SESSION_STORAGE_KEY,
    JSON.stringify({
      ...session,
      updatedAt: nowIso(),
    }),
  );
}

export function clearStoredBookingSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(BOOKING_SESSION_STORAGE_KEY);
}

export function ensureBookingSession(draftSignature: string): StoredBookingSession {
  const stored = readStoredBookingSession();
  if (!stored) {
    const created = createBookingSession(draftSignature);
    writeStoredBookingSession(created);
    return created;
  }

  if (stored.draftSignature === draftSignature) {
    return stored;
  }

  const resetSession: StoredBookingSession = {
    bookingSessionId: stored.bookingSessionId,
    bookingReference: stored.bookingReference,
    bookingStatus: 'draft',
    draftSignature,
    updatedAt: nowIso(),
  };
  writeStoredBookingSession(resetSession);
  return resetSession;
}

export function buildCheckoutIdempotencyKey(bookingReference: string, calBookingUid: string): string {
  const safeReference = bookingReference.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 96);
  const safeCalUid = calBookingUid.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 96);
  return `cruizn-clean-checkout-${safeReference}-${safeCalUid}`;
}
