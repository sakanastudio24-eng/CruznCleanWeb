import Link from 'next/link';

import { getHomeServices } from '@/lib/site-data';

/**
 * Renders package cards previewed on the homepage.
 */
export function ServicesSection(): JSX.Element {
  const services = getHomeServices();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="fade-in-up mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Detail Packages</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-ink sm:text-4xl">Choose your service level</h2>
        </div>
        <Link href="/services" className="text-sm font-semibold text-fog transition duration-300 hover:text-ink">
          Full service menu
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="fade-in-up rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fog">from {service.priceFrom}</p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-ink">{service.title}</h3>
            <p className="mt-2 text-sm text-ink/75">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
