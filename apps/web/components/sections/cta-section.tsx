import Link from 'next/link';
import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Renders the homepage closing call-to-action block.
 */
export function CtaSection(): JSX.Element {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(140,28,44,0.20),transparent_32%),linear-gradient(180deg,#0d0d0d_0%,#080808_100%)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative grid gap-8 overflow-hidden rounded-[30px] border border-burgundy/45 bg-[#141414] p-6 shadow-[0_22px_70px_rgba(106,15,27,0.16)] backdrop-blur-md before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-burgundyAccent before:to-transparent sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-burgundyAccent/55 bg-burgundy/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fog">
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
                className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-burgundyAccent"
              >
                Continue to Booking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/quote"
                className="rounded-full border border-burgundy/70 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-burgundy/15 hover:text-white"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <article className="rounded-2xl border border-burgundy/25 bg-black/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <CalendarClock className="h-4 w-4 text-burgundyAccent" />
                Intake submitted before scheduling
              </p>
              <p className="mt-1 text-xs text-white/70">Your service selections stay attached to your booking request.</p>
            </article>
            <article className="rounded-2xl border border-burgundy/25 bg-black/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-burgundyAccent" />
                Multi-vehicle workflow ready
              </p>
              <p className="mt-1 text-xs text-white/70">Build and submit multiple cars in one appointment request.</p>
            </article>
            <article className="rounded-2xl border border-burgundy/25 bg-black/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-burgundyAccent" />
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
