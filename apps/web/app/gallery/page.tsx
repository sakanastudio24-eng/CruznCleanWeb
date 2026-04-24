'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import { getGalleryItems, type GalleryCategory } from '@/lib/gallery-items';

/**
 * Renders the interactive gallery showcase with local image filters.
 */
export default function GalleryPage(): JSX.Element {
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all');
  const items = getGalleryItems();

  const visibleItems = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [filter, items],
  );

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-ink px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#a3a3a322,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Our Work</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Real work from Cruzn Clean service categories, grouped by exterior, interior, wheels, and specialty results.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {[
            ['all', 'All Work'],
            ['exterior', 'Exterior'],
            ['interior', 'Interior'],
            ['wheels-tires', 'Wheels + Tires'],
            ['specialty', 'Specialty'],
          ].map(([id, label]) => {
            const selected = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as 'all' | GalleryCategory)}
                aria-pressed={selected}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'border-white bg-white text-black shadow-md'
                    : 'border-white/15 bg-[#111111] text-white hover:border-white/30 hover:bg-[#161616]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {visibleItems.map((item, index) => (
            <article
              key={item.id}
              className="fade-in-up group relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-ink text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <Image
                src={item.src}
                alt={item.label}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fog">{item.category.replace('-', ' ')}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.label}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
