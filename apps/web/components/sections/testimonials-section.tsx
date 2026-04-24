import { getHomeTestimonials } from '@/lib/site-data';

/**
 * Renders customer quote highlights with service context.
 */
export function TestimonialsSection(): JSX.Element {
  const testimonials = getHomeTestimonials();

  return (
    <section className="bg-black py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Client Feedback</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">What clients notice after the work is done</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="fade-in-up rounded-2xl border border-white/10 bg-[#111111] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#161616] hover:shadow-[0_18px_36px_rgba(0,0,0,0.35)]"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Verified Client
                </span>
                <span className="text-2xl leading-none text-white/15">”</span>
              </div>
              <p className="mt-5 text-base leading-7 text-white/82">“{item.quote}”</p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-heading text-xl font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-fog">{item.service}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
