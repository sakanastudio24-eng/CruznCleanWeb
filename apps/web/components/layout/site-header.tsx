'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Home,
  Image,
  Phone,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';

import { QuickHelpModal } from '@/components/help/quick-help-modal';
import { useBooking } from '@/components/providers/booking-provider';
import { SITE_PROFILE } from '@/lib/site-profile';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

interface NavLinkItem {
  href: string;
  label: string;
  external?: boolean;
}

interface MobileNavItem extends NavLinkItem {
  icon: ComponentType<{ className?: string }>;
}

/**
 * Returns the primary text links shown in desktop and mobile nav.
 */
function getNavLinks(): NavLinkItem[] {
  return [
    { href: 'https://zward.studio', label: 'zward.studio', external: true },
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/quote', label: 'Quote' },
  ];
}

/**
 * Returns the bottom mobile app-style navigation entries.
 */
function getMobileNavLinks(): MobileNavItem[] {
  return [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Sparkles },
    { href: '/gallery', label: 'Gallery', icon: Image },
    { href: '/quote', label: 'Quote', icon: FileText },
    { href: '/booking', label: 'Book', icon: CalendarDays },
  ];
}

/**
 * Resolves route-match state for one navigation link.
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname.startsWith(href);
}

/**
 * Renders desktop and mobile navigation for all public pages.
 */
