import Link from 'next/link';

/**
 * Renders the home-only seasonal promotion banner above the hero.
 */
export function SpringPromoBanner(): JSX.Element {
  return (
    <section className="border-b border-burgundy/30 bg-burgundy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Spring detail special: use <span className="tracking-[0.18em]">SPRING20</span> for 20% off eligible services.
        </p>
        <Link
          href="/booking"
          className="inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-xs font-bold text-burgundy transition hover:bg-white/90"
        >
          Book Now
        </Link>
      </div>
    </section>
  );
}
