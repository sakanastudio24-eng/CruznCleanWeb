import { SiteShell } from '@/components/layout/site-shell';
import { SITE_PROFILE } from '@/lib/site-profile';

/**
 * Renders the production-style privacy policy draft for V1 launch review.
 */
export default function PrivacyPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-12">
        <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-ink/70">Last updated: February 14, 2026</p>
          <p className="mt-1 text-xs text-ink/60">
            Revision note: Initial production-style draft for legal review before public launch.
          </p>

          <section className="mt-8 space-y-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">1. Data We Collect</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Booking details (name, email, phone, ZIP code, vehicle details, selected services, intake notes).</li>
              <li>Contact-form details (name, email, phone, message content).</li>
              <li>Communication preferences (email confirmations, SMS preference, SMS consent acknowledgment).</li>
              <li>Operational metadata (submission timestamps and booking identifiers).</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">2. Why We Process Data</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>To process booking requests and prepare service operations.</li>
              <li>To send transactional confirmations and owner notifications.</li>
              <li>To respond to customer questions submitted through the contact form.</li>
              <li>To maintain service reliability through operational logging and troubleshooting.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">3. Service Providers</h2>
            <p className="text-sm text-ink/80">
              We use third-party processors to run business operations. Current processors include:
            </p>
            <p className="text-sm text-ink/80">
              We use third-party service providers, including Resend (email delivery) and Cal.com (scheduling),
              to process bookings and send confirmations. These providers process data solely to deliver our services.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Resend (transactional email delivery and template management).</li>
              <li>Cal.com (appointment scheduling).</li>
              <li>Hosting provider(s) for frontend and backend infrastructure (for example, Vercel/local infrastructure).</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">4. Retention</h2>
            <p className="text-sm text-ink/80">
              For V1 local storage operations, records are stored in JSON files and retained for operational review,
              customer support, and business recordkeeping:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>
                <code>data/bookings.json</code>: booking intake submissions.
              </li>
              <li>
                <code>data/contacts.json</code>: contact form submissions.
              </li>
              <li>
                <code>data/email_failures.json</code>: failed email send attempts and retry status.
              </li>
            </ul>
            <p className="text-sm text-ink/80">
              Formal retention periods will be finalized during legal and compliance review.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">5. Communications and Consent</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Email confirmations are transactional and sent when selected by the customer.</li>
              <li>SMS is currently preference-and-consent capture only for V1 (no SMS delivery in this phase).</li>
              <li>SMS consent is required before SMS confirmation preference can be submitted.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">6. Data Rights and Contact</h2>
            <p className="text-sm text-ink/80">
              Rights request and privacy contact channels will be finalized before public launch:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Privacy email placeholder: <code>privacy@cruznclean.com</code></li>
              <li>Business contact placeholder: <code>{SITE_PROFILE.supportEmail}</code></li>
            </ul>
            <p className="text-sm text-ink/80">
              This policy draft is not legal advice and is pending attorney review.
            </p>
          </section>
        </article>
      </section>
    </SiteShell>
  );
}
