import { SiteShell } from '@/components/layout/site-shell';

/**
 * Renders terms of service summary for operational policies.
 */
export default function TermsPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-ink/75">
          Service times are estimates. Final pricing may adjust for condition severity. Cancellation windows
          and arrival policies are shared at booking confirmation.
        </p>
      </section>
    </SiteShell>
  );
}
