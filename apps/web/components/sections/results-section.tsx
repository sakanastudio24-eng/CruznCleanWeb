import { getHomeResults } from '@/lib/site-data';

/**
 * Renders measurable transformation outcomes for trust-building.
 */
export function ResultsSection(): JSX.Element {
  const results = getHomeResults();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Before + After Outcomes</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-ink sm:text-4xl">Results clients can actually see</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {results.map((item, index) => (
            <article
              key={item.title}
              className="fade-in-up rounded-2xl border border-black/10 bg-canvas p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <h3 className="font-heading text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-ink/75">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
