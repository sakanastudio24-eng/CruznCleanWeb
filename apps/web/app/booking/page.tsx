'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CarFront,
  CheckCircle2,
  CreditCard,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { useMemo, useRef, useState, type ComponentType } from 'react';

import { CalInlineEmbed } from '@/components/booking/cal-inline-embed';
import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import { VehicleSizeGuideLookup } from '@/components/vehicle/vehicle-size-guide-lookup';
import { BOOKING_LIMIT_DISCLAIMER, MAX_BOOKED_VEHICLES_PER_DAY, countSelectedVehicles } from '@/lib/booking-policy';
import type { CustomerBookingForm, ServiceOption, VehicleProfile, VehicleSize } from '@/lib/booking-types';
import { createStripeCheckoutSession, getCalendarBookingLink, getCalendarBookingUrl, submitBookingIntake } from '@/lib/api-client';
import { getServiceAreaZipSummary, isZipInServiceArea, normalizeZipCode } from '@/lib/service-area';
import { findServiceById } from '@/lib/services-catalog';
import { usePersistentState } from '@/lib/use-persistent-state';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';
import type { VehiclePricingBreakdown } from '@/lib/pricing';

interface StepItem {
  id: number;
  title: string;
  icon: ComponentType<{ className?: string }>;
}

interface VehicleSizeOption {
  id: VehicleSize;
  label: string;
  hint: string;
}

interface BookingFieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  zipCode?: string;
  year?: string;
  make?: string;
  model?: string;
  color?: string;
  package?: string;
  serviceSelection?: string;
  selectedVehicleDetails?: string;
  selectedVehicleLimit?: string;
  confirmationChannel?: string;
  smsConsent?: string;
  acceptedConsent?: string;
}

