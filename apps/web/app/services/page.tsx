'use client';

import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { type KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronUp, Clock3, Droplets, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react';

import { VehicleDock } from '@/components/dock/vehicle-dock';
import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import { VehicleSizeGuideLookup } from '@/components/vehicle/vehicle-size-guide-lookup';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { MAX_BOOKED_VEHICLES_PER_DAY } from '@/lib/booking-policy';
import type { ServiceCategory, ServiceOption, VehicleProfile, VehicleSize } from '@/lib/booking-types';
import { formatSizeAdjustmentLabel, getAdjustedServicePrice, getServiceSavingsTags } from '@/lib/pricing';
import { findServiceById, getCorrectionServices, getPackageServices, getProtectionServices } from '@/lib/services-catalog';
import { VEHICLE_SIZE_GUIDE, searchVehicleGuide, type VehicleGuideEntry } from '@/lib/vehicle-size-guide';
import { getVehicleDisplayName, isVehicleGuideSizeLocked, needsManualVehicleSize } from '@/lib/vehicle-utils';
import basicExteriorDetail from '../../../../photo_refrences/Basic Exterior Detail.jpg';
import basicInteriorDetail from '../../../../photo_refrences/Basic Interior Detail.jpg';
import fullExteriorDetail from '../../../../photo_refrences/Full Exterior Detail.jpg';
import fullInteriorDetail from '../../../../photo_refrences/Full Interior Detail.jpg';
import spotlessShine from '../../../../photo_refrences/Spotless Shine.jpg';

interface VehicleSizeOption {
  id: VehicleSize;
  label: string;
  hint: string;
}

/**
 * Returns standard vehicle options shown directly on the services page.
 */
function getStandardVehicleOptions(): VehicleSizeOption[] {
  return [
    { id: 'sedan_coupe', label: 'Sedan / Coupe', hint: 'Base listed pricing' },
    { id: 'small_suv_truck', label: 'Small SUV / Truck', hint: '+20% pricing adjustment' },
    { id: 'large_suv_truck', label: 'Large SUV / Truck', hint: '+40% pricing adjustment' },
  ];
}

/**
 * Returns a readable pricing context for the active vehicle.
 */
function getActiveVehiclePricingLabel(activeVehicle: VehicleProfile): string {
  return `${getVehicleDisplayName(activeVehicle)}: ${activeVehicle.size.replaceAll('_', ' ').toUpperCase()} • ${formatSizeAdjustmentLabel(activeVehicle.size)}`;
}

/**
 * Formats numeric totals into whole-dollar currency strings.
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(0)}`;
}

/**
 * Keeps make input to text-style characters while preserving natural names.
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
 * Resolves whether a services-page size card should read as selected.
 */
function isVehicleSizeSelected(vehicle: VehicleProfile, size: VehicleSize): boolean {
  if (vehicle.size !== size) {
    return false;
  }

  return isVehicleGuideSizeLocked(vehicle) || vehicle.sizeSource === 'manual';
}

/**
 * Returns a stable section title for one service category.
 */
function getSectionTitle(category: ServiceCategory): string {
  if (category === 'package') {
    return 'Detail Packages';
  }

  if (category === 'protection') {
    return 'Protection + Coatings';
  }

  return 'Paint Correction';
}

/**
 * Returns services for one category without leaking page-level selection logic.
 */
function getServicesForCategory(category: ServiceCategory): ServiceOption[] {
  if (category === 'package') {
    return getPackageServices();
  }

  if (category === 'protection') {
    return getProtectionServices();
  }

  return getCorrectionServices();
}

const PACKAGE_COPY: Partial<Record<string, string>> = {
  'pkg-mini': 'A quick cleanup for vehicles that need a simple refresh, not a full detail.',
  'pkg-maintenance': 'A dependable inside-and-out clean for vehicles that are already maintained.',
  'pkg-full-interior': 'A deeper interior reset for seats, carpets, touchpoints, odor, and the areas that need extra attention.',
  'pkg-full-exterior': 'A full exterior cleanup with decontamination, gloss enhancement, and longer-lasting protection.',
  'pkg-full-reset': 'The full inside-and-out reset for vehicles that need the complete treatment.',
};

const PACKAGE_IMAGES: Partial<Record<string, StaticImageData>> = {
  'pkg-mini': basicExteriorDetail,
  'pkg-maintenance': spotlessShine,
  'pkg-full-interior': fullInteriorDetail,
  'pkg-full-exterior': fullExteriorDetail,
  'pkg-full-reset': basicInteriorDetail,
};

const CORRECTION_IMAGES: Partial<Record<string, StaticImageData>> = {
  'corr-1-step': fullExteriorDetail,
  'corr-2-step': spotlessShine,
  'corr-3-step': basicExteriorDetail,
};

const POPULAR_VEHICLES: Array<VehicleGuideEntry & { label: string }> = [
  { label: 'BMW X5', make: 'BMW', model: 'X5', size: 'large_suv_truck' },
  { label: 'Tesla Model Y', make: 'Tesla', model: 'Model Y', size: 'small_suv_truck' },
  { label: 'Ford F-150', make: 'Ford', model: 'F-150', size: 'large_suv_truck' },
  { label: 'Honda Civic', make: 'Honda', model: 'Civic', size: 'sedan_coupe' },
];

const PACKAGE_HELPER_SERVICE_IDS: Partial<Record<string, string[]>> = {
  'pkg-mini': ['corr-1-step', 'coat-glass-basic', 'coat-wheel-face'],
  'pkg-maintenance': ['coat-ceramic-3y', 'coat-glass-basic', 'coat-wheel-face'],
  'pkg-full-interior': ['pkg-full-exterior', 'coat-glass-basic', 'coat-wheel-face'],
  'pkg-full-exterior': ['pkg-full-interior', 'coat-ceramic-3y', 'coat-glass-basic'],
  'pkg-full-reset': ['coat-ceramic-3y', 'coat-glass-basic', 'coat-wheel-face'],
};

/**
 * Converts free-form typed vehicle text into existing vehicle profile fields.
 */
function parseTypedVehicleDetails(value: string): { label: string; year?: string; make?: string; model?: string } | null {
  const cleanedValue = value.replace(/[^a-zA-Z0-9\s.'+-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanedValue) {
    return null;
  }

  const parts = cleanedValue.split(' ');
  const yearIndex = parts.findIndex((part) => /^(19|20)\d{2}$/.test(part));
  const year = yearIndex >= 0 ? parts[yearIndex] : undefined;
  const vehicleParts = yearIndex >= 0 ? parts.filter((_, index) => index !== yearIndex) : parts;

  if (vehicleParts.length === 0) {
    return null;
  }

  return {
    label: cleanedValue,
    year,
    make: vehicleParts[0],
    model: vehicleParts.slice(1).join(' ') || undefined,
  };
}

/**
 * Returns customer-friendly service copy without changing catalog pricing.
 */
function getServiceDescription(service: ServiceOption): string {
  return PACKAGE_COPY[service.id] ?? service.description;
}

/**
 * Resolves button copy for selected and unselected services.
 */
function getServiceActionLabel(category: ServiceCategory, selected: boolean): string {
  if (category === 'package') {
    return selected ? 'Selected' : 'Choose package';
  }

  return selected ? 'Remove add-on' : 'Add service';
}

/**
 * Keeps mobile correction labels compact without changing catalog names.
 */
function getMobileServiceName(service: ServiceOption): string {
  return service.category === 'correction' ? service.name.replace(' Paint ', ' ') : service.name;
}

/**
 * Presents a compact mobile vehicle lookup without changing pricing rules.
 */
function MobileVehicleLookup(): JSX.Element {
  const { vehicles, activeVehicleId, setActiveVehicleId, addVehicle, updateVehicle, getVehicleServices } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const options = getStandardVehicleOptions();
  const [query, setQuery] = useState('');
  const [lookupOpen, setLookupOpen] = useState(false);
  const canAddVehicle = vehicles.length < MAX_BOOKED_VEHICLES_PER_DAY;
  const vehicleSlots = Array.from({ length: MAX_BOOKED_VEHICLES_PER_DAY }, (_, index) => vehicles[index]);
  const typedVehicleDetails = parseTypedVehicleDetails(query);
  const canUseCustomVehicle = Boolean(typedVehicleDetails);

  const lookupResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return searchVehicleGuide(query)
      .filter((entry) => entry.size !== 'oversized')
      .slice(0, 5);
  }, [query]);

  if (!activeVehicle) {
    return <></>;
  }

  const lookupVehicleId = activeVehicle.id;

  function handleEmptyVehicleSlot(): void {
    if (canAddVehicle) {
      addVehicle();
    }
  }

  function applyVehicle(entry: VehicleGuideEntry, source: 'guide' | 'popular' = 'guide'): void {
    updateVehicle(lookupVehicleId, {
      make: sanitizeVehicleTextInput(entry.make),
      model: entry.model,
      year: '',
      size: entry.size,
      sizeSource: source === 'guide' && VEHICLE_SIZE_GUIDE.some((item) => item.make === entry.make && item.model === entry.model)
        ? 'guide'
        : 'manual',
      customLabel: undefined,
    });
    setQuery(`${entry.make} ${entry.model}`);
    setLookupOpen(false);
  }

  function applyCustomVehicle(): void {
    if (!typedVehicleDetails) {
      return;
    }

    updateVehicle(lookupVehicleId, {
      year: typedVehicleDetails.year ? sanitizeVehicleYearInput(typedVehicleDetails.year) : '',
      make: typedVehicleDetails.make ? sanitizeVehicleTextInput(typedVehicleDetails.make) : '',
      model: typedVehicleDetails.model ? sanitizeVehicleTextInput(typedVehicleDetails.model) : '',
      customLabel: typedVehicleDetails.label,
      sizeSource: null,
    });
    setQuery(typedVehicleDetails.label);
    setLookupOpen(false);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    if (lookupResults.length === 1) {
      applyVehicle(lookupResults[0]);
      return;
    }

    applyCustomVehicle();
  }

  return (
    <section id="mobile-vehicle-lookup" className="mx-auto w-full max-w-xl rounded-2xl border border-[#272727] bg-[linear-gradient(135deg,#151515,#0d0d0d)] p-3 shadow-[0_16px_38px_rgba(0,0,0,0.28)] ring-1 ring-burgundy/10 md:max-w-3xl md:p-4 lg:hidden">
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-white shadow-[0_0_0_1px_rgb(255_255_255_/_0.08)]">
          <Search className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/52">Vehicle Lookup</p>
              <h2 className="mt-1 truncate font-heading text-lg font-bold leading-tight text-white">{getVehicleDisplayName(activeVehicle)}</h2>
              <p className="mt-0.5 text-xs font-semibold text-white/58">{formatSizeAdjustmentLabel(activeVehicle.size)}</p>
            </div>
          </div>

          <label className="sr-only" htmlFor="mobile-vehicle-search">Search make, model, or year</label>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
            <input
              id="mobile-vehicle-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLookupOpen(true);
              }}
              onFocus={() => setLookupOpen(Boolean(query.trim()))}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search make, model, year"
              className="gray-field h-11 w-full rounded-xl border-[#303030] bg-white/[0.055] pl-9 pr-3 text-sm focus:border-burgundyAccent"
            />
            {lookupOpen && lookupResults.length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-52 overflow-y-auto rounded-xl border border-line bg-[#141414] p-1.5 shadow-2xl">
                {lookupResults.map((entry) => (
                  <button
                    key={`${entry.make}-${entry.model}`}
                    type="button"
                    onClick={() => applyVehicle(entry)}
                    className="flex min-h-10 w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-burgundy/12"
                  >
                    <span className="font-semibold text-white">{entry.make} {entry.model}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/52">{entry.size.replaceAll('_', ' ')}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {lookupOpen && canUseCustomVehicle ? (
            <button
              type="button"
              onClick={applyCustomVehicle}
              className="mt-2 inline-flex min-h-9 items-center justify-center rounded-lg border border-burgundy/65 bg-[#171717] px-3 text-xs font-bold text-white transition hover:border-burgundyAccent hover:bg-burgundy/20"
            >
              Use custom vehicle
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-burgundy/20 pt-3 min-[430px]:grid-cols-4">
        {vehicleSlots.map((vehicle, index) => {
          const active = vehicle?.id === activeVehicleId;
          const serviceCount = vehicle ? getVehicleServices(vehicle.id).length : 0;

          return vehicle ? (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setActiveVehicleId(vehicle.id)}
              aria-pressed={active}
              className={`min-h-[58px] rounded-xl border px-2.5 py-2 text-left transition ${
                active
                  ? 'border-burgundyAccent bg-burgundy/30 shadow-[0_0_0_1px_rgb(140_28_44_/_0.38)]'
                  : 'border-white/10 bg-black/20 hover:border-burgundyAccent/45 hover:bg-burgundy/10'
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-white/48">Vehicle {index + 1}</span>
              <span className="mt-1 block truncate text-xs font-bold text-white">{getVehicleDisplayName(vehicle)}</span>
              <span className="mt-0.5 block text-[10px] font-semibold text-white/55">{serviceCount} item{serviceCount === 1 ? '' : 's'}</span>
            </button>
          ) : (
            <button
              key={`empty-vehicle-${index}`}
              type="button"
              onClick={handleEmptyVehicleSlot}
              disabled={!canAddVehicle}
              className="min-h-[58px] rounded-xl border border-dashed border-burgundy/45 bg-black/18 px-2.5 py-2 text-left text-white/60 transition hover:border-burgundyAccent hover:bg-burgundy/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-white/38">Slot {index + 1}</span>
              <span className="mt-1 block text-xs font-bold text-white/78">Add vehicle</span>
              <span className="mt-0.5 block text-[10px] font-semibold text-white/45">Available</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {POPULAR_VEHICLES.map((vehicle) => (
          <button
            key={vehicle.label}
            type="button"
            onClick={() => applyVehicle(vehicle, 'popular')}
            className="min-h-9 shrink-0 rounded-full border border-white/12 bg-white/[0.06] px-3 text-xs font-semibold text-white/78 transition hover:border-burgundyAccent/50 hover:bg-burgundy/12"
          >
            {vehicle.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-white/10 pt-3 min-[390px]:grid-cols-3 md:grid-cols-3">
        {options.map((option) => {
          const selected = isVehicleSizeSelected(activeVehicle, option.id);
          const sizeLocked = isVehicleGuideSizeLocked(activeVehicle);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateVehicle(activeVehicle.id, { size: option.id, sizeSource: 'manual' })}
              disabled={sizeLocked}
              aria-pressed={selected}
              className={`min-h-11 rounded-xl border px-2 py-2 text-left text-[11px] font-bold leading-tight transition md:px-3 md:text-sm ${
                selected
                  ? 'border-burgundyAccent bg-burgundy text-white'
                  : 'border-white/12 bg-white/[0.05] text-white/72 hover:border-burgundyAccent/45 hover:bg-burgundy/10'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {option.label.replace(' / ', ' / ')}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Shows a lightweight mobile step rail inspired by the booking flow reference.
 */
function MobileServiceSteps(): JSX.Element {
  const { getSelectedServiceCount } = useBooking();
  const hasSelections = getSelectedServiceCount() > 0;
  const steps = [
    { id: '1', label: 'Pick your vehicle', state: 'complete' },
    { id: '2', label: 'Pick a service', state: hasSelections ? 'complete' : 'active' },
    { id: '3', label: 'Continue to booking', state: hasSelections ? 'active' : 'upcoming' },
  ];

  return (
    <nav className="mx-auto grid w-full max-w-xl grid-cols-3 items-start gap-1.5 rounded-2xl border border-white/10 bg-[#101010] px-2 py-3 md:max-w-3xl md:gap-3 md:px-4 lg:hidden" aria-label="Booking steps">
      {steps.map((step) => (
        <div key={step.id} className="relative min-w-0 text-center">
          <span className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold md:h-10 md:w-10 md:text-sm ${
            step.state === 'active'
              ? 'border-burgundyAccent bg-burgundy text-white shadow-[0_0_0_3px_rgb(140_28_44_/_0.18)]'
              : step.state === 'complete'
                ? 'border-burgundyAccent/70 bg-burgundy/30 text-white'
                : 'border-white/18 bg-[#141414] text-white/60'
          }`}>
            {step.state === 'complete' ? <Check className="h-4 w-4" /> : step.id}
          </span>
          <span className={`mx-auto mt-2 block max-w-[6.3rem] text-[10px] font-bold leading-[1.15] min-[390px]:text-[11px] md:max-w-none md:text-xs ${
            step.state === 'active' ? 'text-burgundyAccent' : step.state === 'complete' ? 'text-white/76' : 'text-white/48'
          }`}>
            {step.label}
          </span>
        </div>
      ))}
    </nav>
  );
}

/**
 * Renders one service category grid with active-vehicle size-adjusted pricing.
 */
function ServiceGrid({
  category,
  title,
  gridClassName = 'grid gap-4 sm:grid-cols-2',
  framed = true,
}: {
  category: ServiceCategory;
  title?: string;
  gridClassName?: string;
  framed?: boolean;
}): JSX.Element {
  const { vehicles, activeVehicleId, toggleVehiclePackage, toggleServiceForVehicle, getVehicleServices } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const services = useMemo(() => getServicesForCategory(category), [category]);
  const selectedIds = getVehicleServices(activeVehicleId).map((service) => service.id);
  const isPackageGrid = category === 'package';

  /**
   * Handles package replacement or toggle behavior for one card interaction.
   */
  function handleSelect(service: ServiceOption): void {
    if (category === 'package') {
      toggleVehiclePackage(activeVehicleId, service.id);
    } else {
      toggleServiceForVehicle(activeVehicleId, service);
    }

    trackAnalyticsEvent('select_service', {
      page: '/services',
      location: 'services_grid',
      service_interest: category,
      service_name: service.name,
      currency: 'USD',
      value: activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price,
    });
  }

  const content = (
    <>
      <div className="mb-3 flex min-w-0 items-end justify-between gap-3 md:mb-4">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold text-ink md:text-2xl">{title ?? getSectionTitle(category)}</h2>
          {activeVehicle ? (
            <p className="mt-1 text-xs font-semibold text-ink/60">
              {getActiveVehiclePricingLabel(activeVehicle)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="lg:hidden">
        {isPackageGrid ? (
          <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {services.map((service) => {
              const selected = selectedIds.includes(service.id);
              const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
              const isBestValue = service.id === 'pkg-maintenance';
              const packageImage = PACKAGE_IMAGES[service.id];
              const visibleHighlights = service.highlights.slice(0, 2);

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleSelect(service)}
                  aria-pressed={selected}
                  aria-label={`${getServiceActionLabel(category, selected)}: ${service.name}`}
                  className={`group grid min-h-[146px] w-full grid-cols-[106px_minmax(0,1fr)] overflow-hidden rounded-xl border text-left transition min-[390px]:grid-cols-[114px_minmax(0,1fr)] min-[430px]:min-h-[154px] md:min-h-[168px] md:grid-cols-[128px_minmax(0,1fr)] ${
                    selected
                      ? 'border-burgundyAccent bg-burgundy/20 shadow-[0_0_0_1px_rgb(140_28_44_/_0.55),0_16px_34px_rgb(0_0_0_/_0.32)]'
                      : 'border-line bg-[#141414] hover:border-burgundyAccent/40 hover:bg-burgundy/10'
                  }`}
                >
                  <div className="relative min-h-full bg-black/40">
                    {packageImage ? (
                      <Image
                        src={packageImage}
                        alt=""
                        fill
                        className="object-cover opacity-80"
                        sizes="112px"
                        priority={service.id === 'pkg-mini' || service.id === 'pkg-maintenance'}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/45" />
                  </div>

                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 p-3 md:p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isBestValue ? (
                          <span className="rounded-md bg-burgundy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                            Most Popular
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 font-heading text-base font-bold leading-tight text-white min-[390px]:text-lg">{service.name}</h3>
                      <p className="mt-1 line-clamp-3 text-xs leading-4 text-white/70">{getServiceDescription(service)}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/58">
                          <Clock3 className="h-3.5 w-3.5" />
                          {service.duration.replace('About ', '')}
                        </span>
                        {visibleHighlights[0] ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/58">
                            <Sparkles className="h-3.5 w-3.5" />
                            {visibleHighlights[0]}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex min-w-[52px] flex-col items-end justify-between gap-2">
                      <div className="text-right">
                        <p className="font-heading text-lg font-extrabold leading-none text-white min-[390px]:text-xl">{formatCurrency(adjustedPrice)}</p>
                      </div>
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                        selected ? 'bg-white text-[#141414]' : 'bg-burgundy text-white group-hover:bg-burgundyAccent'
                      }`}>
                        {selected ? <Check className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mobile-scroll-fade">
            <div className={`flex gap-3 overflow-x-auto pb-2 md:grid md:overflow-visible ${category === 'correction' ? 'snap-x md:grid-cols-3' : 'md:grid-cols-3'}`}>
              {services.map((service) => {
                const selected = selectedIds.includes(service.id);
                const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
                const correctionImage = CORRECTION_IMAGES[service.id];
                const savingsTags = getServiceSavingsTags(service.id);

                if (category === 'correction') {
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelect(service)}
                      aria-pressed={selected}
                      aria-label={`${getServiceActionLabel(category, selected)}: ${service.name}`}
                      className={`group w-[184px] shrink-0 snap-start overflow-hidden rounded-xl border text-left transition md:w-auto md:shrink md:snap-align-none ${
                        selected
                          ? 'border-burgundyAccent bg-burgundy/20 shadow-[0_0_0_1px_rgb(140_28_44_/_0.5)]'
                          : 'border-line bg-[#141414] hover:border-burgundyAccent/40 hover:bg-burgundy/10'
                      }`}
                    >
                      <div className="relative h-20 bg-black/45 md:h-24">
                        {correctionImage ? (
                          <Image src={correctionImage} alt="" fill className="object-cover opacity-82" sizes="184px" />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-heading text-base font-bold leading-tight text-white">{getMobileServiceName(service)}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/62">{service.description}</p>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div>
                            <p className="font-heading text-lg font-extrabold leading-none text-white">{formatCurrency(adjustedPrice)}</p>
                          </div>
                          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                            selected ? 'bg-white text-[#141414]' : 'bg-burgundy text-white group-hover:bg-burgundyAccent'
                          }`}>
                            {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelect(service)}
                    aria-pressed={selected}
                    aria-label={`${getServiceActionLabel(category, selected)}: ${service.name}`}
                    className={`group flex min-h-[92px] w-[142px] shrink-0 flex-col justify-between rounded-xl border p-3 text-left transition md:w-auto md:shrink md:p-3.5 ${
                      selected
                        ? 'border-burgundyAccent bg-burgundy/20 shadow-[0_0_0_1px_rgb(140_28_44_/_0.45)]'
                        : 'border-line bg-[#141414] hover:border-burgundyAccent/40 hover:bg-burgundy/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/72">
                        {service.id.includes('ceramic') ? <ShieldCheck className="h-4 w-4" /> : service.id.includes('glass') ? <Sparkles className="h-4 w-4" /> : <Droplets className="h-4 w-4" />}
                      </span>
                      <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        selected ? 'bg-white text-[#141414]' : 'bg-burgundy text-white group-hover:bg-burgundyAccent'
                      }`}>
                        {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="line-clamp-2 text-xs font-bold leading-4 text-white">{service.name}</h3>
                      <p className="mt-1 text-[11px] font-extrabold text-white">{formatCurrency(adjustedPrice)}</p>
                      {savingsTags[0] ? <p className="mt-0.5 truncate text-[9px] font-semibold text-burgundyAccent">{savingsTags[0]}</p> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={isPackageGrid ? 'hidden gap-3 lg:grid lg:auto-rows-fr lg:grid-cols-2' : `${gridClassName} hidden lg:grid`}>
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
          const isBestValue = service.id === 'pkg-maintenance';
          const savingsTags = getServiceSavingsTags(service.id);
          const visibleHighlights = isPackageGrid ? service.highlights.slice(0, 5) : service.highlights;
          const packageImage = PACKAGE_IMAGES[service.id];

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service)}
              aria-pressed={selected}
              aria-label={`${getServiceActionLabel(category, selected)}: ${service.name}`}
              className={`group flex h-full min-h-full flex-col rounded-xl border text-left transition duration-300 ${
                selected
                  ? 'border-burgundyAccent bg-burgundy/20 shadow-[0_0_0_1px_rgb(140_28_44_/_0.55),0_18px_38px_rgb(0_0_0_/_0.34)]'
                  : isBestValue
                    ? 'border-white/25 bg-white/[0.08] hover:border-burgundyAccent/45 hover:bg-burgundy/10'
                    : 'border-line bg-[#141414] hover:border-burgundyAccent/35 hover:bg-burgundy/10'
              }`}
            >
              <div className={isPackageGrid ? 'grid h-full gap-3 p-3 sm:flex sm:flex-col sm:p-4' : 'flex min-h-full flex-col p-4'}>
                {isPackageGrid && packageImage ? (
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/35 sm:hidden">
                    <Image
                      src={packageImage}
                      alt=""
                      className="h-32 w-full object-cover opacity-82"
                      sizes="(max-width: 640px) 100vw, 0px"
                      priority={service.id === 'pkg-maintenance'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/55" />
                  </div>
                ) : null}

                <div className="grid grid-cols-[1fr_auto] gap-3 sm:block">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isBestValue ? (
                        <span className="rounded-md bg-burgundy px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          Most Popular
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-heading text-2xl font-bold leading-tight text-ink sm:text-xl">{service.name}</h3>
                    <p className="mt-1 text-sm leading-5 text-ink/70">{getServiceDescription(service)}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-heading text-3xl font-extrabold leading-none text-charcoal sm:text-2xl">{formatCurrency(adjustedPrice)}</p>
                  </div>
                </div>

                {savingsTags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {savingsTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-burgundy/45 bg-burgundy/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold leading-tight text-ink/65">
                    <Clock3 className="h-4 w-4 shrink-0 text-white/55" />
                    {service.duration.replace('About ', '')}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold leading-tight text-ink/65">
                    {service.id.includes('interior') ? <Sparkles className="h-4 w-4 shrink-0 text-white/55" /> : <Droplets className="h-4 w-4 shrink-0 text-white/55" />}
                    {visibleHighlights[0]}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold leading-tight text-ink/65">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-white/55" />
                    {visibleHighlights[visibleHighlights.length - 1]}
                  </span>
                </div>

                <ul className={isPackageGrid ? 'mt-3 hidden flex-wrap gap-1.5 sm:flex' : 'mt-3 space-y-1 text-xs text-ink/70'}>
                  {visibleHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className={
                        isPackageGrid
                          ? 'rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold leading-4 text-ink/75'
                          : ''
                      }
                    >
                      {isPackageGrid ? highlight : `• ${highlight}`}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    selected ? 'bg-white text-[#141414]' : 'bg-burgundy text-white group-hover:bg-burgundyAccent'
                  }`}>
                    {selected ? <Check className="h-4 w-4" /> : null}
                    {getServiceActionLabel(category, selected)}
                  </span>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
                    selected ? 'bg-white text-[#141414]' : 'bg-white/10 text-white group-hover:bg-burgundy'
                  }`}>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  if (!framed) {
    return <section>{content}</section>;
  }

  return <section className="gray-card gray-card-hover overflow-hidden p-4 sm:p-5">{content}</section>;
}

/**
 * Keeps the selected services and booking action reachable on phones.
 */
function MobileServicesActionBar(): JSX.Element {
  const {
    vehicles,
    getGrandTotal,
    getGrandPricingBreakdown,
    getVehiclePricingBreakdown,
    getVehicleServices,
    getSelectedServiceCount,
    setActiveVehicleId,
    addVehicle,
    toggleServiceForVehicle,
    activeVehicleId,
  } = useBooking();
  const [expanded, setExpanded] = useState(false);
  const [switchExpanded, setSwitchExpanded] = useState(false);
  const [footerDockHidden, setFooterDockHidden] = useState(false);
  const selectedServiceCount = getSelectedServiceCount();
  const selectedServices = vehicles.flatMap((vehicle) => getVehicleServices(vehicle.id));
  const selectedPackage = selectedServices.find((service) => service.category === 'package');
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0];
  const grandBreakdown = getGrandPricingBreakdown();
  const activeBreakdown = getVehiclePricingBreakdown(activeVehicleId);
  const hasSelections = selectedServiceCount > 0;
  const canAddVehicle = vehicles.length < MAX_BOOKED_VEHICLES_PER_DAY;
  const vehicleSlots = Array.from({ length: MAX_BOOKED_VEHICLES_PER_DAY }, (_, index) => vehicles[index]);
  const helperServiceIds = activeBreakdown.suggestion?.serviceIds
    ?? (selectedPackage ? PACKAGE_HELPER_SERVICE_IDS[selectedPackage.id] : undefined)
    ?? [];
  const helperServices = helperServiceIds
    .map((serviceId) => findServiceById(serviceId))
    .filter((service): service is ServiceOption => Boolean(service))
    .slice(0, 3);

  useEffect(() => {
    const sentinel = document.getElementById('services-dock-footer-sentinel');
    if (!sentinel) {
      return undefined;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const mobileNavHeight = Number.parseFloat(rootStyles.getPropertyValue('--mobile-nav-height')) || 86;
    const dockElement = document.getElementById('services-mobile-action-bar');
    const dockHeight = dockElement?.getBoundingClientRect().height ?? 144;
    const collisionOffset = Math.round(dockHeight + mobileNavHeight + 12);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldHideDock = entry?.isIntersecting ?? false;
        setFooterDockHidden(shouldHideDock);
        if (shouldHideDock) {
          setExpanded(false);
          setSwitchExpanded(false);
        }
      },
      {
        root: null,
        rootMargin: `0px 0px -${collisionOffset}px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [expanded, hasSelections, switchExpanded]);

  if (!hasSelections) {
    return <></>;
  }

  function scrollToPlannerSection(sectionId: string): void {
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => target?.focus({ preventScroll: true }), 250);
  }

  function handleCompleteBundle(): void {
    const suggestion = activeBreakdown.suggestion;
    let appliedSuggestion = false;

    suggestion?.serviceIds.forEach((serviceId) => {
      const service = findServiceById(serviceId);
      if (service && activeVehicle && !activeVehicle.serviceIds.includes(service.id)) {
        toggleServiceForVehicle(activeVehicleId, service);
        appliedSuggestion = true;
      }
    });

    if (!appliedSuggestion) {
      const firstHelperService = helperServices[0];
      if (firstHelperService?.category === 'package') {
        scrollToPlannerSection('detail-packages');
      } else if (firstHelperService?.category === 'correction') {
        scrollToPlannerSection('paint-correction-services');
      } else {
        scrollToPlannerSection('protection-services');
      }
    }
  }

  function handleHelperServiceClick(service: ServiceOption): void {
    if (service.category === 'package') {
      scrollToPlannerSection('detail-packages');
      return;
    }

    scrollToPlannerSection(service.category === 'correction' ? 'paint-correction-services' : 'protection-services');
  }

  function handleSwitchVehicle(vehicleId: string): void {
    setActiveVehicleId(vehicleId);
    setSwitchExpanded(false);
  }

  function handleEmptyVehicleSlot(): void {
    if (canAddVehicle) {
      addVehicle();
      setSwitchExpanded(false);
    }
  }

  return (
    <aside
      id="services-mobile-action-bar"
      className={`fixed inset-x-3 bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+0.5rem)] z-40 text-white transition duration-300 sm:inset-x-4 md:left-1/2 md:right-auto md:w-[min(44rem,calc(100vw-2rem))] md:-translate-x-1/2 lg:hidden ${
        footerDockHidden ? 'pointer-events-none translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      aria-hidden={footerDockHidden}
    >
      <div className="mobile-scroll-fade mb-1.5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={handleCompleteBundle}
            className="shrink-0 rounded-lg border border-burgundyAccent/70 bg-[#171717] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:border-burgundyAccent hover:bg-burgundy/30"
          >
            Complete your bundle
          </button>
          {helperServices.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleHelperServiceClick(service)}
              className="shrink-0 rounded-lg border border-burgundy/55 bg-[#171717] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:border-burgundyAccent hover:bg-burgundy/25"
            >
              {service.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-burgundy/45 bg-[#101010] p-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]">
        {expanded ? (
          <div className="mb-3 max-h-36 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2">
            {selectedServices.map((service, index) => (
              <div key={`${service.id}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.05] px-2 py-1.5 text-xs">
                <span className="font-semibold text-white/80">{service.name}</span>
                <span className="font-bold text-white">{formatCurrency(service.price)}</span>
              </div>
            ))}
            {grandBreakdown.savingsTotal > 0 ? (
              <p className="px-2 pt-1 text-xs font-semibold text-burgundyAccent">Savings applied in estimate.</p>
            ) : null}
          </div>
        ) : null}

        {switchExpanded ? (
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
            {vehicleSlots.map((vehicle, index) => {
              const active = vehicle?.id === activeVehicleId;
              const serviceCount = vehicle ? getVehicleServices(vehicle.id).length : 0;

              return vehicle ? (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => handleSwitchVehicle(vehicle.id)}
                  aria-pressed={active}
                  className={`min-h-14 rounded-lg border px-2 py-1.5 text-left transition ${
                    active
                      ? 'border-burgundyAccent bg-burgundy/30 text-white'
                      : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-burgundyAccent/45 hover:bg-burgundy/10'
                  }`}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-white/48">Vehicle {index + 1}</span>
                  <span className="mt-0.5 block truncate text-xs font-bold">{getVehicleDisplayName(vehicle)}</span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-white/52">{serviceCount} item{serviceCount === 1 ? '' : 's'}</span>
                </button>
              ) : (
                <button
                  key={`dock-empty-vehicle-${index}`}
                  type="button"
                  onClick={handleEmptyVehicleSlot}
                  disabled={!canAddVehicle}
                  className="min-h-14 rounded-lg border border-dashed border-burgundy/45 bg-white/[0.03] px-2 py-1.5 text-left text-white/62 transition hover:border-burgundyAccent hover:bg-burgundy/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-white/38">Slot {index + 1}</span>
                  <span className="mt-0.5 block text-xs font-bold text-white/78">Add vehicle</span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-white/45">Available</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white min-[390px]:text-sm">{activeVehicle ? getVehicleDisplayName(activeVehicle) : 'Selected vehicle'}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-xs font-semibold text-white/62">
                {selectedServiceCount} service{selectedServiceCount === 1 ? '' : 's'} added
              </span>
              <button
                type="button"
                onClick={() => {
                  setExpanded((current) => !current);
                  setSwitchExpanded(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-burgundyAccent transition hover:text-white"
                aria-expanded={expanded}
              >
                {expanded ? 'Hide selected' : 'View selected'}
                {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 md:contents">
            <button
              type="button"
              onClick={() => {
                setSwitchExpanded((current) => !current);
                setExpanded(false);
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-burgundy/60 bg-[#171717] px-3 py-2 text-xs font-bold text-white transition hover:border-burgundyAccent hover:bg-burgundy/18 min-[390px]:text-sm"
              aria-expanded={switchExpanded}
            >
              Switch vehicle
            </button>

            <Link
              href="/booking"
              onClick={() => trackAnalyticsEvent('click_book_now', { page: '/services', location: 'mobile_services_action_bar' })}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-burgundy px-2.5 py-2 text-xs font-bold text-white transition hover:bg-burgundyAccent min-[390px]:px-4 min-[390px]:text-sm"
              aria-label={`Continue to booking with selected services totaling ${formatCurrency(getGrandTotal())}`}
            >
              <span className="whitespace-nowrap">Continue | {formatCurrency(getGrandTotal())}</span>
              <ArrowRight className="hidden h-4 w-4 min-[390px]:block" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Renders active-vehicle lookup tools and standard pricing categories.
 */
function VehicleSelectSection(): JSX.Element {
  const { vehicles, activeVehicleId, updateVehicle } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const options = getStandardVehicleOptions();

  if (!activeVehicle) {
    return <></>;
  }

  return (
    <section className="gray-card gray-card-hover hidden p-4 sm:p-5 lg:block">
      <h2 className="font-heading text-2xl font-semibold text-ink">Vehicle size</h2>
      <p className="mt-2 text-sm text-ink/60">
        Choose the closest size so package estimates match the vehicle you are booking.
      </p>

      <VehicleSizeGuideLookup
        activeVehicle={activeVehicle}
        includeOversized={false}
        onApplyLookupMatch={(match) => {
          updateVehicle(activeVehicle.id, {
            make: match.make,
            model: match.model,
            size: match.size,
            sizeSource: 'guide',
            customLabel: undefined,
          });
        }}
        onApplyTypedVehicle={(details) => {
          updateVehicle(activeVehicle.id, {
            year: details.year ? sanitizeVehicleYearInput(details.year) : '',
            make: details.make ? sanitizeVehicleTextInput(details.make) : '',
            model: details.model ?? '',
            customLabel: details.label,
            sizeSource: null,
          });
        }}
        className="mt-4"
      />

      <div className="mt-4 grid gap-2 sm:gap-3 md:grid-cols-3">
        {options.map((option) => {
          const selected = isVehicleSizeSelected(activeVehicle, option.id);
          const sizeLocked = isVehicleGuideSizeLocked(activeVehicle);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateVehicle(activeVehicle.id, { size: option.id, sizeSource: 'manual' })}
              disabled={sizeLocked}
              aria-pressed={selected}
              className={`min-h-20 rounded-xl border px-3 py-3 text-left transition duration-300 sm:px-4 sm:py-5 ${
                selected
                  ? 'border-white/45 bg-white/[0.12] shadow-md'
                  : 'border-white/10 bg-[#111111] hover:border-burgundyAccent/40 hover:bg-burgundy/10'
              } disabled:cursor-not-allowed disabled:opacity-75`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-lg font-semibold leading-tight text-ink sm:text-xl">{option.label}</p>
                {selected ? <Check className="h-4 w-4 shrink-0 text-burgundyAccent" /> : null}
              </div>
              <p className="mt-1 text-xs font-semibold text-ink/55 sm:text-sm">{option.hint}</p>
            </button>
          );
        })}
      </div>
      {needsManualVehicleSize(activeVehicle) ? (
        <p className="mt-3 rounded-xl border border-burgundy/35 bg-burgundy/10 px-4 py-3 text-sm font-semibold text-ink">
          Vehicle not in the guide yet? Choose the closest size category to continue. Final pricing may be confirmed after inspection.
        </p>
      ) : null}
    </section>
  );
}

/**
 * Renders the services planner with left selection and right vehicle controls.
 */
export default function ServicesPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-ink px-4 py-5 text-white sm:px-6 sm:py-8 md:py-10 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8c1c2c33,transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl text-left sm:text-center">
          <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Cruizn Clean Services</h1>
          <p className="mt-2 hidden max-w-2xl text-sm text-white/75 sm:mx-auto sm:mt-4 sm:block sm:text-xl">
            Choose your detail package, add what you need, and book when you’re ready.
          </p>
          <p className="mt-2 hidden text-xs font-semibold text-fog sm:mt-3 sm:block sm:text-sm">Pricing adjusts by vehicle size before booking.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:px-6 sm:py-8 services-bottom-safe lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="mx-auto min-w-0 w-full max-w-xl space-y-4 sm:space-y-5 md:max-w-3xl md:space-y-6 lg:max-w-none">
          <MobileVehicleLookup />
          <MobileServiceSteps />
          <VehicleSelectSection />
          <div id="detail-packages" className="scroll-mt-28 focus:outline-none" tabIndex={-1}>
            <ServiceGrid category="package" />
          </div>
          <section id="addons-section" className="gray-card gray-card-hover scroll-mt-28 overflow-hidden p-4 focus:outline-none sm:p-5" tabIndex={-1}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Add-Ons</h2>
                <p className="mt-2 hidden max-w-2xl text-sm text-ink/65 sm:block">
                  Not sure what your vehicle needs? Send a quote request and we’ll help point you in the right direction.
                </p>
              </div>
              <Link href="/quote" className="hidden text-sm font-semibold text-white transition hover:text-burgundyAccent sm:inline">
                Need a quote?
              </Link>
            </div>

            <div className="mt-4 space-y-5 md:mt-5 md:space-y-6">
              <div id="paint-correction-services" className="scroll-mt-28 focus:outline-none" tabIndex={-1}>
                <ServiceGrid category="correction" title="Paint Correction" gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" framed={false} />
              </div>
              <div id="protection-services" className="scroll-mt-28 focus:outline-none" tabIndex={-1}>
                <ServiceGrid category="protection" title="Protection + Coatings" framed={false} />
              </div>
            </div>
          </section>
        </div>

        <div className="services-sidebar hidden space-y-4 self-start lg:block">
          <VehicleDock />
          <section className="gray-card p-5">
            <h2 className="font-heading text-xl font-semibold text-ink">Availability + Limits</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li>• Monday-Saturday availability: 8am - 6pm</li>
              <li>• Up to 4 vehicles can be submitted per customer per day</li>
              <li>• Same-day requests may require a rush fee</li>
            </ul>
          </section>
        </div>
      </section>
      <div id="services-dock-footer-sentinel" className="h-10 bg-ink lg:hidden" aria-hidden="true" />
      <MobileServicesActionBar />
    </SiteShell>
  );
}
