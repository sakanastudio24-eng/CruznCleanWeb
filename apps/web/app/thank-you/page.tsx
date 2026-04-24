import Link from 'next/link';
import { ArrowRight, CalendarCheck, MailCheck, ShieldCheck } from 'lucide-react';

import { SiteShell } from '@/components/layout/site-shell';
import { SITE_PROFILE } from '@/lib/site-profile';

/**
 * Confirms the customer has returned from Cal.com after completing scheduling.
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
            Cal.com will send the final confirmation after your date, time, and deposit are completed. Cruzn Clean will use
            your saved intake to prepare the right service plan for your vehicle.
          </p>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <article className="gray-card p-5">
              <MailCheck className="h-6 w-6 text-white/80" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-white">Watch your inbox</h2>
              <p className="mt-2 text-sm text-white/70">
                Your Cal.com confirmation email includes the appointment details and any deposit receipt handled through Cal.com.
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
