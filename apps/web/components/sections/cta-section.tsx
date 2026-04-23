import Link from 'next/link';
import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Renders the homepage closing call-to-action block.
 */
export function CtaSection(): JSX.Element {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#2c2c2c_0%,#1f1f1f_55%,#0a0a0a_100%)]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fog/20 blur-3xl" />
      <div className="absolute -right-20 bottom-6 h-64 w-64 rounded-full bg-charcoal/30 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative grid gap-8 rounded-[30px] border border-white/20 bg-white/10 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-fog/40 bg-fog/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fog">
              Final Step
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-5xl">
              Ready to lock in your detail?
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              Submit your vehicle and service details first, then finish appointment scheduling in Cal.com with a clean handoff.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-fog"
              >
                Continue to Booking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/quote"
                className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white hover:text-ink"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <article className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <CalendarClock className="h-4 w-4 text-fog" />
                Intake submitted before scheduling
              </p>
              <p className="mt-1 text-xs text-white/70">Your service selections stay attached to your booking request.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-fog" />
                Multi-vehicle workflow ready
              </p>
              <p className="mt-1 text-xs text-white/70">Build and submit multiple cars in one appointment request.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-fog" />
                Professional finish, clear pricing
              </p>
              <p className="mt-1 text-xs text-white/70">Package + add-on totals stay visible throughout checkout.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