interface SubmittedBookingCalendarContext {
  bookingId: string;
  customer: Pick<CustomerBookingForm, 'email' | 'fullName' | 'phone'>;
  estimatedTotal: number;
  servicesSummary: string;
  vehicleCount: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: CustomerBookingForm = {
  fullName: '',
  email: '',
  phone: '',
  zipCode: '',
  sendEmailConfirmation: true,
  sendSmsConfirmation: false,
  acceptedSmsConsent: false,
  notes: '',
  acceptedConsent: false,
};

const BOOKING_FORM_STORAGE_KEY = 'cruizn-clean-booking-form-v1';
// Legacy pre-rename keys are intentionally retained for one-time draft migration after brand spelling updates.
const LEGACY_BOOKING_FORM_STORAGE_KEYS = ['cruzin-clean-booking-form-v1', 'cruzn-clean-booking-form-v1'];

/**
 * Returns the booking step sequence used by the progress header.
 */
function getBookingSteps(): StepItem[] {
  return [
    { id: 1, title: 'Your Details', icon: User },
    { id: 2, title: 'Schedule', icon: Calendar },
    { id: 3, title: 'Payment', icon: CreditCard },
  ];
}

/**
 * Returns available vehicle sizes shown during booking step one.
 */
function getVehicleSizes(): VehicleSizeOption[] {
  return [
    { id: 'sedan_coupe', label: 'Sedan / Coupe', hint: 'Base listed pricing' },
    { id: 'small_suv_truck', label: 'Small SUV / Truck', hint: '+20%' },
    { id: 'large_suv_truck', label: 'Large SUV / Truck', hint: '+40%' },
  ];
}

/**
 * Returns the shared visual treatment for selectable booking cards.
 */
function getSelectableCardClass(selected: boolean, emphasized = false): string {
  if (selected) {
    return 'border-burgundyAccent bg-burgundy/20 shadow-[0_0_0_1px_rgb(140_28_44_/_0.55),0_18px_38px_rgb(0_0_0_/_0.38)] ring-1 ring-burgundyAccent/45';
  }

  if (emphasized) {
    return 'border-white/20 bg-white/[0.08] hover:border-burgundyAccent/45 hover:bg-burgundy/10';
  }

  return 'border-line bg-[#141414] hover:border-burgundyAccent/35 hover:bg-burgundy/10';
}

/**
 * Validates confirmation preference inputs for email and SMS updates.
 */
function hasValidConfirmationPreference(form: CustomerBookingForm): boolean {
  const selectedAnyChannel = form.sendEmailConfirmation || form.sendSmsConfirmation;
  const smsConsentSatisfied = !form.sendSmsConfirmation || form.acceptedSmsConsent;
  return selectedAnyChannel && smsConsentSatisfied;
}

/**
 * Validates required step-one booking fields.
 */
function hasFirstAndLastName(fullName: string): boolean {
  return fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
}

/**
 * Keeps make and color inputs to text-style characters while preserving natural names.
 */
function sanitizeVehicleTextInput(value: string): string {
  return value.replace(/[^a-zA-Z\s'-]/g, '');
}

/**
 * Keeps vehicle year entry numeric and bounded to a normal four-digit year.
 */
function sanitizeVehicleYearInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

/**
 * Appends shared customer/contact validation errors to one error object.
 */
function appendCustomerValidationErrors(
  form: CustomerBookingForm,
  errors: BookingFieldErrors,
  consentMessage: string,
): void {
  if (!hasFirstAndLastName(form.fullName)) {
    errors.fullName = 'Enter first and last name';
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email like name@provider.com';
  }

  const phoneDigits = form.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.phone = 'Enter a valid phone number';
  }

  if (form.zipCode.trim().length < 5) {
    errors.zipCode = 'Enter a valid ZIP code';
  } else if (!isZipInServiceArea(form.zipCode)) {
    errors.zipCode = 'This ZIP is outside the current online booking service area Request a quote so we can review travel and availability';
  }

  if (!hasValidConfirmationPreference(form)) {
    errors.confirmationChannel = 'Select at least one confirmation channel';
  }

  if (form.sendSmsConfirmation && !form.acceptedSmsConsent) {
    errors.smsConsent = 'SMS confirmation requires consent';
  }

  if (!form.acceptedConsent) {
    errors.acceptedConsent = consentMessage;
  }
}

/**
 * Validates step-one fields and returns per-field helper errors.
 */
function validateStepOne(form: CustomerBookingForm, activeVehicle: VehicleProfile | undefined): BookingFieldErrors {
  const errors: BookingFieldErrors = {};

  appendCustomerValidationErrors(form, errors, 'You must accept booking consent to continue');

  if (!activeVehicle?.year.trim()) {
    errors.year = 'Year is required';
  }

  if (!activeVehicle?.make.trim()) {
    errors.make = 'Make is required';
  }

  if (!activeVehicle?.model.trim()) {
    errors.model = 'Model is required';
  }

  if (!activeVehicle?.color.trim()) {
    errors.color = 'Color is required';
  }

  return errors;
}

/**
 * Validates final booking submission requirements.
 */
function validateSubmission(form: CustomerBookingForm, vehicles: VehicleProfile[]): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  const selectedVehicles = vehicles.filter((vehicle) => vehicle.serviceIds.length > 0);
  const selectedVehicleCount = countSelectedVehicles(vehicles);

  appendCustomerValidationErrors(form, errors, 'You must accept booking consent before submitting');

  if (selectedVehicles.length === 0) {
    errors.serviceSelection = 'Select at least one service before submitting';
  }

  if (selectedVehicleCount > MAX_BOOKED_VEHICLES_PER_DAY) {
    errors.selectedVehicleLimit = BOOKING_LIMIT_DISCLAIMER;
  }

  const missingVehicleDetails = selectedVehicles.find(
    (vehicle) => !vehicle.year.trim() || !vehicle.make.trim() || !vehicle.model.trim() || !vehicle.color.trim(),
  );

  if (missingVehicleDetails) {
    errors.selectedVehicleDetails = `Complete year, make, model, and color for ${getVehicleDisplayName(missingVehicleDetails)}.`;
  }

  return errors;
}

/**
 * Formats numeric totals into display currency strings.
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(0)}`;
}

/**
 * Builds a compact vehicle label for dock cards.
 */
function getVehicleHint(vehicle: VehicleProfile): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'No vehicle details yet';
}

/**
 * Builds a compact line of selected services for Cal.com metadata.
 */
function getSelectedServicesSummary(
  selectedVehicles: VehicleProfile[],
  getVehiclePricingBreakdown: (vehicleId: string) => VehiclePricingBreakdown,
): string {
  return selectedVehicles
    .map((vehicle) => {
      const breakdown = getVehiclePricingBreakdown(vehicle.id);
      const serviceNames = breakdown.serviceLines.map((line) => line.service.name).join(', ');
      const savingsSummary = breakdown.savingsTotal > 0 ? `; savings $${breakdown.savingsTotal}` : '';
      return `${getBookedVehicleDetail(vehicle)}: ${serviceNames || 'No services selected'}; total $${breakdown.total}${savingsSummary}`;
    })
    .join(' | ');
}

/**
 * Formats one booked vehicle with its own year, make, model, and optional color.
 */
function getBookedVehicleDetail(vehicle: VehicleProfile): string {
  const primaryDetail = getVehicleDisplayName(vehicle);
  return vehicle.color.trim() ? `${primaryDetail} (${vehicle.color.trim()})` : primaryDetail;
}

/**
 * Renders the booking workflow with improved visual hierarchy and flow.
 */
