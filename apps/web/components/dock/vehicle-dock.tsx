'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Car, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import { useBooking } from '@/components/providers/booking-provider';
import { BOOKING_LIMIT_DISCLAIMER, MAX_BOOKED_VEHICLES_PER_DAY } from '@/lib/booking-policy';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

/**
 * Renders the vehicle management dock with totals and booking CTA.
 */
export function VehicleDock(): JSX.Element {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    removeVehicle,
    getGrandTotal,
    getVehicleTotal,
    getVehicleServices,
  } = useBooking();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const canAddVehicle = vehicles.length < MAX_BOOKED_VEHICLES_PER_DAY;

  return (
    <aside className="dock-shell rounded-2xl border border-black/10 bg-white shadow-xl">
      <div className="border-b border-black/10 bg-gradient-to-r from-ink to-[#1f1f1f] px-4 py-4 text-white sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Car className="h-5 w-5 text-fog" />
            Vehicle Dock
          </h2>
          <button
            type="button"
            onClick={() => setMobileExpanded((current) => !current)}
            className="inline-flex items-center justify-center rounded-md bg-white/10 p-1.5 text-white lg:hidden"
            aria-label="Toggle vehicle dock"
          >
            {mobileExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-white/70">
          {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} • ${getGrandTotal()}
        </p>
      </div>

      <div className={`space-y-4 p-4 sm:p-5 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">Select Vehicle</p>
          <div className="mt-2 space-y-2">
            {vehicles.map((vehicle) => {
              const active = vehicle.id === activeVehicleId;
              const selectedServices = getVehicleServices(vehicle.id);

              return (
                <article
                  key={vehicle.id}
                  className={`rounded-xl border p-3 transition duration-300 ${
                    active ? 'border-charcoal bg-charcoal/5 shadow-sm' : 'border-black/10 bg-white hover:border-fog'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setActiveVehicleId(vehicle.id)} className="text-left">
                      <p className="font-heading text-base font-bold text-ink">{getVehicleDisplayName(vehicle)}</p>
                      <p className="text-xs text-ink/60">{selectedServices.length} items</p>
                    </button>
                    {vehicles.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeVehicle(vehicle.id)}
                        className="rounded-md p-1 text-ink/45 transition hover:bg-canvas hover:text-charcoal"
                        aria-label="Remove vehicle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2 border-t border-black/10 pt-2 text-right">
                    <p className="text-xs text-ink/60">Subtotal</p>
                    <p className="font-heading text-lg font-bold text-charcoal">${getVehicleTotal(vehicle.id)}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addVehicle}
            disabled={!canAddVehicle}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-fog px-3 py-2 text-sm font-semibold text-fog transition ${
              canAddVehicle ? 'hover:bg-fog/10' : 'cursor-not-allowed opacity-60'
            }`}
          >
            <Plus className="h-4 w-4" /> Add Another Car
          </button>
          <p className="mt-2 text-center text-xs font-medium text-ink/60">{BOOKING_LIMIT_DISCLAIMER}</p>
        </section>

        <section className="rounded-xl border border-black/10 bg-canvas p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">Pricing Reliability</p>
          <p className="mt-2 text-sm text-ink/70">
            Switch cars here, then manage sizing and service selections in the main planner so pricing always updates from one active source of truth.
          </p>
        </section>
      </div>

      <div className="space-y-3 border-t border-black/10 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Total</p>
          <p className="font-heading text-2xl font-extrabold text-charcoal">${getGrandTotal()}</p>
        </div>
        <Link
          href="/booking"
          className="block rounded-full bg-charcoal px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-ink"
        >
          Book All Vehicles
        </Link>
      </div>
    </aside>
  );
}
