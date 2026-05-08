'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { VehicleDock } from '@/components/dock/vehicle-dock';
import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import { VehicleSizeGuideLookup } from '@/components/vehicle/vehicle-size-guide-lookup';
import type { ServiceCategory, ServiceOption, VehicleProfile, VehicleSize } from '@/lib/booking-types';
import { formatSizeAdjustmentLabel, getAdjustedServicePrice, getServiceSavingsTags } from '@/lib/pricing';
import { getCorrectionServices, getPackageServices, getProtectionServices } from '@/lib/services-catalog';
import { getVehicleDisplayName, isVehicleGuideSizeLocked, needsManualVehicleSize } from '@/lib/vehicle-utils';

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

  /**
   * Handles package replacement or toggle behavior for one card interaction.
   */
  function handleSelect(service: ServiceOption): void {
    if (category === 'package') {
      toggleVehiclePackage(activeVehicleId, service.id);
      return;
    }

    toggleServiceForVehicle(activeVehicleId, service);
  }

  const content = (
    <>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink">{title ?? getSectionTitle(category)}</h2>
          {activeVehicle ? (
            <p className="mt-1 text-xs font-semibold text-ink/60">
              {getActiveVehiclePricingLabel(activeVehicle)}
            </p>
          ) : null}
        </div>
      </div>

      <div className={gridClassName}>
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
          const isBestValue = service.id === 'pkg-maintenance';
          const savingsTags = getServiceSavingsTags(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service)}
              aria-pressed={selected}
              className={`flex min-h-full flex-col rounded-xl border p-4 text-left transition duration-300 ${
                selected
                  ? 'border-burgundyAccent bg-burgundy/20 shadow-md'
                  : isBestValue
                    ? 'border-white/25 bg-white/[0.08] hover:-translate-y-0.5 hover:border-burgundyAccent/45 hover:bg-burgundy/10'
                    : 'border-line bg-[#141414] hover:-translate-y-0.5 hover:border-burgundyAccent/35 hover:bg-burgundy/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">{service.duration}</p>
                {isBestValue ? (
                  <span className="rounded-full bg-burgundy px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    Best Value
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1 font-heading text-xl font-bold text-ink">{service.name}</h3>
              {savingsTags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {savingsTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-burgundy/45 bg-burgundy/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-sm text-ink/70">{service.description}</p>

              <ul className="mt-3 space-y-1 text-xs text-ink/70">
                {service.highlights.map((highlight) => (
                  <li key={highlight}>• {highlight}</li>
                ))}
              </ul>

              <div className="mt-auto flex justify-end pt-4">
                <span className="font-heading text-2xl font-extrabold text-charcoal">{formatCurrency(adjustedPrice)}</span>
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

  return <section className="gray-card gray-card-hover p-5">{content}</section>;
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
    <section className="gray-card gray-card-hover p-5">
      <h2 className="font-heading text-2xl font-semibold text-ink">Select Your Vehicle</h2>
      <p className="mt-2 text-sm text-ink/60">
        Pick the active vehicle from the dock, then match it to the closest standard category before selecting services
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

      <div className="mt-4 grid gap-3 md:grid-cols-3">
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
              className={`rounded-2xl border px-4 py-5 text-left transition duration-300 ${
                selected
                  ? 'border-white/45 bg-white/[0.12] shadow-md'
                  : 'border-white/10 bg-[#111111]'
              } disabled:cursor-not-allowed disabled:opacity-75`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-xl font-semibold text-ink">{option.label}</p>
              </div>
              <p className="mt-1 text-sm text-ink/55">{option.hint}</p>
            </button>
          );
        })}
      </div>
      {needsManualVehicleSize(activeVehicle) ? (
        <p className="mt-3 rounded-xl border border-burgundy/35 bg-burgundy/10 px-4 py-3 text-sm font-semibold text-ink">
          Custom vehicle. Choose a size category to continue.
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
      <section className="relative overflow-hidden bg-ink px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8c1c2c33,transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Cruizn Clean Services</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Review package and add-on options for Yorba Linda mobile detailing with live size-based pricing and clearer routing for specialty vehicles
          </p>
          <p className="mt-3 text-sm font-semibold text-fog">Maintenance Detail is the most balanced option for regularly cared-for vehicles</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 services-bottom-safe lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <VehicleSelectSection />
          <ServiceGrid category="package" />
          <section className="gray-card gray-card-hover p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-ink">Add-Ons</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink/65">
                  Standalone premium work for vehicles that need coating, correction, or more specialized protection without forcing a package
                </p>
              </div>
              <Link href="/quote" className="text-sm font-semibold text-white transition hover:text-burgundyAccent">
                Need a quote?
              </Link>
            </div>

            <div className="mt-5 space-y-5">
              <ServiceGrid category="correction" title="Paint Correction" gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" framed={false} />
              <ServiceGrid category="protection" title="Protection + Coatings" framed={false} />
            </div>
          </section>
        </div>

        <div className="services-sidebar space-y-4 self-start">
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
    </SiteShell>
  );
}
