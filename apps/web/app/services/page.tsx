'use client';

import { useMemo } from 'react';

import { VehicleDock } from '@/components/dock/vehicle-dock';
import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import { VehicleSizeGuideLookup } from '@/components/vehicle/vehicle-size-guide-lookup';
import type { VehicleSize } from '@/lib/booking-types';
import { formatSizeAdjustmentLabel, getAdjustedServicePrice } from '@/lib/pricing';
import { getAddonServices, getPackageServices } from '@/lib/services-catalog';

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
    { id: 'small', label: 'Small', hint: 'Sedan / Coupe' },
    { id: 'medium', label: 'Medium', hint: 'SUV / Crossover' },
    { id: 'large', label: 'Large', hint: 'Truck / Van' },
  ];
}

/**
 * Formats numeric totals into whole-dollar currency strings.
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(0)}`;
}

/**
 * Renders package or add-on cards with active-vehicle size-adjusted prices.
 */
function ServiceGrid({ category }: { category: 'package' | 'addon' }): JSX.Element {
  const { vehicles, activeVehicleId, setVehiclePackage, toggleServiceForVehicle, getVehicleServices } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const services = useMemo(
    () => (category === 'package' ? getPackageServices() : getAddonServices()),
    [category],
  );

  const selectedIds = getVehicleServices(activeVehicleId).map((service) => service.id);

  const basicPackage = useMemo(() => services.find((service) => service.id === 'pkg-basic'), [services]);
  const standardPackage = useMemo(() => services.find((service) => service.id === 'pkg-standard'), [services]);

  /**
   * Handles selection logic for package and add-on cards.
   */
  function handleSelect(serviceId: string): void {
    const service = services.find((item) => item.id === serviceId);
    if (!service) {
      return;
    }

    if (category === 'package') {
      setVehiclePackage(activeVehicleId, service.id);
      return;
    }

    toggleServiceForVehicle(activeVehicleId, service);
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink">
            {category === 'package' ? 'Detail Packages' : 'Enhancement Add-Ons'}
          </h2>
          {activeVehicle ? (
            <p className="mt-1 text-xs font-semibold text-ink/60">
              Active size: {activeVehicle.size.toUpperCase()} • {formatSizeAdjustmentLabel(activeVehicle.size)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          const adjustedPrice = activeVehicle ? getAdjustedServicePrice(service.price, activeVehicle.size) : service.price;
          const isStandardPackage = category === 'package' && service.id === 'pkg-standard';
          const basicPrice = activeVehicle && basicPackage ? getAdjustedServicePrice(basicPackage.price, activeVehicle.size) : basicPackage?.price;
          const standardPrice = activeVehicle && standardPackage ? getAdjustedServicePrice(standardPackage.price, activeVehicle.size) : standardPackage?.price;
          const premiumVsStandard =
            isStandardPackage || !standardPrice
              ? null
              : adjustedPrice - standardPrice;
          const standardVsBasic =
            isStandardPackage && basicPrice !== undefined
              ? adjustedPrice - basicPrice
              : null;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service.id)}
              className={`rounded-xl border p-4 text-left transition duration-300 ${
                selected
                  ? 'border-charcoal bg-charcoal/10 shadow-md'
                  : isStandardPackage
                    ? 'border-charcoal/45 bg-[#f5f5f5] hover:-translate-y-0.5 hover:border-charcoal hover:bg-charcoal/10'
                    : 'border-black/10 bg-white hover:-translate-y-0.5 hover:border-fog hover:bg-fog/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">{service.duration}</p>
                {isStandardPackage ? (
                  <span className="rounded-full bg-charcoal px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    Best Value
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1 font-heading text-xl font-bold text-ink">{service.name}</h3>
              <p className="mt-2 text-sm text-ink/70">{service.description}</p>
              {isStandardPackage && standardVsBasic !== null ? (
                <p className="mt-2 text-xs font-semibold text-charcoal">Only +{formatCurrency(standardVsBasic)} vs Basic at this size.</p>
              ) : null}
              {!isStandardPackage && premiumVsStandard !== null && premiumVsStandard > 0 && category === 'package' ? (
                <p className="mt-2 text-xs text-ink/65">{formatCurrency(premiumVsStandard)} above Standard at this size.</p>
              ) : null}
              {!isStandardPackage && category === 'package' && service.id === 'pkg-basic' && standardPrice && adjustedPrice < standardPrice ? (
                <p className="mt-2 text-xs text-ink/65">Standard adds deeper coverage for +{formatCurrency(standardPrice - adjustedPrice)}.</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/55">Tap to select</span>
                <span className="font-heading text-2xl font-extrabold text-charcoal">{formatCurrency(adjustedPrice)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
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
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">
      <h2 className="font-heading text-2xl font-semibold text-ink">Select Your Vehicle Size</h2>
      <p className="mt-2 text-sm text-ink/60">Size updates reprice packages and add-ons instantly.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const selected = activeVehicle.size === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateVehicle(activeVehicle.id, { size: option.id })}
              className={`rounded-2xl border px-4 py-5 text-left transition duration-300 ${
                selected
                  ? 'border-charcoal bg-charcoal/5 shadow-md'
                  : 'border-black/10 bg-white hover:border-fog hover:bg-fog/10'
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
        onManualSizeChange={(size) => updateVehicle(activeVehicle.id, { size })}
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
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Our Detailing Packages</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Choose the perfect service for your vehicle size and condition.
          </p>
          <p className="mt-3 text-sm font-semibold text-fog">Standard Detail is the most balanced package for most vehicles.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 services-bottom-safe lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <VehicleSizeSection />
          <ServiceGrid category="package" />
          <ServiceGrid category="addon" />
        </div>
        <div>
          <VehicleDock />
        </div>
      </section>
    </SiteShell>
  );
}
