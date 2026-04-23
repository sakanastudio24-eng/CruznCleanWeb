'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CarFront, PhoneCall, Sparkles } from 'lucide-react';
import { getPackageServices } from '@/lib/services-catalog';

/**
 * Renders an interactive split hero with vehicle-first and plan-second selection.
 */
export function HeroSection(): JSX.Element {
  const vehicleTypes = ['Sedan / Coupe', 'SUV / Crossover', 'Truck / Van'];
  const detailPlans = getPackageServices().map((service) => ({
    name: service.name,
    price: `$${service.price}`,
  }));

  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const buildPlanHref =
    selectedVehicleType && selectedPlan
      ? `/services?vehicleType=${encodeURIComponent(selectedVehicleType)}&plan=${encodeURIComponent(selectedPlan)}`
      : '/services';

  return (
    <section className="landing-hero relative overflow-hidden bg-brandBlack text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#111111_0%,#1a1a1a_38%,#212121_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,#a3a3a335,transparent_44%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_74%,#26262666,transparent_52%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[linear-gradient(180deg,#2f2f2f_0%,#3a3a3a_44%,#111111_100%)] lg:block" />
      <div className="absolute bottom-[-20%] right-[20%] hidden h-72 w-72 rounded-full bg-white/10 blur-3xl lg:block" />

      <div className="relative mx-auto grid min-h-[calc(100svh-var(--site-header-height))] w-full max-w-6xl items-center gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[390px_minmax(0,1fr)] lg:gap-10 lg:py-12">
        <aside className="fade-in-up order-2 rounded-3xl border border-black/10 bg-white p-5 text-brandBlack shadow-[0_16px_40px_rgba(0,0,0,0.25)] lg:order-1 lg:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-waterBlue/45 bg-waterBlue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brandBlack/75">
            <Sparkles className="h-3.5 w-3.5 text-waterBlue" />
            Quick Detail Finder
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-tight">Find your right detail</h2>
          <p className="mt-2 text-sm text-brandBlack/65">All selections are for new details. No retainer plans.</p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brandBlack/55">Step 1 • Select Vehicle Type</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {vehicleTypes.map((vehicleType) => (
                <button
                  key={vehicleType}
                  type="button"
                  onClick={() => setSelectedVehicleType(vehicleType)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    selectedVehicleType === vehicleType
                      ? 'border-waterBlue bg-waterBlue/20 text-brandBlack'
                      : 'border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:text-waterBlue'
                  }`}
                >
                  {vehicleType}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brandBlack/55">Step 2 • Select Plan</p>
            <div className="mt-2 space-y-2">
              {detailPlans.map((plan) => (
                <button
                  key={plan.name}
                  type="button"
                  disabled={!selectedVehicleType}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition ${
                    selectedPlan === plan.name
                      ? 'border-waterBlue bg-waterBlue/15 text-brandBlack'
                      : 'border-black/15 bg-white text-brandBlack'
                  } ${selectedVehicleType ? 'hover:border-waterBlue hover:text-waterBlue' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span className="font-semibold">{plan.name}</span>
                  <span className="text-xs font-semibold">{plan.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-waterBlue/35 bg-waterBlue/10 px-3 py-2.5 text-xs text-brandBlack/70">
            {selectedVehicleType ? (
              <>
                Vehicle: <span className="font-semibold text-brandBlack">{selectedVehicleType}</span>
                {selectedPlan ? (
                  <>
                    {' '}
                    • Plan: <span className="font-semibold text-brandBlack">{selectedPlan}</span>
                  </>
                ) : null}
              </>
            ) : (
              'Pick a vehicle type first, then choose your detail plan.'
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Link
              href={buildPlanHref}
              className="flex items-center justify-center gap-2 rounded-xl bg-waterBlue px-4 py-3 text-sm font-semibold text-brandBlack transition duration-300 hover:bg-[#d1d5db]"
            >
              Build Service Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/booking"
              className="flex items-center justify-center gap-2 rounded-xl border border-black/20 bg-white px-4 py-3 text-sm font-semibold text-brandBlack transition duration-300 hover:border-waterBlue hover:text-waterBlue"
            >
              Continue to Booking
            </Link>
          </div>

          <p className="mt-3 text-center text-xs font-semibold text-brandBlack/55">No payment required to submit intake.</p>
        </aside>

        <div className="fade-in-up order-1 lg:order-2">
          <div className="rounded-3xl border border-white/15 bg-[linear-gradient(130deg,#3a3a3a_0%,#2f2f2f_42%,#1f1f1f_100%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              <CarFront className="h-3.5 w-3.5" />
              DetailFlow
            </p>

            <h1 className="mt-5 font-heading text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl">Revive</h1>
            <p className="mt-3 max-w-2xl text-xl text-white/90 sm:text-2xl">your car at home, office, or curbside.</p>

            <p className="mt-6 max-w-2xl text-sm text-white/80 sm:text-base">
              Select services per vehicle, send your intake once, then lock in scheduling through Cal.com.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-deepRed transition duration-300 hover:-translate-y-0.5 hover:bg-neutralGray"
              >
                Book an Appointment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/10"
              >
                <PhoneCall className="h-4 w-4" />
                (555) 123-4567
              </a>
            </div>

            <div className="mt-7 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Packages</p>
                <p className="mt-1 font-semibold text-white">Basic • Standard • Premium</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Add-Ons</p>
                <p className="mt-1 font-semibold text-white">Ceramic, Engine, Headlights</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Multi-Car</p>
                <p className="mt-1 font-semibold text-white">Vehicle Dock Supported</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
