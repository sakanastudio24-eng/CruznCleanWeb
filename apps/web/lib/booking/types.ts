// -----------------------------------------------------------------------------
// Booking Lifecycle Types
// -----------------------------------------------------------------------------
// These states describe the full Cruizn Clean booking journey across intake,
// Cal.com scheduling, Stripe deposit tracking, confirmation, and failure states.

export type BookingStatus =
  | 'draft'
  | 'intake_complete'
  | 'calendar_pending'
  | 'calendar_reserved'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'confirmed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export type BookingChannel = 'web' | 'cal_com' | 'stripe' | 'owner_admin' | 'api';

export type VehicleSize =
  | 'sedan_coupe'
  | 'small_suv_truck'
  | 'large_suv_truck'
  | 'oversized';

export type VehicleSizeSource = 'guide' | 'manual' | 'unknown';

// -----------------------------------------------------------------------------
// Customer + Communication
// -----------------------------------------------------------------------------
// Keep UI validation separate from these types. These types describe the final
// normalized booking object that other systems can consume.

export interface BookingCustomer {
  fullName: string;
  email: string;
  phone: string;
  zipCode: string;
  notes?: string;
}

export interface BookingCommunication {
  sendEmailConfirmation: boolean;
  sendSmsConfirmation: boolean;
  acceptedSmsConsent: boolean;
  acceptedBookingConsent: boolean;
  emailStatus?: 'not_requested' | 'pending' | 'sent' | 'failed';
  ownerEmailStatus?: 'pending' | 'sent' | 'failed';
}

// -----------------------------------------------------------------------------
// Vehicle + Service Selection
// -----------------------------------------------------------------------------
// Services are stored per vehicle so multi-car bookings can keep accurate
// vehicle-specific pricing, discounts, and notes.

export interface BookingServiceSelection {
  serviceId: string;
  name: string;
  category: 'package' | 'protection' | 'correction';
  basePriceCents: number;
  adjustedPriceCents: number;
  discountCents: number;
  finalPriceCents: number;
}

export interface BookingVehicle {
  id: string;
  label: string;
  year: string;
  make: string;
  model: string;
  color: string;
  size: VehicleSize;
  sizeSource: VehicleSizeSource;
  customLabel?: string;
  services: BookingServiceSelection[];
  notes?: string;
}

// -----------------------------------------------------------------------------
// Pricing
// -----------------------------------------------------------------------------
// Pricing should eventually be calculated by shared helpers, not manually
// re-created across preview UI, Stripe checkout, webhook, and email code.

export interface BookingDiscount {
  id: string;
  label: string;
  amountCents: number;
}

export interface BookingPricing {
  subtotalBeforeSavingsCents: number;
  savingsCents: number;
  estimatedTotalCents: number;
  depositDueCents: number;
  remainingEstimateCents: number;
  discounts: BookingDiscount[];
  pricingVersion: string;
}

// -----------------------------------------------------------------------------
// Scheduling + Payment
// -----------------------------------------------------------------------------
// These fields are intentionally provider-aware because V1 uses Cal.com for
// scheduling and Stripe for deposits.

export interface BookingScheduling {
  status: 'not_started' | 'pending' | 'reserved' | 'failed' | 'cancelled';
  provider: 'cal_com';
  calBookingId?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  eventUri?: string;
}

export interface BookingPayment {
  status:
    | 'not_started'
    | 'deposit_pending'
    | 'deposit_paid'
    | 'failed'
    | 'refunded'
    | 'disputed';
  provider: 'stripe';
  checkoutSessionId?: string;
  paymentIntentId?: string;
  depositPaidCents?: number;
  stripeMetadata?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Metadata + Root Booking Object
// -----------------------------------------------------------------------------
// The root Booking object is the future source of truth for intake, Cal.com,
// Stripe, Resend emails, owner notifications, and future admin views.

export interface BookingMetadata {
  source: BookingChannel;
  userAgent?: string;
  ipHash?: string;
  storageBackend: 'local_json' | 'supabase';
  schemaVersion: 'booking.v1';
  internalNotes?: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  customer: BookingCustomer;
  vehicles: BookingVehicle[];
  pricing: BookingPricing;
  scheduling: BookingScheduling;
  payment: BookingPayment;
  communication: BookingCommunication;
  metadata: BookingMetadata;
  createdAt: string;
  updatedAt: string;
}
