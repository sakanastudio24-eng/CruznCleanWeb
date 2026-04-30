'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, MapPin, PhoneCall, Sparkles } from 'lucide-react';
import { getPackageServices } from '@/lib/services-catalog';
import { SITE_PROFILE } from '@/lib/site-profile';
import heroImage from '../../../../attachments/Exter12.jpg';

const SERVICE_AREA_FRAMES = [
  ['Yorba Linda', 'Placentia', 'Fullerton'],
  ['Anaheim', 'Brea', 'Orange'],
  ['La Habra', 'Buena Park', 'Cypress'],
  ['Irvine', 'Huntington Beach', 'Costa Mesa'],
  ['Tustin', 'Garden Grove', 'Santa Ana'],
];

/**
 * Renders an editorial, image-led hero with quick booking setup and location cues.
 */
export function HeroSection(): JSX.Element {
  const vehicleTypes = ['Sedan / Coupe', 'Small SUV / Truck', 'Large SUV / Truck', 'Oversized'];
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

      <div className="relative mx-auto flex min-h-[calc(100svh-var(--site-header-height))] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px] lg:items-center">
          <div className="fade-in-up max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Cruizn Clean
            </p>

            <h1 className="mt-5 font-heading text-5xl font-extrabold leading-[0.92] sm:text-6xl lg:text-7xl">
              Memorable detailing without the guesswork.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/82 sm:text-xl">
              A darker, cleaner booking experience for Yorba Linda clients who want sharp pricing, polished results, and less friction between quote, booking, and calendar handoff.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-burgundyAccent"
              >
                Book an Appointment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={SITE_PROFILE.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-burgundy px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundy/10"
              >
                <PhoneCall className="h-4 w-4" />
                {SITE_PROFILE.phoneDisplay}
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Location</p>
                <div
                  className="mt-1 flex items-start gap-2 text-sm font-semibold text-white"
                  aria-label="Available service areas include Yorba Linda, Placentia, Fullerton, Anaheim, Brea, Orange, La Habra, Buena Park, Cypress, Irvine, Huntington Beach, Costa Mesa, Tustin, Garden Grove, and Santa Ana."
                >
                  <MapPin className="h-4 w-4 text-fog" />
                  <span aria-hidden="true" className="service-area-cycle relative inline-grid min-h-[4.45rem] min-w-0 flex-1 overflow-hidden align-top">
                    {SERVICE_AREA_FRAMES.map((frame, index) => (
                      <span
                        key={frame.join('-')}
                        className="service-area-frame col-start-1 row-start-1 flex flex-col gap-1"
                        style={{ animationDelay: `${index * 3}s` }}
                      >
                        {frame.map((city) => (
                          <span key={city} className="leading-tight text-white/90">
                            {city}
                          </span>
                        ))}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Availability</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock3 className="h-4 w-4 text-fog" />
                  Monday-Saturday 8am - 6pm
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Best Fit</p>
                <p className="mt-1 text-sm font-semibold text-white">Maintenance, coatings, and multi-car scheduling</p>
              </div>
            </div>
          </div>

          <aside className="fade-in-up rounded-[28px] border border-line bg-[#141414]/75 p-5 backdrop-blur-md lg:p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-fog" />
              Quick Detail Finder
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-white">Build a cleaner first pass</h2>
            <p className="mt-2 text-sm text-white/68">
              Choose a vehicle type, line up the right package, then refine everything else on Services or Booking.
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Step 1 • Vehicle Type</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {vehicleTypes.map((vehicleType) => (
                  <button
                    key={vehicleType}
                    type="button"
                    onClick={() => setSelectedVehicleType(vehicleType)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      selectedVehicleType === vehicleType
                        ? 'border-burgundyAccent bg-burgundy/30 text-white'
                        : 'border-white/10 bg-white/5 text-white/85 hover:border-burgundyAccent/45 hover:bg-burgundy/10'
                    }`}
                  >
                    {vehicleType}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Step 2 • Package</p>
              <div className="mt-2 space-y-2">
                {detailPlans.map((plan) => (
                  <button
                    key={plan.name}
                    type="button"
                    disabled={!selectedVehicleType}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                      selectedPlan === plan.name
                        ? 'border-burgundyAccent bg-burgundy/30 text-white'
                        : 'border-white/10 bg-white/5 text-white/85'
                    } ${selectedVehicleType ? 'hover:border-burgundyAccent/45 hover:bg-burgundy/10' : 'cursor-not-allowed opacity-45'}`}
                  >
                    <span className="font-semibold">{plan.name}</span>
                    <span className="text-xs font-semibold">{plan.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-xs text-white/70">
              {selectedVehicleType ? (
                <>
                  Vehicle: <span className="font-semibold text-white">{selectedVehicleType}</span>
                  {selectedPlan ? (
                    <>
                      {' '}
                      • Plan: <span className="font-semibold text-white">{selectedPlan}</span>
                    </>
                  ) : null}
                </>
              ) : (
                'Pick a vehicle type first, then choose the package that fits the job.'
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Link
                href={buildPlanHref}
                className="flex items-center justify-center gap-2 rounded-full bg-burgundy px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent"
              >
                Build Service Plan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/faq"
                className="flex items-center justify-center gap-2 rounded-full border border-burgundy bg-white/5 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundy/10"
              >
                Need Help First?
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
