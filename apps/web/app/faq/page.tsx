'use client';

import Link from 'next/link';
import { Calendar, Car, CircleDollarSign, Shield, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

interface FaqRecord {
  q: string;
  a: string;
  category: 'booking' | 'services' | 'pricing' | 'preparation' | 'maintenance';
}

interface FaqCategoryChip {
  id: 'all' | FaqRecord['category'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Returns FAQ records used by category filtering.
 */
function getFaqRecords(): FaqRecord[] {
  return [
    { q: 'How many vehicles can I submit in one day?', a: 'The booking flow supports up to 4 vehicles per customer per day, and actual capacity depends on the length of the selected services.', category: 'booking' },
    { q: 'What are your booking hours?', a: 'Standard booking hours are Monday through Friday from 8am to 6pm. Weekend requests are reviewed manually and may be reserved for business maintenance or advertising work.', category: 'booking' },
    { q: 'How long do the main services take?', a: 'Maintenance Detail is roughly 90 minutes. Full Interior or Full Exterior is about 3 hours. A Full Reset usually lands around 6 to 8 hours depending on condition.', category: 'services' },
    { q: 'Can I book coatings or paint correction without a detail package?', a: 'Yes. Protection and correction services can be booked on their own, though final prep requirements are confirmed after inspection.', category: 'services' },
    { q: 'How does pricing change by vehicle size?', a: 'Listed pricing starts with sedans and coupes. Small SUVs and trucks add 20%, large SUVs and trucks add 40%, and vans or very lifted vehicles add 50%.', category: 'pricing' },
    { q: 'How is final pricing confirmed?', a: 'Final pricing is confirmed after inspection and may increase for larger vehicles, excess dirt, pet hair, staining, ride height, or condition-related labor.', category: 'pricing' },
    { q: 'Do you need water or power on-site?', a: 'Share site access notes during booking. If there are location constraints, gate details, or setup limits, include them in your notes so the appointment can be approved correctly.', category: 'preparation' },
    {
      q: 'How should I prepare my vehicle before appointment time?',
      a: 'Please remove personal belongings before arrival. Full compartments will not be cleaned, and handoff access should be ready when the appointment begins.',
      category: 'preparation',
    },
    {
      q: 'What should I know about coatings and correction results?',
      a: 'Paint correction improves defects but may not remove every scratch or imperfection. Ceramic coating longevity depends on aftercare and environmental exposure.',
      category: 'preparation',
    },
    { q: 'How often should I book a maintenance detail?', a: 'Most maintained vehicles benefit from recurring service every 4 to 8 weeks, depending on driving conditions and storage habits.', category: 'maintenance' },
    { q: 'What payment methods do you accept?', a: 'Cash, Zelle, Venmo, Cash App, and PayPal are accepted. Debit and credit support may be added later through the booking site.', category: 'maintenance' },
  ];
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
            Get answers to common questions about our mobile detailing services.
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
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">1. Access + Location</p>
              <p className="mt-1 text-sm text-ink/75">
                Keep the vehicle in an accessible area and share gate, parking, or arrival notes in booking details if needed.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">2. Vehicle Prep</p>
              <p className="mt-1 text-sm text-ink/75">
                Remove valuables and personal items so interior areas are reachable for cleaning and inspection.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">3. Handoff</p>
              <p className="mt-1 text-sm text-ink/75">
                Be available for start-time handoff and final walk-through so results, pricing, and payment can be confirmed.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <p className="text-sm font-semibold text-ink">4. Final Scope</p>
              <p className="mt-1 text-sm text-ink/75">
                Final pricing is confirmed on-site from actual condition, vehicle size, and selected service scope.
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
