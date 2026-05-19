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
            <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">Recent work</h2>
          </div>
          <Link href="/gallery" className="text-sm font-semibold text-fog transition duration-300 hover:text-white">
            View full gallery
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {previewItems.map((item, index) => (
            <article
              key={item.id}
              className="fade-in-up group relative aspect-[4/5] overflow-hidden rounded-xl border border-black/10 bg-ink text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4">
                <p className="text-xs font-semibold leading-tight text-white sm:text-sm">{item.label}</p>
                <p className="mt-1 hidden text-xs leading-snug text-white/70 sm:line-clamp-2 sm:block">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
