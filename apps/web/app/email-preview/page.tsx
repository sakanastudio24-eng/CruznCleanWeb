'use client';

import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

type PreviewTab = 'customer' | 'owner';

interface EmailPreviewConfig {
  title: string;
  subject: string;
  description: string;
  htmlPreview: string;
}

/**
 * Returns static mock previews for customer and owner transactional templates.
 */
function getPreviewConfigs(): Record<PreviewTab, EmailPreviewConfig> {
  return {
    customer: {
      title: 'Customer Confirmation Preview',
      subject: 'Cruzn Clean order confirmation',
      description: 'Sent when customer email confirmation preference is enabled.',
      htmlPreview:
        "<div style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111111;'>" +
        "<div style='max-width:700px;margin:0 auto;padding:24px 16px;'>" +
        "<div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;'>" +
        "<div style='background:#111111;padding:16px 20px;'>" +
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'><tr>" +
        "<td style='color:#ffffff;font-size:22px;font-weight:700;'>Cruzn Clean</td>" +
        "<td style='text-align:right;font-size:12px;'>" +
        "<a href='https://www.cruznclean.com' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Home</a>" +
        "<a href='https://www.cruznclean.com/services' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Services</a>" +
        "<a href='https://www.cruznclean.com/booking' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Book</a>" +
        '</td></tr></table></div>' +
        "<div style='padding:20px;'>" +
        "<p style='margin:0;font-size:12px;color:#6b7280;'>Order Number</p>" +
        "<p style='margin:4px 0 0 0;font-size:16px;font-weight:700;color:#2f2f2f;'>bk_ab12cd34ef56</p>" +
        "<p style='margin:4px 0 0 0;font-size:13px;color:#374151;'>Order Name: Jordan Cruz</p>" +
        "<div style='margin-top:18px;padding:14px;border:1px solid #d1d5db;background:#f3f4f6;border-radius:10px;'>" +
        "<p style='margin:0;font-size:28px;font-weight:800;color:#374151;'>THANK YOU ✓</p>" +
        "<p style='margin:6px 0 0 0;font-size:13px;color:#374151;'>Your booking intake has been confirmed.</p>" +
        '</div>' +
        "<h2 style='margin:18px 0 8px 0;font-size:18px;color:#111111;'>Receipt</h2>" +
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Name</td><td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>Jordan Cruz</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Address</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>123 Main St, Los Angeles, CA 90210</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Number</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>(555) 123-4567</td></tr>" +
        '</table>' +
        "<div style='margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>" +
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
        "<tr><td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;'>Service</td><td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;text-align:right;'>Cost</td></tr>" +
        "<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;'>Vehicle 1 - 2022 Tesla Model 3 (White) - Maintenance Detail</td><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;text-align:right;'>$99</td></tr>" +
        "<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;'>Vehicle 1 - 2022 Tesla Model 3 (White) - 3 Year Ceramic Coating</td><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;text-align:right;'>$499</td></tr>" +
        "<tr><td style='padding:8px;background:#f9fafb;font-size:13px;font-weight:700;'>Service charge cost</td><td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>$99</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;font-weight:700;'>Other services</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>$499</td></tr>" +
        "<tr><td style='padding:10px;background:#2f2f2f;color:#ffffff;font-size:14px;font-weight:800;'>Total amount due</td><td style='padding:10px;background:#2f2f2f;color:#ffffff;font-size:14px;font-weight:800;text-align:right;'>$598</td></tr>" +
        '</table></div>' +
        "<div style='margin-top:14px;padding:12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:10px;'>" +
        "<p style='margin:0;font-size:13px;font-weight:700;color:#2f2f2f;'>Payment info</p>" +
        "<p style='margin:6px 0 0 0;font-size:13px;color:#2f2f2f;'>A non-refundable deposit of $25-$100 may be required to secure your appointment and is applied toward the total service cost.</p>" +
        '</div>' +
        "<p style='margin:14px 0 0 0;font-size:13px;'>" +
        "<a href='https://www.cruznclean.com/terms' style='color:#2f2f2f;font-weight:700;text-decoration:none;'>Terms & Conditions</a> | " +
        "<a href='https://www.cruznclean.com/faq#service-readiness' style='color:#2f2f2f;font-weight:700;text-decoration:none;'>Service Readiness</a></p>" +
        "<p style='margin:10px 0 0 0;font-size:13px;color:#374151;'>For any inquiries call/email: (555) 123-4567 | hello@cruznclean.com</p>" +
        '</div></div></div></div>',
    },
    owner: {
      title: 'Owner Notification Preview',
      subject: 'New Booking Confirmed — Maintenance Detail — June 14',
      description: 'Sent to owner after booking confirmation.',
      htmlPreview:
        "<div style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111111;'>" +
        "<div style='max-width:700px;margin:0 auto;padding:24px 16px;'>" +
        "<div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;'>" +
        "<div style='background:#111111;padding:16px 20px;'>" +
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'><tr>" +
        "<td style='color:#ffffff;font-size:22px;font-weight:700;'>Cruzn Clean</td>" +
        "<td style='text-align:right;font-size:12px;color:#e5e7eb;'>Owner Alert</td>" +
        '</tr></table></div>' +
        "<div style='padding:20px;'>" +
        "<p style='margin:0;font-size:23px;font-weight:800;color:#2f2f2f;'>New Booking Confirmed<br/>Maintenance Detail — June 14</p>" +
        "<p style='margin:8px 0 0 0;font-size:13px;color:#374151;'>This owner notification is sent after booking confirmation.</p>" +
        "<div style='margin-top:16px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>" +
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Customer name</td><td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>Jordan Cruz</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Phone</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>(555) 123-4567</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Email</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>jordan@example.com</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Service</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>Maintenance Detail, 3 Year Ceramic Coating</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Date/time (timezone)</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>June 14, 2026 at 04:30 PM (UTC)</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Notes</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>Please call on arrival.</td></tr>" +
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Booking ID</td><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;color:#2f2f2f;font-weight:700;'>bk_ab12cd34ef56</td></tr>" +
        '</table></div>' +
        "<div style='margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>" +
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
        "<tr><td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;'>Service Line</td><td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;text-align:right;'>Cost</td></tr>" +
        "<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;'>Vehicle 1 - 2022 Tesla Model 3 (White) - Maintenance Detail</td><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;text-align:right;'>$99</td></tr>" +
        "<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;'>Vehicle 1 - 2022 Tesla Model 3 (White) - 3 Year Ceramic Coating</td><td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#111111;font-size:13px;text-align:right;'>$499</td></tr>" +
        '</table></div>' +
        "<p style='margin:12px 0 0 0;font-size:13px;'><a href='https://www.cruznclean.com/admin/bookings/bk_ab12cd34ef56' style='color:#2f2f2f;font-weight:700;text-decoration:none;'>Manage Booking</a></p>" +
        '</div></div></div></div>',
    },
  };
}

/**
 * Renders a public mock email preview page for template design reviews.
 */
export default function EmailPreviewPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<PreviewTab>('customer');
  const previews = useMemo(() => getPreviewConfigs(), []);
  const config = previews[activeTab];
  const emailStack = [
    { label: 'Frontend', value: 'Next.js booking flow submits to FastAPI.' },
    { label: 'Intake API', value: 'POST /cal-bookings validates and stores bookings.' },
    { label: 'Delivery', value: 'Resend handles outbound transactional email sends.' },
    { label: 'Rendering', value: 'Inline HTML + text fallback is used (no template IDs required).' },
    { label: 'Policy', value: 'Owner email always attempts; customer email sends only on opt-in.' },
    { label: 'Observability', value: 'Failed sends are logged to data/email_failures.json.' },
  ];

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
            Customer Confirmation
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
              Current implementation stack for booking confirmations and owner notifications.
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
              <p className="mt-1 text-sm font-semibold text-ink">Inline Styled Fallback Emails</p>
              <p className="mt-1 text-xs text-ink/70">Provider template IDs are optional and currently not required.</p>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
