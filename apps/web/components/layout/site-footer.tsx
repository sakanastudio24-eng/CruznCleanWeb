import Link from 'next/link';

import { CarRunnerMiniGame } from '@/components/layout/car-runner-mini-game';

/**
 * Renders a polished footer with clear navigation and contact details.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="mobile-footer-fullscreen border-t border-white/10 bg-gradient-to-br from-brandBlack via-[#1b1b1b] to-[#121212] text-white">
      <div className="site-frame grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <h2 className="brand-mark text-white">
            <span>DetailFlow</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Premium mobile detailing for daily drivers, enthusiast builds, and multi-vehicle households.
          </p>
          <a href="tel:+15551234567" className="mt-4 inline-block text-sm font-semibold text-waterBlue transition hover:text-white">
            (555) 123-4567
          </a>
        </div>

        <nav aria-label="Footer navigation">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-white/80">Navigate</h3>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <Link href="/" className="text-white/80 transition hover:text-waterBlue">Home</Link>
            <Link href="/services" className="text-white/80 transition hover:text-waterBlue">Services</Link>
            <Link href="/gallery" className="text-white/80 transition hover:text-waterBlue">Gallery</Link>
            <Link href="/quote" className="text-white/80 transition hover:text-waterBlue">Quote</Link>
            <Link href="/booking" className="text-white/80 transition hover:text-waterBlue">Book Now</Link>
            <Link href="/contact" className="text-white/80 transition hover:text-waterBlue">Contact</Link>
            <Link href="/faq" className="text-white/80 transition hover:text-waterBlue">FAQ</Link>
          </div>
        </nav>

        <nav aria-label="Footer legal">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-white/80">Legal</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/privacy" className="text-white/80 transition hover:text-waterBlue">Privacy Policy</Link>
            <Link href="/terms" className="text-white/80 transition hover:text-waterBlue">Terms of Service</Link>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">Business Hours</p>
            <p className="mt-1 text-sm text-white/80">Mon-Sat 8:00AM - 6:00PM</p>
          </div>
        </nav>
      </div>

      <div className="site-frame pb-10">
        <CarRunnerMiniGame />
      </div>

      <div className="border-t border-white/10">
        <div className="site-frame flex flex-col gap-2 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DetailFlow. All rights reserved.</p>
          <p>
            Built with a documentation-first workflow.
            <span className="ml-2 text-white/70">All site photos are open-source demo images (Pexels/Unsplash).</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