export function SiteHeader(): JSX.Element {
  const pathname = usePathname();
  const links = getNavLinks();
  const mobileLinks = getMobileNavLinks();
  const {
    vehicles,
    getVehicleServices,
    getVehicleTotal,
    getGrandTotal,
    getSelectedServiceCount,
  } = useBooking();
  const selectedServiceCount = getSelectedServiceCount();
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const desktopCartSummaryId = 'desktop-cart-summary';
  const mobileCartSummaryId = 'mobile-cart-summary';

  const vehiclesWithSelections = useMemo(
    () => vehicles.filter((vehicle) => getVehicleServices(vehicle.id).length > 0),
    [getVehicleServices, vehicles],
  );

  useEffect(() => {
    /**
     * Closes cart panel when pointer clicks outside dropdown container.
     */
    function onPointerDown(event: MouseEvent): void {
      if (!cartRef.current) {
        return;
      }

      if (!cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    }

    /**
     * Closes cart panel when Escape is pressed.
     */
    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setCartOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeydown);
    };
  }, []);

  useEffect(() => {
    setCartOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-md">
        <div className="site-frame grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3">
          <Link href="/" className="brand-mark shrink-0 whitespace-nowrap text-ink">
            <span>{SITE_PROFILE.businessName}</span>
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-8 xl:flex" aria-label="Primary">
            {links.map((link) => {
              if (link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/20 px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-charcoal hover:text-charcoal"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {link.label}
                  </a>
                );
              }

              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-1 text-sm font-medium transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-charcoal after:transition-all after:duration-300 ${
                    active
                      ? 'text-ink after:w-full'
                      : 'text-ink/75 hover:text-ink after:w-0 hover:after:w-full'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center justify-end gap-3 xl:flex" ref={cartRef}>
            <a href={SITE_PROFILE.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-charcoal">
              <Phone className="h-4 w-4" />
              {SITE_PROFILE.phoneDisplay}
            </a>

            <Link
              href="/booking"
              className="group relative overflow-hidden rounded-full bg-charcoal px-7 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#3a3a3a]"
            >
              <span className="relative z-10">Book Now</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <QuickHelpModal />

            <button
              type="button"
              onClick={() => setCartOpen((current) => !current)}
              className="relative rounded-full p-2 text-ink transition duration-300 hover:bg-canvas hover:text-charcoal"
              aria-label="Open cart summary"
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              aria-controls={desktopCartSummaryId}
            >
              <ShoppingCart className="h-5 w-5" />
              {selectedServiceCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-bold text-white">
                  {selectedServiceCount}
                </span>
              ) : null}
            </button>

            {cartOpen ? (
              <div
                id={desktopCartSummaryId}
                role="region"
                aria-label="Cart summary"
                className="absolute right-6 top-[74px] z-50 w-[330px] rounded-2xl border border-black/10 bg-white p-4 shadow-2xl"
              >
                <h3 className="font-heading text-lg font-semibold text-ink">Cart Summary</h3>

                {vehiclesWithSelections.length === 0 ? (
                  <p className="mt-2 rounded-xl bg-canvas p-3 text-sm text-ink/70">
                    No services selected yet. Add services from the Services page.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {vehiclesWithSelections.map((vehicle) => {
                      const items = getVehicleServices(vehicle.id);
                      return (
                        <article key={vehicle.id} className="rounded-xl border border-black/10 p-3">
                          <p className="font-semibold text-ink">{getVehicleDisplayName(vehicle)}</p>
                          <ul className="mt-2 space-y-1">
                            {items.map((item) => (
                              <li key={item.id} className="flex items-center justify-between text-xs">
                                <span className="text-ink/70">{item.name}</span>
                                <span className="font-semibold text-ink">${item.price}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-right text-sm font-semibold text-charcoal">${getVehicleTotal(vehicle.id)}</p>
                        </article>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 border-t border-black/10 pt-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-charcoal">${getGrandTotal()}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/services"
                      onClick={() => setCartOpen(false)}
                      className="rounded-full border border-fog px-3 py-2 text-center text-xs font-semibold text-fog"
                    >
                      Edit Services
                    </Link>
                    <Link
                      href="/booking"
                      onClick={() => setCartOpen(false)}
                      className="rounded-full bg-charcoal px-3 py-2 text-center text-xs font-semibold text-white"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-1 xl:hidden" ref={cartRef}>
            <a
              href="tel:+15551234567"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition duration-300 hover:bg-canvas"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
            <QuickHelpModal />
            <button
              type="button"
              onClick={() => setCartOpen((current) => !current)}
              className="relative rounded-full p-2 text-ink transition duration-300 hover:bg-canvas"
              aria-label="Open cart summary"
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              aria-controls={mobileCartSummaryId}
            >
              <ShoppingCart className="h-5 w-5" />
              {selectedServiceCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-bold text-white">
                  {selectedServiceCount}
                </span>
              ) : null}
            </button>

            {cartOpen ? (
              <div
                id={mobileCartSummaryId}
                role="region"
                aria-label="Cart summary"
                className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[95] rounded-2xl border border-black/10 bg-white p-4 shadow-2xl"
              >
                <h3 className="font-heading text-lg font-semibold text-ink">Cart Summary</h3>
                <p className="mt-1 text-xs text-ink/60">{vehiclesWithSelections.length} vehicles selected</p>
                <div className="mt-2 border-t border-black/10 pt-2 text-right text-sm font-semibold text-charcoal">${getGrandTotal()}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href="/services" onClick={() => setCartOpen(false)} className="rounded-full border border-fog px-3 py-2 text-center text-xs font-semibold text-fog">
                    View
                  </Link>
                  <Link href="/booking" onClick={() => setCartOpen(false)} className="rounded-full bg-charcoal px-3 py-2 text-center text-xs font-semibold text-white">
                    Checkout
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 backdrop-blur-md xl:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid w-full max-w-[760px] grid-cols-6 gap-1 px-2 sm:px-4">
          {mobileLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            const Icon = link.icon;
            const bookingLink = link.href === '/booking';

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`mobile-bottom-nav-item flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all duration-300 ${
                  bookingLink
                    ? active
                      ? 'bg-charcoal text-white shadow-md'
                      : 'bg-charcoal/10 text-charcoal hover:bg-charcoal/20'
                    : active
                      ? 'bg-ink text-white'
                      : 'text-ink/70 hover:bg-canvas hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
