import { getHomeProcess } from '@/lib/site-data';

/**
 * Renders the three-step customer journey on the homepage.
 */
export function ProcessSection(): JSX.Element {
  const steps = getHomeProcess();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">How It Works</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-brandBlack sm:text-4xl">Simple flow, clear results</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="fade-in-up rounded-2xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">Step {index + 1}</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-brandBlack">{step.title}</h3>
              <p className="mt-2 text-sm text-brandBlack/70">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
