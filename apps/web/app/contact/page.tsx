'use client';

import { useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import type { ContactForm } from '@/lib/booking-types';
import { submitContactMessage } from '@/lib/api-client';
import { SITE_PROFILE } from '@/lib/site-profile';

const INITIAL_CONTACT: ContactForm = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

/**
 * Renders question-only contact form separate from booking flow.
 */
export default function ContactPage(): JSX.Element {
  const [form, setForm] = useState<ContactForm>(INITIAL_CONTACT);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * Updates one contact field while preserving the remaining values.
   */
  function updateField<K extends keyof ContactForm>(key: K, value: ContactForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  /**
   * Submits non-booking contact questions to backend.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage('Sending your message...');

    try {
      await submitContactMessage(form);
      setForm(INITIAL_CONTACT);
      setStatusMessage('Message sent. We will respond as soon as possible.');
    } catch {
      setStatusMessage('Message failed to send. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="bg-ink px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Contact</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Questions before booking?</h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Use this form for general questions about service areas, timing, or prep. For appointments, use Book Now.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">{SITE_PROFILE.locationLabel}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <label className="block text-sm font-medium text-ink">
            Full Name
            <input
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
              required
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
              required
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Phone
            <input
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
              placeholder="Optional"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Question
            <textarea
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              className="mt-1 min-h-32 w-full rounded-lg border border-black/15 px-3 py-2"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-charcoal px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Send Question'}
          </button>

          {statusMessage ? <p className="text-sm text-ink/75">{statusMessage}</p> : null}
        </form>
      </section>
    </SiteShell>
  );
}
