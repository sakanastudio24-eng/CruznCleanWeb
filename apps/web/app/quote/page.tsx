'use client';

import { Clock3, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import type { ContactForm } from '@/lib/booking-types';
import { submitContactMessage } from '@/lib/api-client';

/**
 * Renders a custom quote request form with business contact side panel.
 */
export default function QuotePage(): JSX.Element {
  const [form, setForm] = useState<ContactForm>({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * Submits quote request payload through contact message endpoint.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      await submitContactMessage({ ...form, message: `[QUOTE REQUEST] ${form.message}` });
      setStatusMessage('Quote request sent. We will reply within 24 hours.');
      setForm({ fullName: '', email: '', phone: '', message: '' });
    } catch {
      setStatusMessage('Quote request failed. Please retry.');
    }
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#a3a3a322,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Request a Custom Quote</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Tell us about your vehicle and services needed. We will respond with a tailored estimate.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-semibold text-brandBlack">Personal Information</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-brandBlack/75">
              Full Name *
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="John Doe"
                required
              />
            </label>
            <label className="text-sm font-semibold text-brandBlack/75">
              Email *
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="john@example.com"
                required
              />
            </label>
            <label className="text-sm font-semibold text-brandBlack/75">
              Phone *
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="(555) 123-4567"
                required
              />
            </label>
            <label className="text-sm font-semibold text-brandBlack/75">
              Address *
              <input className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2" placeholder="123 Main St, City, ST" required />
            </label>
          </div>

          <h3 className="mt-6 font-heading text-2xl font-semibold text-brandBlack">Vehicle + Service Request</h3>
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="mt-2 min-h-40 w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Vehicle year, make, model, color, service goals, and any condition notes"
            required
          />

          <button type="submit" className="mt-4 w-full rounded-full bg-deepRed px-5 py-3 text-sm font-semibold text-white transition hover:bg-brandBlack">
            Submit Quote Request
          </button>

          {statusMessage ? <p className="mt-3 text-sm text-brandBlack/70">{statusMessage}</p> : null}
        </form>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="inline-flex rounded-full bg-waterBlue/15 p-2 text-waterBlue">
              <Phone className="h-5 w-5" />
            </div>
            <p className="mt-3 font-heading text-xl font-semibold text-brandBlack">Call us</p>
            <a href="tel:+15551234567" className="mt-1 block text-deepRed">(555) 123-4567</a>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="inline-flex rounded-full bg-waterBlue/15 p-2 text-waterBlue">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-3 font-heading text-xl font-semibold text-brandBlack">Email</p>
            <p className="mt-1 text-brandBlack/75">info@detailflow.com</p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="inline-flex rounded-full bg-waterBlue/15 p-2 text-waterBlue">
              <Clock3 className="h-5 w-5" />
            </div>
            <p className="mt-3 font-heading text-xl font-semibold text-brandBlack">Business Hours</p>
            <p className="mt-1 text-brandBlack/75">Mon-Sat 8AM - 6PM</p>
          </article>
        </aside>
      </section>
    </SiteShell>
  );
}
