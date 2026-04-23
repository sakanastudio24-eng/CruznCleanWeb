import { getHomeTestimonials } from '@/lib/site-data';

/**
 * Renders customer quote highlights with service context.
 */
export function TestimonialsSection(): JSX.Element {
  const testimonials = getHomeTestimonials();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">Client Feedback</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-brandBlack sm:text-4xl">What clients say after delivery</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="fade-in-up rounded-2xl border border-black/10 bg-neutralGray p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <p className="text-base text-brandBlack/80">“{item.quote}”</p>
              <p className="mt-4 font-heading text-xl font-semibold text-brandBlack">{item.name}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-waterBlue">{item.service}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
