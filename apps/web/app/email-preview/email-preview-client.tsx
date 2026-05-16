'use client';

import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

export type PreviewTab = 'customer' | 'owner';

export interface EmailPreviewConfig {
  title: string;
  subject: string;
  description: string;
  htmlPreview: string;
}

interface EmailPreviewClientProps {
  previews: Record<PreviewTab, EmailPreviewConfig>;
}

/**
 * Renders safe mock previews generated from the active receipt template builders.
 */
export function EmailPreviewClient({ previews }: EmailPreviewClientProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<PreviewTab>('customer');
  const config = previews[activeTab];
  const emailStack = useMemo(
    () => [
      { label: 'Frontend', value: 'Next.js booking flow sends booking details into Stripe Checkout.' },
      { label: 'Webhook', value: 'Stripe checkout.session.completed builds the customer and owner receipt inputs.' },
      { label: 'Delivery', value: 'Resend handles outbound transactional email sends.' },
      { label: 'Rendering', value: 'This preview uses the same active inline HTML builders as the webhook emails.' },
      { label: 'Privacy', value: 'Service address appears in the owner notification only.' },
      { label: 'Mode', value: 'Preview data is fake mock data and does not call provider APIs.' },
    ],
    [],
  );

  return (
    <SiteShell>
      <section className="bg-ink px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Template Preview</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Email Preview Center</h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Public mock previews for template layout reviews. This page does not call private provider APIs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'customer'
                ? 'bg-charcoal text-white'
                : 'border border-black/15 bg-white text-ink hover:border-fog hover:text-fog'
            }`}
          >
            Customer Receipt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'owner'
                ? 'bg-charcoal text-white'
                : 'border border-black/15 bg-white text-ink hover:border-fog hover:text-fog'
            }`}
          >
            Owner Notification
          </button>
        </div>

        <div className="mt-5 grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-ink">{config.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{config.description}</p>
            <div className="mt-4 rounded-xl border border-black/10 bg-canvas/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Subject</p>
              <p className="mt-1 text-sm font-semibold text-ink">{config.subject}</p>
            </div>
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">HTML Preview</p>
              <div
                className="prose prose-sm mt-3 max-w-none text-ink"
                dangerouslySetInnerHTML={{ __html: config.htmlPreview }}
              />
            </div>
          </article>

          <aside className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-ink">Email Stack</h3>
            <p className="mt-2 text-sm text-ink/70">
              Current implementation stack for Stripe receipts and owner notifications.
            </p>
            <ul className="mt-4 grid flex-1 auto-rows-fr gap-2">
              {emailStack.map((item) => (
                <li key={item.label} className="flex h-full flex-col rounded-xl border border-black/10 p-3">
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-1 text-xs text-ink/70">{item.value}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-fog/35 bg-fog/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">Current Mode</p>
              <p className="mt-1 text-sm font-semibold text-ink">Active Webhook Receipt Builders</p>
              <p className="mt-1 text-xs text-ink/70">Provider template IDs are optional and currently not required.</p>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
