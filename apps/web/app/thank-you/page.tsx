import Link from 'next/link';
import { ArrowRight, CalendarCheck, CarFront, MailCheck, ShieldCheck } from 'lucide-react';

import { SiteShell } from '@/components/layout/site-shell';
import { SITE_PROFILE } from '@/lib/site-profile';

/**
 * Confirms the customer has returned after completing scheduling and deposit payment.
 */
export default function ThankYouPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_62%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            <CalendarCheck className="h-4 w-4" />
            Booking Flow Complete
          </p>
          <h1 className="mt-5 font-heading text-4xl font-semibold sm:text-5xl">Thanks. Your appointment is being confirmed.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/72 sm:text-lg">
            Your intake, calendar selection, and Stripe deposit are complete. Cruizn Clean will use your saved details to
            prepare the right service plan for your vehicle.
          </p>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <article className="gray-card p-5">
              <MailCheck className="h-6 w-6 text-white/80" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-white">Watch your inbox</h2>
              <p className="mt-2 text-sm text-white/70">
                Your confirmation email includes the appointment details. Stripe will provide the deposit receipt separately.
              </p>
            </article>
            <article className="gray-card p-5">
              <ShieldCheck className="h-6 w-6 text-white/80" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-white">Prepare the vehicle</h2>
              <p className="mt-2 text-sm text-white/70">
                Remove personal items before arrival. Final pricing is confirmed after the vehicle condition and size are reviewed.
              </p>
            </article>
          </div>

          <div className="gray-card mt-6 p-5 text-left">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-burgundy/20 p-2 text-burgundyAccent">
                <CarFront className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Service Requirements</p>
                <h2 className="font-heading text-xl font-semibold text-white">Before your appointment</h2>
              </div>
            </div>
            <ul className="mt-4 grid gap-3 text-sm text-white/72 sm:grid-cols-2">
              <li className="rounded-xl border border-line bg-[#141414] p-3">Loose items and personal belongings must be removed from the vehicle.</li>
              <li className="rounded-xl border border-line bg-[#141414] p-3">Park in an accessible location with at least 8 feet of clearance from other vehicles.</li>
              <li className="rounded-xl border border-line bg-[#141414] p-3">Please stay clear of the vehicle during service to help prevent accidents or injury.</li>
              <li className="rounded-xl border border-line bg-[#141414] p-3">Be ready for key handoff and service at the scheduled time.</li>
              <li className="rounded-xl border border-line bg-[#141414] p-3">Deposit confirmation is required before the appointment is locked in.</li>
              <li className="rounded-xl border border-burgundy/35 bg-burgundy/10 p-3">Final quote may change after inspection for incorrect booking details or extended attention.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-fog"
            >
              Review Services <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE_PROFILE.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Call {SITE_PROFILE.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
