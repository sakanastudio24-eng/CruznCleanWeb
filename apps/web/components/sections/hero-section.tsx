'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3, MapPin, PhoneCall } from 'lucide-react';
import { VehicleSizeGuideLookup } from '@/components/vehicle/vehicle-size-guide-lookup';
import { useBooking } from '@/components/providers/booking-provider';
import type { ServiceOption, VehicleProfile, VehicleSize } from '@/lib/booking-types';
import { formatSizeAdjustmentLabel, getAdjustedServicePrice } from '@/lib/pricing';
import { getPackageServices } from '@/lib/services-catalog';
import { SITE_PROFILE } from '@/lib/site-profile';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { getVehicleDisplayName, isVehicleGuideSizeLocked, needsManualVehicleSize } from '@/lib/vehicle-utils';
import heroImage from '../../../../photo_refrences/Full Exterior Detail.jpg';

const VEHICLE_SIZE_OPTIONS: Array<{ id: VehicleSize; label: string; hint: string }> = [
  { id: 'sedan_coupe', label: 'Sedan / Coupe', hint: 'Base listed pricing' },
  { id: 'small_suv_truck', label: 'Small SUV / Truck', hint: '+20% by size' },
  { id: 'large_suv_truck', label: 'Large SUV / Truck', hint: '+40% by size' },
];

const SIZE_LABELS: Record<VehicleSize, string> = {
  sedan_coupe: 'Sedan / Coupe',
  small_suv_truck: 'Small SUV / Truck',
  large_suv_truck: 'Large SUV / Truck',
  oversized: 'Oversized',
};

/**
 * Formats whole-dollar package prices for compact finder cards.
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(0)}`;
}

/**
 * Keeps vehicle text natural while stripping non-vehicle characters.
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
 * Resolves the one active package ID for the current vehicle.
 */
function getSelectedPackageId(vehicle: VehicleProfile | undefined): string | undefined {
  return vehicle?.serviceIds.find((serviceId) => serviceId.startsWith('pkg-'));
}

/**
 * Returns the displayed selected package or falls back to the catalog base row.
 */
function getSelectedPackage(packages: ServiceOption[], packageId: string | undefined): ServiceOption | undefined {
  return packages.find((service) => service.id === packageId);
}

/**
 * Renders an editorial, image-led hero with quick booking setup and location cues.
 */
