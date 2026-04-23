import { SiteShell } from '@/components/layout/site-shell';

/**
 * Renders internal style guide preview for development alignment.
 */
export default function StyleguidePage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">Style Guide</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-charcoal p-4 text-white">Charcoal</div>
          <div className="rounded-xl bg-ink p-4 text-white">Ink</div>
          <div className="rounded-xl bg-fog p-4 text-ink">Fog</div>
          <div className="rounded-xl bg-canvas p-4 text-ink">Canvas</div>
        </div>
      </section>
    </SiteShell>
  );
}
