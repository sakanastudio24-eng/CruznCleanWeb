import { SiteShell } from '@/components/layout/site-shell';

/**
 * Renders internal style guide preview for development alignment.
 */
export default function StyleguidePage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-brandBlack sm:text-4xl">Style Guide</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-deepRed p-4 text-white">Deep Red</div>
          <div className="rounded-xl bg-brandBlack p-4 text-white">Brand Black</div>
          <div className="rounded-xl bg-waterBlue p-4 text-brandBlack">Water Blue</div>
          <div className="rounded-xl bg-neutralGray p-4 text-brandBlack">Neutral Gray</div>
        </div>
      </section>
    </SiteShell>
  );
}