export default function BookingPage(): JSX.Element {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    removeVehicle,
    updateVehicle,
    toggleServiceForVehicle,
    getVehicleServices,
    getVehiclePricingBreakdown,
    getGrandPricingBreakdown,
    getVehicleTotal,
    getGrandTotal,
  } = useBooking();

  const [step, setStep] = useState(1);
  const [form, setForm, clearPersistedForm] = usePersistentState<CustomerBookingForm>(
    BOOKING_FORM_STORAGE_KEY,
    INITIAL_FORM,
    LEGACY_BOOKING_FORM_STORAGE_KEYS,
  );
  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [submittedBookingContext, setSubmittedBookingContext] = useState<SubmittedBookingCalendarContext | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const plannerTopRef = useRef<HTMLDivElement>(null);

  const steps = getBookingSteps();
  const sizes = getVehicleSizes();
  const activeVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0],
    [activeVehicleId, vehicles],
  );

  const selectedServiceRecords = activeVehicle ? getVehicleServices(activeVehicle.id) : [];
  const activePricingBreakdown = activeVehicle ? getVehiclePricingBreakdown(activeVehicle.id) : null;
  const selectedPackageLine = activePricingBreakdown?.serviceLines.find((line) => line.service.id.startsWith('pkg-'));
  const selectedPremiumLines = activePricingBreakdown?.serviceLines.filter((line) => line.service.category !== 'package') ?? [];
  const grandPricingBreakdown = getGrandPricingBreakdown();
  const selectedVehicles = useMemo(
    () => vehicles.filter((vehicle) => getVehicleServices(vehicle.id).length > 0),
    [getVehicleServices, vehicles],
  );
  const stepOneErrors = useMemo(
    () => validateStepOne(form, activeVehicle),
    [activeVehicle, form],
  );
  const stepOneValid = Object.keys(stepOneErrors).length === 0;
  const normalizedZipCode = normalizeZipCode(form.zipCode);
  const showServiceAreaQuoteHelp = normalizedZipCode.length === 5 && !isZipInServiceArea(normalizedZipCode);

  /**
   * Clears field-level errors and optimistic confirmation state before new edits.
   */
  function resetInteractionState(): void {
    setFieldErrors({});
    setBookingConfirmed(false);
    setSubmittedBookingContext(null);
    setPaymentSubmitting(false);
  }

  /**
   * Updates one customer form field while preserving other keys.
   */
  function updateCustomerField<K extends keyof CustomerBookingForm>(key: K, value: CustomerBookingForm[K]): void {
    resetInteractionState();
    setForm((current) => ({ ...current, [key]: value }));
  }

  /**
   * Updates one active vehicle field during booking.
   */
  function updateActiveVehicleField(field: 'make' | 'model' | 'year' | 'color', value: string): void {
    if (!activeVehicle) {
      return;
    }

    resetInteractionState();
    const sanitizedValue =
      field === 'year'
        ? sanitizeVehicleYearInput(value)
        : field === 'make' || field === 'color'
          ? sanitizeVehicleTextInput(value)
          : value;
    updateVehicle(activeVehicle.id, { [field]: sanitizedValue });
  }

  /**
   * Adds another vehicle to the booking dock up to configured max.
   */
  function handleAddVehicle(): void {
    if (vehicles.length >= MAX_BOOKED_VEHICLES_PER_DAY) {
      setStatusMessage(BOOKING_LIMIT_DISCLAIMER);
      return;
    }

    resetInteractionState();
    addVehicle();
    setStatusMessage('');
  }

  /**
   * Removes one vehicle from the booking dock.
   */
  function handleRemoveVehicle(vehicleId: string): void {
    resetInteractionState();
    removeVehicle(vehicleId);
    setStatusMessage('');
  }

  /**
   * Scrolls the current planner card into view after step changes.
   */
  function scrollPlannerToTop(): void {
    window.requestAnimationFrame(() => {
      plannerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /**
   * Advances to the next step when current-step validation passes.
   */
  function goNext(): void {
    if (step === 1 && !stepOneValid) {
      setFieldErrors(stepOneErrors);
      setStatusMessage('Complete required details and confirm email/SMS preferences to continue');
      return;
    }

    setFieldErrors({});
    setStatusMessage('');
    setStep((current) => Math.min(current + 1, steps.length));
    scrollPlannerToTop();
  }

  /**
   * Moves back to the previous booking step.
   */
  function goBack(): void {
    setFieldErrors({});
    setStatusMessage('');
    setStep((current) => Math.max(current - 1, 1));
  }

  /**
   * Submits booking intake and shows confirmation before calendar scheduling.
   */
  async function handleSubmitBooking(): Promise<void> {
    const submissionErrors = validateSubmission(form, vehicles);
    if (Object.keys(submissionErrors).length > 0) {
      setFieldErrors(submissionErrors);
      setStatusMessage('Select at least one service on the Services page before scheduling');
      return;
    }

    resetInteractionState();
    setSubmitting(true);
    setStatusMessage('Submitting your booking intake');

    try {
      const response = await submitBookingIntake({ customer: form, vehicles, honeypot });
      const nextSubmittedBookingContext: SubmittedBookingCalendarContext = {
        bookingId: response.bookingId || 'pending-cal-booking',
        customer: {
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
        },
        estimatedTotal: getGrandTotal(),
        servicesSummary: getSelectedServicesSummary(selectedVehicles, getVehiclePricingBreakdown),
        vehicleCount: selectedVehicles.length,
      };
      setBookingConfirmed(true);
      setSubmittedBookingContext(nextSubmittedBookingContext);
      setStatusMessage(response.message?.replace(/\.$/, '') ?? 'Booking intake saved Choose your appointment time below');
      clearPersistedForm();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message.replace(/\.$/, '') : 'Submission failed Please try again');
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Adds the missing services suggested by the active vehicle savings helper.
   */
  function applyActiveSavingsSuggestion(serviceIds: string[]): void {
    if (!activeVehicle) {
      return;
    }

    serviceIds.forEach((serviceId) => {
      const service = findServiceById(serviceId);
      if (service && !activeVehicle.serviceIds.includes(service.id)) {
        toggleServiceForVehicle(activeVehicle.id, service);
      }
    });
  }

  /**
   * Creates a hosted Stripe Checkout Session and redirects the customer for deposit payment.
   */
  async function handleCreateCheckoutSession(): Promise<void> {
    if (!submittedBookingContext) {
      setStatusMessage('Save the intake and choose a calendar time before payment');
      return;
    }

    setPaymentSubmitting(true);
    setStatusMessage('Opening secure deposit checkout');

    try {
      const checkoutSession = await createStripeCheckoutSession({
        bookingId: submittedBookingContext.bookingId,
        customer: {
          email: submittedBookingContext.customer.email,
          fullName: submittedBookingContext.customer.fullName,
        },
        vehicles,
      });
      window.location.href = checkoutSession.checkoutUrl;
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message.replace(/\.$/, '') : 'Unable to open Stripe checkout');
      setPaymentSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-ink px-4 py-10 text-white sm:px-6 sm:py-12 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8c1c2c44,transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl rounded-[28px] border border-line bg-[#141414]/80 px-4 py-6 backdrop-blur-md sm:rounded-[30px] sm:px-8 sm:py-8 md:px-10 md:py-9">
          <h1 className="text-center font-heading text-2xl font-semibold sm:text-4xl md:text-5xl">Book Your Appointment</h1>
          <p className="mt-2 text-center text-sm text-white/75 sm:text-base">Details, schedule, deposit, and confirmation</p>

          <div className="mx-auto mt-6 max-w-4xl">
            <div className="h-2 rounded-full bg-black/30">
              <div
                className="h-2 rounded-full bg-burgundy transition-all duration-500"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {steps.map((item) => {
                const Icon = item.icon;
                const active = item.id === step;
                const complete = item.id < Math.min(step, steps.length);

                return (
                  <div key={item.id} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-300 ${
                        complete
                          ? 'border-burgundyAccent bg-burgundy text-white'
                        : active
                            ? 'border-burgundyAccent bg-burgundyAccent text-white'
                            : 'border-white/30 bg-white/5 text-white/70'
                      }`}
                    >
                      {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <p className={`text-xs sm:text-sm ${active ? 'text-white' : 'text-white/70'}`}>{item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">
        <div ref={plannerTopRef} className="gray-card flex min-h-[760px] flex-col p-5">
          <div className="rounded-2xl border border-line bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/60">Vehicle Deck</p>
                <p className="text-sm text-ink/70">Manage multiple cars in one booking</p>
              </div>
              <button
                type="button"
                onClick={handleAddVehicle}
                    className="inline-flex items-center gap-2 rounded-full border border-burgundy/60 bg-burgundy px-3 py-1.5 text-xs font-semibold text-white transition duration-300 hover:bg-burgundyAccent"
              >
                <Plus className="h-4 w-4" /> Add Vehicle
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-ink/60">{BOOKING_LIMIT_DISCLAIMER}</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => {
                const active = vehicle.id === activeVehicleId;
                return (
                  <article
                    key={vehicle.id}
                    className={`rounded-xl border p-3 transition-all duration-300 ${
                      active ? 'border-burgundyAccent bg-burgundy/15 shadow-sm' : 'border-line bg-[#141414] hover:border-burgundyAccent/35 hover:bg-burgundy/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveVehicleId(vehicle.id)}
                        className="text-left"
                        aria-pressed={active}
                      >
                        <p className="font-semibold text-ink">{getVehicleDisplayName(vehicle)}</p>
                        <p className="text-xs text-ink/60">{getVehicleHint(vehicle)}</p>
                      </button>
                      {vehicles.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(vehicle.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                          aria-label={`Remove ${getVehicleDisplayName(vehicle)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-xs">
                      <span className="text-ink/65">{vehicle.serviceIds.length} selections</span>
                      <span className="font-semibold text-charcoal">{formatCurrency(getVehicleTotal(vehicle.id))}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-5">
          {step === 1 ? (
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-ink">Your Details</h2>
                <p className="mt-1 text-sm text-ink/65">
                  Review the active vehicle, complete contact details, and keep your selected services attached before calendar handoff
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-xl font-semibold text-ink">Select Your Vehicle</h3>
                <p className="mt-1 text-sm text-ink/60">
                  Match the active vehicle to the closest standard category
                </p>
                {activeVehicle ? (
                  <VehicleSizeGuideLookup
                    activeVehicle={activeVehicle}
                    includeOversized={false}
                    onApplyLookupMatch={(match) => {
                      resetInteractionState();
                      updateVehicle(activeVehicle.id, {
                        make: match.make,
                        model: match.model,
                        size: match.size,
                      });
                    }}
                    className="mt-3"
                  />
                ) : null}
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {sizes.map((size) => {
                    const selected = activeVehicle?.size === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => {
                          if (!activeVehicle) {
                            return;
                          }

                          resetInteractionState();
                          updateVehicle(activeVehicle.id, { size: size.id });
                        }}
                        aria-pressed={selected}
                        className={`rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                          getSelectableCardClass(selected)
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-heading text-base font-semibold text-ink">{size.label}</p>
                        </div>
                        <p className="text-xs text-ink/55">{size.hint}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-[#141414] px-4 py-3">
                  <p className="text-sm text-ink/70">
                    Oversized, lifted, modified, specialty, or unlisted vehicles should get a custom quote before scheduling
                  </p>
                  <Link href="/quote" className="rounded-full bg-burgundy px-4 py-2 text-xs font-bold text-white transition hover:bg-burgundyAccent">
                    Request a Quote
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/60">Selected Services</p>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-ink">
                      {selectedServiceRecords.length > 0 ? `${selectedServiceRecords.length} service${selectedServiceRecords.length === 1 ? '' : 's'} ready` : 'No services selected yet'}
                    </h3>
                  </div>
                  <Link href="/services" className="rounded-full border border-line bg-[#141414] px-4 py-2 text-xs font-bold text-white transition hover:border-burgundyAccent hover:bg-burgundy/10">
                    Edit Services
                  </Link>
                </div>
                {selectedServiceRecords.length > 0 ? (
                  <ul className="mt-3 grid gap-2 text-sm text-ink/75 sm:grid-cols-2">
                    {activePricingBreakdown?.serviceLines.map((line) => (
                      <li key={line.service.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-[#141414] px-3 py-2">
                        <span>{line.service.name}</span>
                        <span className="font-semibold text-white">
                          {line.discountAmount > 0 ? (
                            <span className="mr-2 text-xs text-ink/45 line-through">{formatCurrency(line.originalPrice)}</span>
                          ) : null}
                          {formatCurrency(line.finalPrice)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink/65">
                    Choose a package or add-on on the Services page before scheduling so the estimate and Cal.com metadata stay accurate
                  </p>
                )}
                {activePricingBreakdown?.savingsLines.map((line) => (
                  <p key={line.id} className="mt-3 rounded-lg border border-burgundy/35 bg-burgundy/10 px-3 py-2 text-sm font-semibold text-white">
                    {line.label} -{formatCurrency(line.amount)}
                  </p>
                ))}
                {activePricingBreakdown?.suggestion ? (
                  <div className="mt-3 rounded-lg border border-burgundy/35 bg-burgundy/10 px-3 py-3">
                    <p className="text-sm font-semibold text-ink">{activePricingBreakdown.suggestion.title}</p>
                    <p className="mt-1 text-xs text-ink/70">{activePricingBreakdown.suggestion.detail}</p>
                    <button
                      type="button"
                      onClick={() => applyActiveSavingsSuggestion(activePricingBreakdown.suggestion?.serviceIds ?? [])}
                      className="mt-2 rounded-full bg-burgundy px-4 py-2 text-xs font-bold text-white transition hover:bg-burgundyAccent"
                    >
                      {activePricingBreakdown.suggestion.actionLabel}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-ink/75">
                  Full Name *
                  <input
                    value={form.fullName}
                    onChange={(event) => updateCustomerField('fullName', event.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={fieldErrors.fullName ? 'booking-full-name-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.fullName ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="John Doe"
                  />
                  {fieldErrors.fullName ? <span id="booking-full-name-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.fullName}</span> : null}
                </label>
                <label className="text-sm font-semibold text-ink/75">
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateCustomerField('email', event.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'booking-email-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.email ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="john@example.com"
                  />
                  {fieldErrors.email ? <span id="booking-email-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.email}</span> : null}
                </label>
                <label className="text-sm font-semibold text-ink/75">
                  Phone *
                  <input
                    value={form.phone}
                    onChange={(event) => updateCustomerField('phone', event.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'booking-phone-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.phone ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {fieldErrors.phone ? <span id="booking-phone-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.phone}</span> : null}
                </label>
                <label className="text-sm font-semibold text-ink/75">
                  ZIP Code *
                  <input
                    value={form.zipCode}
                    onChange={(event) => updateCustomerField('zipCode', normalizeZipCode(event.target.value))}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.zipCode)}
                    aria-describedby={[
                      fieldErrors.zipCode ? 'booking-zip-code-error' : '',
                      showServiceAreaQuoteHelp ? 'booking-service-area-quote-help' : '',
                    ].filter(Boolean).join(' ') || undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.zipCode ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="90210"
                  />
                  {fieldErrors.zipCode ? <span id="booking-zip-code-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.zipCode}</span> : null}
                  {showServiceAreaQuoteHelp ? (
                    <span
                      id="booking-service-area-quote-help"
                      className="mt-2 block rounded-lg border border-burgundy/50 bg-burgundy/10 p-3 text-xs font-medium text-ink"
                    >
                      This ZIP is not in the standard online booking area ({getServiceAreaZipSummary()}){' '}
                      <Link href="/quote" className="font-bold text-burgundyAccent underline underline-offset-4">
                        Ask for a quote
                      </Link>{' '}
                      so travel and scheduling can be reviewed
                    </span>
                  ) : null}
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm font-semibold text-ink/75">
                  Year
                  <input
                    value={activeVehicle?.year ?? ''}
                    onChange={(event) => updateActiveVehicleField('year', event.target.value)}
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.year)}
                    aria-describedby={fieldErrors.year ? 'booking-vehicle-year-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.year ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="2020"
                  />
                  {fieldErrors.year ? <span id="booking-vehicle-year-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.year}</span> : null}
                </label>
                <label className="text-sm font-semibold text-ink/75">
                  Make
                  <input
                    value={activeVehicle?.make ?? ''}
                    onChange={(event) => updateActiveVehicleField('make', event.target.value)}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.make)}
                    aria-describedby={fieldErrors.make ? 'booking-vehicle-make-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.make ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="Toyota"
                  />
                  {fieldErrors.make ? <span id="booking-vehicle-make-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.make}</span> : null}
                </label>
                <label className="text-sm font-semibold text-ink/75">
                  Model
                  <input
                    value={activeVehicle?.model ?? ''}
                    onChange={(event) => updateActiveVehicleField('model', event.target.value)}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.model)}
                    aria-describedby={fieldErrors.model ? 'booking-vehicle-model-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.model ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="Camry"
                  />
                  {fieldErrors.model ? <span id="booking-vehicle-model-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.model}</span> : null}
                </label>
                <label className="text-sm font-semibold text-ink/75">
                  Color
                  <input
                    value={activeVehicle?.color ?? ''}
                    onChange={(event) => updateActiveVehicleField('color', event.target.value)}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.color)}
                    aria-describedby={fieldErrors.color ? 'booking-vehicle-color-error' : undefined}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 transition duration-300 focus:outline-none ${
                      fieldErrors.color ? 'border-charcoal focus:border-charcoal' : 'border-black/15 focus:border-fog'
                    }`}
                    placeholder="Silver"
                  />
                  {fieldErrors.color ? <span id="booking-vehicle-color-error" className="a11y-error mt-1 block text-xs font-medium">{fieldErrors.color}</span> : null}
                </label>
              </div>

              <div className="space-y-2">
                  <label className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm text-ink/80 ${
                    fieldErrors.acceptedConsent ? 'border border-burgundyAccent bg-burgundy/15' : 'border border-line bg-[#141414]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.acceptedConsent}
                      onChange={(event) => updateCustomerField('acceptedConsent', event.target.checked)}
                      className="mt-1"
                    />
                    <span>I reviewed the booking terms and policies and agree to be contacted for scheduling updates</span>
                  </label>
                  {fieldErrors.acceptedConsent ? <p className="a11y-error text-xs font-medium">{fieldErrors.acceptedConsent}</p> : null}

                  <label className="flex items-start gap-2 rounded-lg border border-line bg-[#141414] px-3 py-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={form.sendEmailConfirmation}
                      onChange={(event) => updateCustomerField('sendEmailConfirmation', event.target.checked)}
                      className="mt-1"
                    />
                    <span>I agree to receive booking confirmations and service-related emails</span>
                  </label>

                  <label className="flex items-start gap-2 rounded-lg border border-line bg-[#141414] px-3 py-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={form.sendSmsConfirmation}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        updateCustomerField('sendSmsConfirmation', checked);
                        if (!checked) {
                          updateCustomerField('acceptedSmsConsent', false);
                        }
                      }}
                      className="mt-1"
                    />
                    <span>
                      SMS confirmations to <span className="font-semibold text-ink">your phone number</span>
                    </span>
                  </label>
                {form.sendSmsConfirmation ? (
                  <label className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs text-ink/80 ${
                    fieldErrors.smsConsent ? 'border border-burgundyAccent bg-burgundy/15' : 'border border-burgundy/30 bg-burgundy/5'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.acceptedSmsConsent}
                      onChange={(event) => updateCustomerField('acceptedSmsConsent', event.target.checked)}
                      className="mt-0.5"
                    />
                    I agree to receive booking-related SMS confirmations Message/data rates may apply
                  </label>
                ) : null}
                {fieldErrors.confirmationChannel ? (
                  <p className="a11y-error text-xs font-medium">{fieldErrors.confirmationChannel}</p>
                ) : null}
                {fieldErrors.smsConsent ? <p className="a11y-error text-xs font-medium">{fieldErrors.smsConsent}</p> : null}
              </div>

            </section>
          ) : null}

          {step === 2 ? (
            <section className="min-h-[520px] transition-all duration-300">
              {bookingConfirmed && submittedBookingContext ? (
                <CalInlineEmbed
                  bookingId={submittedBookingContext.bookingId}
                  calLink={getCalendarBookingLink()}
                  customerName={submittedBookingContext.customer.fullName}
                  email={submittedBookingContext.customer.email}
                  phone={submittedBookingContext.customer.phone}
                  estimatedTotal={submittedBookingContext.estimatedTotal}
                  vehicleCount={submittedBookingContext.vehicleCount}
                  servicesSummary={submittedBookingContext.servicesSummary}
                  fallbackUrl={getCalendarBookingUrl()}
                />
              ) : null}
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-ink">Payment</h2>
                <p className="mt-1 text-sm text-ink/65">
                  Open secure Stripe Checkout to pay the deposit The deposit is applied toward the final service total
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm text-ink/75">
                  Deposit due now: 10% of the estimate, with a $25 minimum and $100 maximum
                </p>
              </div>
            </section>
          ) : null}
          </div>

          {step === 1 ? (
            <nav aria-label="Booking policy links" className="flex flex-wrap justify-end gap-2 text-xs font-semibold">
              <Link href="/terms" className="rounded-full border border-line bg-[#141414] px-3 py-1.5 text-white transition hover:border-burgundyAccent hover:bg-burgundy/10">
                Terms
              </Link>
              <Link href="/privacy" className="rounded-full border border-line bg-[#141414] px-3 py-1.5 text-white transition hover:border-burgundyAccent hover:bg-burgundy/10">
                Privacy
              </Link>
              <Link href="/faq" className="rounded-full border border-line bg-[#141414] px-3 py-1.5 text-white transition hover:border-burgundyAccent hover:bg-burgundy/10">
                Help
              </Link>
              <Link href="/quote" className="rounded-full border border-line bg-[#141414] px-3 py-1.5 text-white transition hover:border-burgundyAccent hover:bg-burgundy/10">
                Request a Quote
              </Link>
            </nav>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-full border border-fog px-4 py-2 text-sm font-semibold text-fog transition duration-300 hover:border-burgundyAccent hover:bg-burgundy/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <span />}

            {step === 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : step === 2 ? (
              selectedVehicles.length === 0 ? (
                <Link href="/services" className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent">
                  Select Services First
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (bookingConfirmed) {
                      goNext();
                      return;
                    }

                    void handleSubmitBooking();
                  }}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent disabled:opacity-65"
                >
                  {submitting ? 'Saving' : 'Continue'}
                </button>
              )
            ) : step === 3 ? (
              <button
                type="button"
                onClick={() => void handleCreateCheckoutSession()}
                disabled={paymentSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent"
              >
                {paymentSubmitting ? 'Opening Checkout' : 'Pay Deposit'} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span />
            )}
          </div>

          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">
              Website
              <input
                id="website"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </label>
          </div>

          {fieldErrors.serviceSelection ? <p className="a11y-error text-xs font-medium">{fieldErrors.serviceSelection}</p> : null}
          {fieldErrors.selectedVehicleDetails ? <p className="a11y-error text-xs font-medium">{fieldErrors.selectedVehicleDetails}</p> : null}
          {fieldErrors.selectedVehicleLimit ? <p className="a11y-error text-xs font-medium">{fieldErrors.selectedVehicleLimit}</p> : null}
          <p className="text-xs font-medium text-ink/60">
            {BOOKING_LIMIT_DISCLAIMER.replace(/\.$/, '')} Booking window: Monday-Saturday 8am - 6pm
          </p>

          {statusMessage ? (
            <p className={`text-sm ${
              statusMessage.toLowerCase().includes('failed')
              || statusMessage.toLowerCase().includes('required')
              || statusMessage.toLowerCase().includes('limit')
                ? 'a11y-error'
                : 'text-ink/70'
            }`}>
              {statusMessage}
            </p>
          ) : null}
        </div>

        <aside className="gray-card h-fit overflow-hidden lg:sticky lg:top-28">
          <div className="bg-[#151515] px-4 py-3 text-white">
            <h2 className="inline-flex items-center gap-2 font-heading text-xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-fog" /> Your Selection
            </h2>
          </div>
          <div className="space-y-3 p-4">
            <article className="rounded-xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">Active Vehicle</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold text-ink">
                <CarFront className="h-4 w-4 text-fog" />
                {activeVehicle ? getVehicleDisplayName(activeVehicle) : 'Vehicle'}
              </p>
              <p className="mt-1 text-xs text-ink/60">{activeVehicle ? getVehicleHint(activeVehicle) : ''}</p>
            </article>

            {selectedVehicles.length > 0 ? (
              <article className="rounded-xl border border-black/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">Booked Vehicles</p>
                <ul className="mt-2 space-y-2">
                  {selectedVehicles.map((vehicle) => (
                    <li key={vehicle.id} className="flex items-start justify-between gap-3 text-xs">
                      <span className="text-ink/75">{getBookedVehicleDetail(vehicle)}</span>
                      <span className="font-semibold text-ink">{formatCurrency(getVehicleTotal(vehicle.id))}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            {selectedPackageLine ? (
              <article className="rounded-xl border border-black/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">Package</p>
                <p className="mt-1 font-heading text-lg font-semibold text-ink">{selectedPackageLine.service.name}</p>
                <p className="mt-1 text-sm font-semibold text-charcoal">{formatCurrency(selectedPackageLine.finalPrice)}</p>
              </article>
            ) : (
              <p className="rounded-xl bg-canvas p-3 text-sm text-ink/70">Package selection is optional if you only need coating or correction work</p>
            )}

            <article className="rounded-xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">Add-Ons</p>
              {selectedPremiumLines.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {selectedPremiumLines.map((line) => (
                    <li key={line.service.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-ink/75">{line.service.name}</span>
                      <span className="font-semibold text-ink">
                        {line.discountAmount > 0 ? (
                          <span className="mr-1 text-[10px] text-ink/45 line-through">{formatCurrency(line.originalPrice)}</span>
                        ) : null}
                        {formatCurrency(line.finalPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
              <p className="mt-2 text-xs text-ink/60">No add-ons selected yet</p>
              )}
              {activePricingBreakdown?.savingsLines.map((line) => (
                <div key={line.id} className="mt-3 flex items-center justify-between rounded-lg border border-burgundy/35 bg-burgundy/10 px-3 py-2 text-xs font-semibold text-white">
                  <span>{line.label}</span>
                  <span>-{formatCurrency(line.amount)}</span>
                </div>
              ))}
              {activePricingBreakdown?.suggestion ? (
                <div className="mt-3 rounded-lg border border-burgundy/35 bg-burgundy/10 px-3 py-2">
                  <p className="text-xs font-semibold text-white">{activePricingBreakdown.suggestion.title}</p>
                  <p className="mt-1 text-xs text-ink/65">{activePricingBreakdown.suggestion.detail}</p>
                  <button
                    type="button"
                    onClick={() => applyActiveSavingsSuggestion(activePricingBreakdown.suggestion?.serviceIds ?? [])}
                    className="mt-2 rounded-full bg-burgundy px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-burgundyAccent"
                  >
                    {activePricingBreakdown.suggestion.actionLabel}
                  </button>
                </div>
              ) : null}
            </article>

            <div className="rounded-xl bg-canvas p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Vehicle Subtotal</span>
                <span className="font-heading text-2xl font-extrabold text-charcoal">
                  {formatCurrency(activeVehicle ? getVehicleTotal(activeVehicle.id) : 0)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/60">Final price confirmed on-site</p>
            </div>

            <div className="rounded-xl border border-black/10 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-ink/60">
                <span>Booking Progress</span>
                <span>Step {step} of {steps.length}</span>
              </div>
              <div className="h-2 rounded-full bg-black/10">
                <div className="h-2 rounded-full bg-ink transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%` }} />
              </div>
            </div>

            <div className="border-t border-black/10 pt-3 text-right">
              {grandPricingBreakdown.savingsTotal > 0 ? (
                <div className="mb-3 space-y-1 rounded-xl border border-burgundy/35 bg-burgundy/10 p-3 text-left">
                  {grandPricingBreakdown.savingsLines.map((line, index) => (
                    <div key={`${line.id}-${index}`} className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>{line.label}</span>
                      <span>-{formatCurrency(line.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="text-xs text-ink/60">All vehicles total</p>
              <p className="font-heading text-2xl font-extrabold text-charcoal">{formatCurrency(getGrandTotal())}</p>
            </div>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
