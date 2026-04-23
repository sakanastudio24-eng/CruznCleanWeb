import Link from 'next/link';
import Image from 'next/image';

import { getGalleryPreviewItems } from '@/lib/gallery-items';

/**
 * Renders a gallery teaser strip to extend homepage depth.
 */
export function GalleryPreviewSection(): JSX.Element {
  const previewItems = getGalleryPreviewItems();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Our Work</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-ink sm:text-4xl">Recent transformations</h2>
          </div>
          <Link href="/gallery" className="text-sm font-semibold text-charcoal transition duration-300 hover:text-ink">
            View full gallery
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewItems.map((item, index) => (
            <article
              key={item.id}
              className="fade-in-up group relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-ink text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <Image
                src={item.src}
                alt={item.label}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-semibold text-white">{item.label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
