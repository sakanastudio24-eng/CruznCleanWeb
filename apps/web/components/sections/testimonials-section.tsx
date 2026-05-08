import { getHomeTestimonials } from '@/lib/site-data';

/**
 * Renders customer quote highlights with real review ratings.
 */
export function TestimonialsSection(): JSX.Element {
  const testimonials = getHomeTestimonials();

  return (
    <section className="bg-ink py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Client Feedback</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">What clients notice after the work is done</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="fade-in-up rounded-2xl border border-line bg-[#141414] p-6 transition duration-300 hover:-translate-y-1 hover:border-burgundyAccent/45 hover:bg-burgundy/10 hover:shadow-[0_18px_36px_rgba(0,0,0,0.35)]"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-xl font-semibold text-white">{item.name}</p>
                <p className="shrink-0 text-xs font-bold uppercase tracking-[0.15em] text-white">{item.rating}</p>
              </div>
              <p className="mt-5 text-base leading-7 text-white/82">“{item.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
