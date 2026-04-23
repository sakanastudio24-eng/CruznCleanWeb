import Link from 'next/link';

interface GalleryPreviewItem {
  title: string;
  src: string;
  creditLabel: string;
  creditUrl: string;
}

const PREVIEW_ITEMS: GalleryPreviewItem[] = [
  {
    title: 'Exterior correction and wheel detail',
    src: 'https://images.pexels.com/photos/31124682/pexels-photo-31124682.jpeg?cs=srgb&dl=pexels-quentin-martinez-2147503099-31124682.jpg&fm=jpg',
    creditLabel: 'Photo via Pexels',
    creditUrl: 'https://www.pexels.com/photo/close-up-of-car-detailing-in-black-and-white-31124682/',
  },
  {
    title: 'Paint polishing in progress',
    src: 'https://images.pexels.com/photos/35149468/pexels-photo-35149468.jpeg?cs=srgb&dl=pexels-papaz-35149468.jpg&fm=jpg',
    creditLabel: 'Photo via Pexels',
    creditUrl: 'https://www.pexels.com/photo/auto-detailing-with-power-polisher-in-workshop-35149468/',
  },
  {
    title: 'Foam wash preparation',
    src: 'https://images.pexels.com/photos/29504461/pexels-photo-29504461.jpeg?cs=srgb&dl=pexels-bulat369-1243575272-29504461.jpg&fm=jpg',
    creditLabel: 'Photo via Pexels',
    creditUrl: 'https://www.pexels.com/photo/car-detailing-professional-at-work-in-garage-29504461/',
  },
  {
    title: 'Finish and gloss correction',
    src: 'https://images.pexels.com/photos/11139244/pexels-photo-11139244.jpeg?cs=srgb&dl=pexels-moonlightshotz-11139244.jpg&fm=jpg',
    creditLabel: 'Photo via Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-person-buffing-a-car-11139244/',
  },
];

/**
 * Renders a gallery teaser strip to extend homepage depth.
 */
export function GalleryPreviewSection(): JSX.Element {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">Our Work</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-brandBlack sm:text-4xl">Recent transformations</h2>
          </div>
          <Link href="/gallery" className="text-sm font-semibold text-deepRed transition duration-300 hover:text-brandBlack">
            View full gallery
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className="fade-in-up group relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-brandBlack text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <img src={item.src} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <a
                  href={item.creditUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-waterBlue underline-offset-2 transition hover:text-white hover:underline"
                >
                  {item.creditLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
