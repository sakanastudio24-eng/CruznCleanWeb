'use client';

import Link from 'next/link';
import { Calendar, Car, CircleDollarSign, MapPin, Shield, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import { getFaqRecords, type FaqRecord } from '@/lib/faq-data';

interface FaqCategoryChip {
  id: 'all' | FaqRecord['category'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Renders FAQ page with category chips and expandable answers.
 */
export default function FaqPage(): JSX.Element {
  const [category, setCategory] = useState<'all' | FaqRecord['category']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const records = getFaqRecords();

  const visible = useMemo(
    () => (category === 'all' ? records : records.filter((record) => record.category === category)),
    [category, records],
  );
  const chips: FaqCategoryChip[] = [
    { id: 'all', label: 'All Questions', icon: Sparkles },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'service-area', label: 'Service Area', icon: MapPin },
    { id: 'pricing', label: 'Pricing', icon: CircleDollarSign },
    { id: 'preparation', label: 'Preparation', icon: Car },
    { id: 'maintenance', label: 'Maintenance', icon: Shield },
  ];

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-ink px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#a3a3a322,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Get answers to common questions about Cruizn Clean mobile auto detailing services, booking, pricing, and appointment prep.
          </p>
        </div>
      </section>

      <section id="service-readiness" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="gray-panel p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">Service Readiness</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-ink sm:text-3xl">Before We Arrive</h2>
          <p className="mt-2 text-sm text-ink/75">
            Use this quick checklist so your appointment starts on time and your intake details match the service scope.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-burgundy/30 bg-burgundy/10 p-4 md:col-span-2">
              <p className="text-sm font-semibold text-ink">Service Area</p>
              <p className="mt-1 text-sm text-ink/75">
                Online booking covers selected North OC and nearby 926 ZIPs. If your ZIP is outside the service area, request a quote so travel and availability can be reviewed.
              </p>
              <Link href="/quote" className="mt-3 inline-flex rounded-full bg-burgundy px-4 py-2 text-xs font-bold text-white transition hover:bg-burgundyAccent">
                Ask for a Quote
              </Link>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">1. Access + Location</p>
              <p className="mt-1 text-sm text-ink/75">
                Keep the vehicle in an accessible area with at least 8 feet of clearance from nearby vehicles. Share gate, parking, or arrival notes if needed.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">2. Vehicle Prep</p>
              <p className="mt-1 text-sm text-ink/75">
                Remove loose items, valuables, and personal belongings so interior areas are reachable for cleaning and inspection.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">3. Keys</p>
              <p className="mt-1 text-sm text-ink/75">
                Be ready with the keys at the scheduled time and stay clear of the vehicle during service to prevent accidents or injury.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">4. Final Scope</p>
              <p className="mt-1 text-sm text-ink/75">
                Deposit must be confirmed. Final pricing is subject to inspection and can change for incorrect booking details or extended attention.
              </p>
            </article>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/terms"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/booking"
              className="rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a3a3a]"
            >
              Continue to Booking
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap justify-center gap-2">
          {chips.map((chip) => {
            const selected = category === chip.id;
            const ChipIcon = chip.icon;

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategory(chip.id)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'border-white bg-white text-black shadow-md'
                    : 'border-white/15 bg-[#111111] text-white hover:border-white/30 hover:bg-[#161616]'
                }`}
              >
                <ChipIcon className="h-4 w-4" />
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="gray-card mt-8 space-y-3 p-4">
          {visible.map((record) => {
            const isOpen = expanded === record.q;

            return (
              <article key={record.q} className="rounded-xl border border-white/10 bg-[#111111]">
                <button
                  type="button"
                  onClick={() => setExpanded((current) => (current === record.q ? null : record.q))}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink">{record.q}</span>
                  <span className="text-ink/55">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <p className="px-4 pb-4 text-sm text-ink/75">{record.a}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
