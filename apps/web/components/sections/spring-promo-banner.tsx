/**
 * Renders the home-only seasonal promotion banner above the hero.
 */
export function SpringPromoBanner(): JSX.Element {
  return (
    <section className="border-b border-burgundy/45 bg-[radial-gradient(circle_at_50%_0%,rgba(140,28,44,0.48),transparent_42%),linear-gradient(90deg,#0D0D0D_0%,#6A0F1B_50%,#0D0D0D_100%)] text-white shadow-[0_18px_50px_rgba(106,15,27,0.2)]">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3 sm:px-6">
        <p className="promo-racing-sans text-center text-sm font-bold uppercase text-white sm:text-base">
          Spring launch offer: save 15% on eligible services with code <span className="text-white">SPRING15</span>.
        </p>
      </div>
    </section>
  );
}
