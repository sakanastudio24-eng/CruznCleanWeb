import { getHomeResults } from '@/lib/site-data';

/**
 * Renders measurable transformation outcomes for trust-building.
 */
export function ResultsSection(): JSX.Element {
  const results = getHomeResults();

  return (
    <section className="bg-ink py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Outcome Highlights</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">Results clients can actually see</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {results.map((item, index) => (
            <article
              key={item.title}
              className="fade-in-up rounded-2xl border border-line bg-[#141414] p-5 transition duration-300 hover:-translate-y-1 hover:border-burgundyAccent/45 hover:bg-burgundy/10 hover:shadow-md"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <h3 className="font-heading text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/74">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
