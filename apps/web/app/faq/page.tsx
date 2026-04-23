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
    { q: 'How long does a detail take?', a: 'Basic takes 2-3 hours, Standard around 4, and Premium around 6+.', category: 'booking' },
    { q: 'Can I book multiple cars at once?', a: 'Yes. The vehicle dock allows separate selections per car.', category: 'booking' },
    { q: 'What is included in the Standard package?', a: 'Standard includes deep interior reset, wax, clay bar, and a full exterior clean.', category: 'services' },
    { q: 'Do you offer ceramic coating?', a: 'Yes, ceramic coating is available as an add-on or premium bundle.', category: 'services' },
    { q: 'How is final pricing confirmed?', a: 'Final pricing is confirmed on-site based on condition and selected scope.', category: 'pricing' },
    { q: 'Do you need water or power on-site?', a: 'No, mobile service setup is prepared for on-location operation.', category: 'preparation' },
    {
      q: 'How should I prepare my vehicle before appointment time?',
      a: 'Please remove valuables and personal items, unlock the vehicle, and ensure we can access the parked location.',
      category: 'preparation',
    },
    {
      q: 'Do I need to be present for the entire service?',
      a: 'You only need to be available for handoff and completion unless we request access clarification.',
      category: 'preparation',
    },
    { q: 'How often should I detail my vehicle?', a: 'Most clients book maintenance every 4-8 weeks depending on use.', category: 'maintenance' },
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
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#a3a3a322,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Get answers to common questions about our mobile detailing services.
          </p>
        </div>
      </section>

      <section id="service-readiness" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-waterBlue/35 bg-waterBlue/10 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandBlack/60">Service Readiness</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-brandBlack sm:text-3xl">Before We Arrive</h2>
          <p className="mt-2 text-sm text-brandBlack/75">
            Use this quick checklist so your appointment starts on time and your intake details match the service scope.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-brandBlack">1. Access + Location</p>
              <p className="mt-1 text-sm text-brandBlack/75">
                Keep the vehicle in an accessible area and share gate/parking notes in booking details if needed.
              </p>
            </article>
            <article className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-brandBlack">2. Vehicle Prep</p>
              <p className="mt-1 text-sm text-brandBlack/75">
                Remove valuables and personal items so interior areas are fully reachable for cleaning.
              </p>
            </article>
            <article className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-brandBlack">3. Handoff</p>
              <p className="mt-1 text-sm text-brandBlack/75">
                Be available for start-time handoff and final walk-through so we can confirm results and payment.
              </p>
            </article>
            <article className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-brandBlack">4. Final Scope</p>
              <p className="mt-1 text-sm text-brandBlack/75">
                Final pricing is confirmed on-site from actual condition and selected package/add-ons.
              </p>
            </article>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/terms"
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-brandBlack transition hover:border-waterBlue hover:text-waterBlue"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/booking"
              className="rounded-full bg-deepRed px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a3a3a]"
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
                    ? 'border-deepRed bg-deepRed text-white shadow-md'
                    : 'border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:bg-waterBlue/10'
                }`}
              >
                <ChipIcon className="h-4 w-4" />
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3 rounded-2xl border border-black/10 bg-white p-4">
          {visible.map((record) => {
            const isOpen = expanded === record.q;

            return (
              <article key={record.q} className="rounded-xl border border-black/10 bg-white">
                <button
                  type="button"
                  onClick={() => setExpanded((current) => (current === record.q ? null : record.q))}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-brandBlack">{record.q}</span>
                  <span className="text-brandBlack/55">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <p className="px-4 pb-4 text-sm text-brandBlack/75">{record.a}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
