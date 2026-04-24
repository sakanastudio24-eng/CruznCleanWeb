'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { VehicleDock } from '@/components/dock/vehicle-dock';
import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import { VehicleSizeGuideLookup } from '@/components/vehicle/vehicle-size-guide-lookup';
import type { ServiceCategory, ServiceOption, VehicleSize } from '@/lib/booking-types';
import { formatSizeAdjustmentLabel, getAdjustedServicePrice } from '@/lib/pricing';
import { getCorrectionServices, getPackageServices, getProtectionServices } from '@/lib/services-catalog';

interface VehicleSizeOption {
  id: VehicleSize;
  label: string;
  hint: string;
}

/**
 * Returns supported vehicle size options for pricing context.
 */
function getVehicleSizeOptions(): VehicleSizeOption[] {
  return [
    { id: 'sedan_coupe', label: 'Sedan / Coupe', hint: 'Base listed pricing' },
    { id: 'small_suv_truck', label: 'Small SUV / Truck', hint: '+20% pricing adjustment' },
    { id: 'large_suv_truck', label: 'Large SUV / Truck', hint: '+40% pricing adjustment' },
    { id: 'oversized', label: 'Oversized', hint: '+50% pricing adjustment' },
  ];
}

/**
 * Formats numeric totals into whole-dollar currency strings.
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(0)}`;
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
  const { vehicles, activeVehicleId, setVehiclePackage, toggleServiceForVehicle, getVehicleServices } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const services = useMemo(() => getServicesForCategory(category), [category]);
  const selectedIds = getVehicleServices(activeVehicleId).map((service) => service.id);

  /**
   * Handles package replacement or toggle behavior for one card interaction.
   */
  function handleSelect(service: ServiceOption): void {
    if (category === 'package') {
      setVehiclePackage(activeVehicleId, service.id);
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
              Active size: {activeVehicle.size.replaceAll('_', ' ').toUpperCase()} • {formatSizeAdjustmentLabel(activeVehicle.size)}
            </p>
          ) : null}
        </div>
      </div>

      <div className={gridClassName}>
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
          const isBestValue = service.id === 'pkg-maintenance';

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service)}
              aria-pressed={selected}
              className={`rounded-xl border p-4 text-left transition duration-300 ${
                selected
                  ? 'border-charcoal bg-charcoal/10 shadow-md'
                  : isBestValue
                    ? 'border-white/35 bg-white/[0.08] hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.12]'
                    : 'border-white/10 bg-[#111111] hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#161616]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">{service.duration}</p>
                {isBestValue ? (
                  <span className="rounded-full bg-charcoal px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    Best Value
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1 font-heading text-xl font-bold text-ink">{service.name}</h3>
              <p className="mt-2 text-sm text-ink/70">{service.description}</p>

              <ul className="mt-3 space-y-1 text-xs text-ink/70">
                {service.highlights.map((highlight) => (
                  <li key={highlight}>• {highlight}</li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">Tap to select</span>
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
 * Renders size cards and lookup tools for the active vehicle.
 */
function VehicleSizeSection(): JSX.Element {
  const { vehicles, activeVehicleId, updateVehicle } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const options = getVehicleSizeOptions();

  if (!activeVehicle) {
    return <></>;
  }

  return (
    <section className="gray-card gray-card-hover p-5">
      <h2 className="font-heading text-2xl font-semibold text-ink">Select Your Vehicle Size</h2>
      <p className="mt-2 text-sm text-ink/60">
        Sedan and coupe pricing uses the listed starting rate. SUVs, trucks, vans, and lifted vehicles reprice instantly.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const selected = activeVehicle.size === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateVehicle(activeVehicle.id, { size: option.id })}
              aria-pressed={selected}
              className={`rounded-2xl border px-4 py-5 text-left transition duration-300 ${
                selected
                  ? 'border-charcoal bg-charcoal/5 shadow-md'
                  : 'border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#161616]'
              }`}
            >
              <p className="font-heading text-xl font-semibold text-ink">{option.label}</p>
              <p className="mt-1 text-sm text-ink/55">{option.hint}</p>
            </button>
          );
        })}
      </div>

      <VehicleSizeGuideLookup
        activeVehicle={activeVehicle}
        onApplyLookupMatch={(match) => {
          updateVehicle(activeVehicle.id, {
            make: match.make,
            model: match.model,
            size: match.size,
          });
        }}
        className="mt-4"
      />
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#a3a3a333,transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Cruzn Clean Services</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Review package and add-on options for Yorba Linda mobile detailing with live size-based pricing and clearer routing for specialty vehicles.
          </p>
          <p className="mt-3 text-sm font-semibold text-fog">Maintenance Detail is the most balanced option for regularly cared-for vehicles.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 services-bottom-safe lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <VehicleSizeSection />
          <ServiceGrid category="package" />
          <section className="gray-card gray-card-hover p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-ink">Add-Ons</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink/65">
                  Standalone premium work for vehicles that need coating, correction, or more specialized protection without forcing a package.
                </p>
              </div>
              <Link href="/quote" className="text-sm font-semibold text-white transition hover:text-fog">
                Need a custom setup?
              </Link>
            </div>

            <div className="mt-5 space-y-5">
              <ServiceGrid category="protection" title="Protection + Coatings" framed={false} />
              <ServiceGrid category="correction" title="Paint Correction" gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" framed={false} />
            </div>
          </section>
        </div>

        <div className="services-sidebar space-y-4 self-start">
          <VehicleDock />
          <section className="gray-card p-5">
            <h2 className="font-heading text-xl font-semibold text-ink">Availability + Limits</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li>• Monday-Friday availability: 8am - 6pm</li>
              <li>• Saturday and Sunday requests are reviewed manually</li>
              <li>• Up to 4 vehicles can be submitted per customer per day</li>
              <li>• Same-day requests may require a rush fee</li>
            </ul>
          </section>
        </div>
      </section>
    </SiteShell>
  );
}