export function HeroSection(): JSX.Element {
  const packages = getPackageServices();
  const { vehicles, activeVehicleId, setActiveVehicleId, updateVehicle, toggleVehiclePackage } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0];
  const selectedPackageId = getSelectedPackageId(activeVehicle);
  const selectedPackage = getSelectedPackage(packages, selectedPackageId);
  const vehicleNeedsSize = activeVehicle ? needsManualVehicleSize(activeVehicle) : false;
  const customVehicleNeedsSize = Boolean(activeVehicle?.customLabel?.trim() && vehicleNeedsSize);
  const vehicleHasStarterDetails = activeVehicle
    ? Boolean(activeVehicle.customLabel?.trim() || activeVehicle.make.trim() || activeVehicle.model.trim() || activeVehicle.sizeSource)
    : false;
  const canPickPackage = Boolean(activeVehicle && vehicleHasStarterDetails && !vehicleNeedsSize);
  const continueHref = selectedPackageId && !vehicleNeedsSize ? '/booking' : '/services';

  /**
   * Applies a guide match to the active booking vehicle.
   */
  function applyLookupMatch(match: { make: string; model: string; size: VehicleSize }): void {
    if (!activeVehicle) {
      return;
    }

    setActiveVehicleId(activeVehicle.id);
    updateVehicle(activeVehicle.id, {
      make: match.make,
      model: match.model,
      size: match.size,
      sizeSource: 'guide',
      customLabel: undefined,
    });
  }

  /**
   * Applies typed vehicle details and asks the customer to choose a size tier.
   */
  function applyTypedVehicle(details: { label: string; year?: string; make?: string; model?: string }): void {
    if (!activeVehicle) {
      return;
    }

    setActiveVehicleId(activeVehicle.id);
    updateVehicle(activeVehicle.id, {
      year: details.year ? sanitizeVehicleYearInput(details.year) : '',
      make: details.make ? sanitizeVehicleTextInput(details.make) : '',
      model: details.model ?? '',
      customLabel: details.label,
      sizeSource: null,
    });
  }

  /**
   * Stores a manually selected size category for unlisted or custom vehicles.
   */
  function selectVehicleSize(size: VehicleSize): void {
    if (!activeVehicle) {
      return;
    }

    setActiveVehicleId(activeVehicle.id);
    updateVehicle(activeVehicle.id, { size, sizeSource: 'manual' });
  }

  /**
   * Toggles one package in the shared cart/booking state.
   */
  function handlePackageSelect(serviceId: string): void {
    if (!activeVehicle || !canPickPackage) {
      return;
    }

    setActiveVehicleId(activeVehicle.id);
    toggleVehiclePackage(activeVehicle.id, serviceId);
    const service = packages.find((packageService) => packageService.id === serviceId);
    trackAnalyticsEvent('select_service', {
      page: '/',
      location: 'hero_package_picker',
      service_interest: 'package',
      service_name: service?.name,
      currency: 'USD',
      value: service ? getAdjustedServicePrice(service.price, activeVehicle.size) : undefined,
    });
  }

  return (
    <section className="landing-hero relative overflow-hidden bg-ink text-white">
      <Image
        src={heroImage}
        alt="Cruizn Clean exterior detail finish"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.68)_42%,rgba(0,0,0,0.38)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.18),transparent_34%)]" />

      <div className="relative mx-auto flex min-h-[calc(100svh-var(--site-header-height))] w-full max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-12">
          <div className="fade-in-up max-w-3xl lg:mx-auto lg:w-full lg:max-w-[560px] xl:max-w-[600px]">
            <h1 className="font-heading text-5xl font-extrabold leading-[0.92] sm:text-6xl lg:text-6xl xl:text-7xl">
              Transparent detailing without the guesswork
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/82 sm:text-xl">
              A cleaner booking experience for Yorba Linda and nearby Orange County clients who want transparent pricing, polished results, and real quotes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/booking"
                onClick={() => trackAnalyticsEvent('click_book_now', { page: '/', location: 'hero' })}
                className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-burgundyAccent"
              >
                Book an Appointment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={SITE_PROFILE.phoneHref}
                onClick={() => trackAnalyticsEvent('click_call', { page: '/', location: 'hero' })}
                className="inline-flex items-center gap-2 rounded-full border border-burgundy px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundy/10"
              >
                <PhoneCall className="h-4 w-4" />
                {SITE_PROFILE.phoneDisplay}
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Location</p>
                <div className="mt-1 flex items-start gap-2 text-sm font-semibold text-white">
                  <MapPin className="h-4 w-4 text-fog" />
                  <span className="sr-only">
                    Available service areas include Yorba Linda, Placentia, Fullerton, Anaheim, Brea, Orange, La Habra, Buena Park, Cypress, Irvine, Huntington Beach, Costa Mesa, Tustin, Garden Grove, and Santa Ana
                  </span>
                  <span aria-hidden="true" className="leading-tight text-white/90">Yorba Linda + nearby OC</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Availability</p>
                <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-white">
                  <Clock3 className="h-4 w-4 text-fog" />
                  <span>
                    Mon-Sat
                    <span className="block text-white/85">8am-6pm</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <aside className="fade-in-up w-full rounded-[28px] border border-line bg-[#141414]/82 p-4 backdrop-blur-md sm:p-5 lg:mx-auto lg:max-w-[600px] lg:p-6 xl:max-w-[620px]">
            <h2 className="font-heading text-3xl font-bold leading-tight text-white">Start with your vehicle</h2>

            <div className="mt-4 space-y-4">
              <div className="space-y-4">
                {activeVehicle ? (
                  <VehicleSizeGuideLookup
                    activeVehicle={activeVehicle}
                    includeOversized={false}
                    onApplyLookupMatch={applyLookupMatch}
                    onApplyTypedVehicle={applyTypedVehicle}
                    className="gray-card"
                  />
                ) : null}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Closest Size Category</p>
                  {customVehicleNeedsSize ? (
                    <p className="mt-2 rounded-xl border border-burgundyAccent/55 bg-burgundy/20 px-3 py-2 text-xs font-bold text-white">
                      Please select a car size.
                    </p>
                  ) : null}
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {VEHICLE_SIZE_OPTIONS.map((option) => {
                      const selected = activeVehicle?.size === option.id && (activeVehicle.sizeSource === 'manual' || isVehicleGuideSizeLocked(activeVehicle));
                      const sizeLocked = activeVehicle ? isVehicleGuideSizeLocked(activeVehicle) : false;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => selectVehicleSize(option.id)}
                          disabled={sizeLocked}
                          aria-pressed={selected}
                          className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm transition sm:min-h-20 md:min-h-14 ${
                            selected
                              ? 'border-burgundyAccent bg-burgundy/30 text-white'
                              : 'border-white/10 bg-white/5 text-white/85 hover:border-burgundyAccent/45 hover:bg-burgundy/10'
                          } ${sizeLocked ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                          <span className="block font-semibold">{option.label}</span>
                          <span className="mt-1 hidden text-xs text-white/70 sm:block">{option.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                  {vehicleNeedsSize ? (
                    <p className="mt-3 rounded-xl border border-burgundy/35 bg-burgundy/10 px-3 py-2 text-xs font-semibold text-white">
                      Vehicle not listed yet? Choose the closest size category to continue.
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-white/75">
                    For lifted, modified, or specialty vehicles, final pricing may be confirmed after inspection.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Step 2 • Package</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {packages.map((service) => {
                    const selected = selectedPackageId === service.id;
                    const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        disabled={!canPickPackage}
                        onClick={() => handlePackageSelect(service.id)}
                        aria-pressed={selected}
                        className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                          selected
                            ? 'border-burgundyAccent bg-burgundy/30 text-white'
                            : 'border-white/10 bg-white/5 text-white/85'
                        } ${canPickPackage ? 'hover:border-burgundyAccent/45 hover:bg-burgundy/10' : 'cursor-not-allowed opacity-45'}`}
                      >
                        <span>
                          <span className="block font-semibold">{service.name}</span>
                        </span>
                        <span className="shrink-0 text-right md:text-left">
                          <span className="block text-sm font-bold">{formatCurrency(adjustedPrice)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.44fr)] md:items-stretch">
                <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-xs text-white/70">
                  {activeVehicle && vehicleHasStarterDetails ? (
                    <>
                      Vehicle: <span className="font-semibold text-white">{getVehicleDisplayName(activeVehicle)}</span>
                      <span className="block pt-1">
                        Size: <span className="font-semibold text-white">{SIZE_LABELS[activeVehicle.size]}</span>
                        <span className="text-white/70"> ({formatSizeAdjustmentLabel(activeVehicle.size)})</span>
                      </span>
                      {selectedPackage && !vehicleNeedsSize ? (
                        <>
                          <span className="block pt-1">
                            Package: <span className="font-semibold text-white">{selectedPackage.name}</span>
                          </span>
                          <span className="block pt-1">
                            Estimated package price:{' '}
                            <span className="font-semibold text-white">
                              {formatCurrency(getAdjustedServicePrice(selectedPackage.price, activeVehicle.size))}
                            </span>
                          </span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    'Pick a vehicle or closest size category first, then choose the package that fits the job.'
                  )}
                </div>

                <div className="space-y-2">
                  <Link
                    href={continueHref}
                    className="flex items-center justify-center gap-2 rounded-full bg-burgundy px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent"
                  >
                    {selectedPackageId && !vehicleNeedsSize ? 'Continue to Booking' : 'Build Service Plan'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/faq"
                    className="flex items-center justify-center gap-2 rounded-full border border-burgundy bg-white/5 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundy/10"
                  >
                    Need Help First?
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
