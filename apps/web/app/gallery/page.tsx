'use client';

import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

interface GalleryItem {
  id: string;
  label: string;
  category: 'exterior' | 'interior' | 'premium' | 'before-after';
  src: string;
  creditLabel: string;
  creditUrl: string;
}

/**
 * Returns gallery showcase items grouped by category with open-source image credits.
 */
function getGalleryItems(): GalleryItem[] {
  return [
    {
      id: 'g1',
      label: 'Foam wash and paint correction prep',
      category: 'exterior',
      src: 'https://images.pexels.com/photos/29504461/pexels-photo-29504461.jpeg?cs=srgb&dl=pexels-bulat369-1243575272-29504461.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/car-detailing-professional-at-work-in-garage-29504461/',
    },
    {
      id: 'g2',
      label: 'Wheel polish and tire treatment',
      category: 'exterior',
      src: 'https://images.pexels.com/photos/31124682/pexels-photo-31124682.jpeg?cs=srgb&dl=pexels-quentin-martinez-2147503099-31124682.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/close-up-of-car-detailing-in-black-and-white-31124682/',
    },
    {
      id: 'g3',
      label: 'Interior vacuum and console reset',
      category: 'interior',
      src: 'https://images.pexels.com/photos/11139244/pexels-photo-11139244.jpeg?cs=srgb&dl=pexels-moonlightshotz-11139244.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/a-person-buffing-a-car-11139244/',
    },
    {
      id: 'g4',
      label: 'Seat extraction and odor treatment',
      category: 'interior',
      src: 'https://images.pexels.com/photos/409127/pexels-photo-409127.jpeg?cs=srgb&dl=pexels-pixabay-409127.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/black-car-in-close-up-photo-409127/',
    },
    {
      id: 'g5',
      label: 'Premium ceramic coating finish',
      category: 'premium',
      src: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?cs=srgb&dl=pexels-avinashpatel-3802510.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/black-luxury-car-3802510/',
    },
    {
      id: 'g6',
      label: 'Premium trim restoration',
      category: 'premium',
      src: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?cs=srgb&dl=pexels-mikebirdy-1592384.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/parked-gray-mercedes-benz-vehicle-1592384/',
    },
    {
      id: 'g7',
      label: 'Before/after swirl correction set',
      category: 'before-after',
      src: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?cs=srgb&dl=pexels-mikebirdy-358070.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/red-mercedes-benz-car-358070/',
    },
    {
      id: 'g8',
      label: 'Before/after interior deep clean',
      category: 'before-after',
      src: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?cs=srgb&dl=pexels-pixabay-170811.jpg&fm=jpg',
      creditLabel: 'Photo via Pexels',
      creditUrl: 'https://www.pexels.com/photo/black-sedan-170811/',
    },
  ];
}

/**
 * Renders the interactive gallery showcase with category filters.
 */
export default function GalleryPage(): JSX.Element {
  const [filter, setFilter] = useState<'all' | GalleryItem['category']>('all');
  const items = getGalleryItems();

  const visibleItems = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [filter, items],
  );

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#a3a3a322,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Our Work</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Real results from real clients. Every project showcases our precision and care.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="mb-4 text-xs text-brandBlack/60">
          All gallery photos are open-source demo images with source links shown on each card.
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            ['all', 'All Work'],
            ['exterior', 'Exterior'],
            ['interior', 'Interior'],
            ['premium', 'Premium'],
            ['before-after', 'Before/After'],
          ].map(([id, label]) => {
            const selected = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as 'all' | GalleryItem['category'])}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'border-deepRed bg-deepRed text-white shadow-md'
                    : 'border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:bg-waterBlue/10'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems.map((item, index) => (
            <article
              key={item.id}
              className="fade-in-up group relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-brandBlack text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <img src={item.src} alt={item.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-waterBlue">{item.category}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.label}</p>
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
      </section>
    </SiteShell>
  );
}
