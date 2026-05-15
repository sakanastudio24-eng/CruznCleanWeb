'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { trackAnalyticsEvent } from '@/lib/analytics';
import { getServiceAreaCitySummary } from '@/lib/service-area';
import { SITE_PROFILE } from '@/lib/site-profile';

/**
 * Renders a polished footer with clear navigation and contact details.
 */
export function SiteFooter(): JSX.Element {
  const pathname = usePathname();

  return (
    <footer className="mobile-footer-fullscreen border-t border-burgundy/25 bg-ink text-white">
      <div className="site-frame grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <h2 className="brand-mark text-white after:mt-3 after:block after:h-1 after:w-16 after:rounded-full after:bg-burgundy">
            <span>{SITE_PROFILE.businessName}</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Mobile detailing for Yorba Linda and nearby Orange County drivers who want clearer booking, cleaner service menus, and polished results
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/60">{SITE_PROFILE.locationLabel}</p>
          <div className="mt-4 flex flex-col items-start gap-2">
            <a
              href={SITE_PROFILE.phoneHref}
              onClick={() => trackAnalyticsEvent('click_call', { page: pathname, location: 'footer_contact' })}
              className="text-sm font-semibold text-fog transition hover:text-burgundyAccent"
            >
              {SITE_PROFILE.phoneDisplay}
            </a>
            <a href={`mailto:${SITE_PROFILE.supportEmail}`} className="text-sm font-semibold text-fog transition hover:text-burgundyAccent">
              {SITE_PROFILE.supportEmail}
            </a>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Follow us on</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SITE_PROFILE.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  onClick={() =>
                    trackAnalyticsEvent('click_social', {
                      page: pathname,
                      platform: link.platform,
                      location: 'footer',
                      url: link.href,
                    })
                  }
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-burgundyAccent hover:bg-burgundy/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-fog">Navigate</h3>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <Link href="/" className="text-white/80 transition hover:text-burgundyAccent">Home</Link>
            <Link href="/services" className="text-white/80 transition hover:text-burgundyAccent">Services</Link>
            <Link href="/gallery" className="text-white/80 transition hover:text-burgundyAccent">Gallery</Link>
            <Link href="/quote" className="text-white/80 transition hover:text-burgundyAccent">Quote</Link>
            <Link
              href="/booking"
              onClick={() => trackAnalyticsEvent('click_book_now', { page: pathname, location: 'footer_navigation' })}
              className="text-white/80 transition hover:text-burgundyAccent"
            >
              Book Now
            </Link>
            <Link href="/contact" className="text-white/80 transition hover:text-burgundyAccent">Contact</Link>
            <Link href="/faq" className="text-white/80 transition hover:text-burgundyAccent">FAQ</Link>
            <Link href="/terms" className="text-white/80 transition hover:text-burgundyAccent">Terms of Service</Link>
            <Link href="/privacy" className="text-white/80 transition hover:text-burgundyAccent">Privacy Policy</Link>
          </div>
        </nav>

        <div>
          <div className="rounded-xl border border-burgundy/25 bg-burgundy/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-fog">Service Area</p>
            <p className="mt-2 text-sm leading-6 text-white/80">{getServiceAreaCitySummary()}</p>
          </div>

          <div className="mt-4 rounded-xl border border-burgundy/25 bg-burgundy/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-fog">Business Hours</p>
            <p className="mt-1 text-sm text-white/80">{SITE_PROFILE.hoursLabel}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-burgundy/15">
        <div className="site-frame flex flex-col gap-2 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE_PROFILE.businessName} All rights reserved</p>
          <p>Monday-Saturday booking hours: 8am - 6pm</p>
        </div>
      </div>
    </footer>
  );
}
