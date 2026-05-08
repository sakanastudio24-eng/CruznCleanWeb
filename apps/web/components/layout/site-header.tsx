'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  FileText,
  Home,
  Image as ImageIcon,
  Phone,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';

import { QuickHelpModal } from '@/components/help/quick-help-modal';
import { useBooking } from '@/components/providers/booking-provider';
import { findServiceById } from '@/lib/services-catalog';
import { SITE_PROFILE } from '@/lib/site-profile';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';
import horizontalLogo from '../../assets/Logos/horizontal-nav-logo-1x.png';

interface NavLinkItem {
  href: string;
  label: string;
}

interface MobileNavItem extends NavLinkItem {
  icon: ComponentType<{ className?: string }>;
}

/**
 * Returns the primary text links shown in desktop and mobile nav.
 */
function getNavLinks(): NavLinkItem[] {
  return [
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
    { href: '/gallery', label: 'Gallery', icon: ImageIcon },
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
  const router = useRouter();
  const links = getNavLinks();
  const mobileLinks = getMobileNavLinks();
  const {
    vehicles,
    getVehicleServices,
    getVehiclePricingBreakdown,
    getGrandPricingBreakdown,
    getVehicleTotal,
    getGrandTotal,
    getSelectedServiceCount,
    toggleServiceForVehicle,
  } = useBooking();
  const selectedServiceCount = getSelectedServiceCount();
  const [cartOpen, setCartOpen] = useState(false);
  const desktopCartRef = useRef<HTMLDivElement>(null);
  const mobileCartRef = useRef<HTMLDivElement>(null);
  const desktopCartSummaryId = 'desktop-cart-summary';
  const mobileCartSummaryId = 'mobile-cart-summary';

  const vehiclesWithSelections = useMemo(
    () => vehicles.filter((vehicle) => getVehicleServices(vehicle.id).length > 0),
    [getVehicleServices, vehicles],
  );
  const grandPricingBreakdown = getGrandPricingBreakdown();
  const hasCartSelections = vehiclesWithSelections.length > 0;

  /**
   * Adds suggested missing services to a specific cart vehicle.
   */
  function applyCartSuggestion(vehicleId: string, serviceIds: string[]): void {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return;
    }

    serviceIds.forEach((serviceId) => {
      const service = findServiceById(serviceId);
      if (service && !vehicle.serviceIds.includes(service.id)) {
        toggleServiceForVehicle(vehicleId, service);
      }
    });
  }

  /**
   * Sends customers to booking only when service selections exist.
   */
  function handleCartBookNow(): void {
    setCartOpen(false);
    router.push(hasCartSelections ? '/booking' : '/services');
  }

  useEffect(() => {
    /**
     * Closes cart panel when pointer clicks outside dropdown container.
     */
    function onPointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      const clickedInsideDesktop = desktopCartRef.current?.contains(target) ?? false;
      const clickedInsideMobile = mobileCartRef.current?.contains(target) ?? false;

      if (!clickedInsideDesktop && !clickedInsideMobile) {
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
      <header className="sticky top-0 z-40 border-b border-line bg-ink/98 backdrop-blur-xl">
        <div className="site-frame grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3">
          <Link href="/" className="shrink-0" aria-label="Cruizn Clean home">
            <Image
              src={horizontalLogo}
              alt="Cruizn Clean"
              className="h-auto max-h-10 w-[156px] object-contain sm:w-[166px] lg:max-h-11 lg:w-[184px]"
              sizes="(max-width: 640px) 156px, (max-width: 1024px) 166px, 184px"
            />
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-8 lg:flex" aria-label="Primary">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-1 text-sm font-medium transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-burgundyAccent/80 after:transition-all after:duration-300 ${
                    active
                      ? 'text-white after:w-full'
                      : 'text-white/70 hover:text-white after:w-0 hover:after:w-full'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center justify-end gap-3 lg:flex" ref={desktopCartRef}>
            <a href={SITE_PROFILE.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-burgundyAccent">
              <Phone className="h-4 w-4" />
              {SITE_PROFILE.phoneDisplay}
            </a>

            <Link
              href="/booking"
              className="group relative overflow-hidden rounded-full bg-burgundy px-7 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-burgundyAccent"
            >
              <span className="relative z-10">Book Now</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <QuickHelpModal />

            <button
              type="button"
              onClick={() => setCartOpen((current) => !current)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-300 hover:bg-burgundy/10 hover:text-burgundyAccent"
              aria-label="Open cart summary"
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              aria-controls={desktopCartSummaryId}
            >
              <ShoppingCart className="h-5 w-5" />
              {selectedServiceCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-white">
                  {selectedServiceCount}
                </span>
              ) : null}
            </button>

            {cartOpen ? (
              <div
                id={desktopCartSummaryId}
                role="region"
                aria-label="Cart summary"
                className="absolute right-6 top-[74px] z-50 w-[330px] rounded-2xl border border-line bg-[#141414] p-4 text-white shadow-2xl"
              >
                <h3 className="font-heading text-lg font-semibold text-white">Cart Summary</h3>

                {vehiclesWithSelections.length === 0 ? (
                  <p className="mt-2 rounded-xl bg-white/5 p-3 text-sm text-white/70">
                    No services selected yet. Choose a package or add-on before booking.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {vehiclesWithSelections.map((vehicle) => {
                      const breakdown = getVehiclePricingBreakdown(vehicle.id);
                      const items = breakdown.serviceLines;
                      return (
                        <article key={vehicle.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="font-semibold text-white">{getVehicleDisplayName(vehicle)}</p>
                          <ul className="mt-2 space-y-1">
                            {items.map((item) => (
                              <li key={item.service.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="text-white/70">{item.service.name}</span>
                                <span className="font-semibold text-white">
                                  {item.discountAmount > 0 ? (
                                    <span className="mr-1 text-[10px] text-white/35 line-through">${item.originalPrice}</span>
                                  ) : null}
                                  ${item.finalPrice}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {breakdown.savingsLines.map((line) => (
                            <div key={line.id} className="mt-2 flex items-center justify-between rounded-lg border border-burgundy/35 bg-burgundy/10 px-2 py-1 text-[11px] font-semibold text-white">
                              <span>{line.label}</span>
                              <span>-${line.amount}</span>
                            </div>
                          ))}
                          {breakdown.suggestion ? (
                            <div className="mt-2 rounded-lg border border-burgundy/35 bg-burgundy/10 px-2 py-2">
                              <p className="text-[11px] font-semibold text-white">{breakdown.suggestion.title}</p>
                              <button
                                type="button"
                                onClick={() => applyCartSuggestion(vehicle.id, breakdown.suggestion?.serviceIds ?? [])}
                                className="mt-1 rounded-full bg-burgundy px-3 py-1 text-[10px] font-bold text-white transition hover:bg-burgundyAccent"
                              >
                                {breakdown.suggestion.actionLabel}
                              </button>
                            </div>
                          ) : null}
                          <p className="mt-2 text-right text-sm font-semibold text-fog">${getVehicleTotal(vehicle.id)}</p>
                        </article>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 border-t border-white/10 pt-3">
                  {grandPricingBreakdown.savingsTotal > 0 ? (
                    <div className="mb-3 space-y-1 rounded-xl border border-burgundy/35 bg-burgundy/10 p-3">
                      {grandPricingBreakdown.savingsLines.map((line, index) => (
                        <div key={`${line.id}-${index}`} className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{line.label}</span>
                          <span>-${line.amount}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-fog">${getGrandTotal()}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/services"
                      onClick={() => setCartOpen(false)}
                      className="rounded-full border border-white/20 px-3 py-2 text-center text-xs font-semibold text-white"
                    >
                      Edit Services
                    </Link>
                    <button
                      type="button"
                      onClick={handleCartBookNow}
                      className="rounded-full bg-burgundy px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-burgundyAccent"
                    >
                      {hasCartSelections ? 'Book Now' : 'Select Services'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-1 lg:hidden" ref={mobileCartRef}>
            <a
              href={SITE_PROFILE.phoneHref}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-300 hover:bg-burgundy/10 hover:text-burgundyAccent"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
            <QuickHelpModal />
            <button
              type="button"
              onClick={() => setCartOpen((current) => !current)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-300 hover:bg-burgundy/10 hover:text-burgundyAccent"
              aria-label="Open cart summary"
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              aria-controls={mobileCartSummaryId}
            >
              <ShoppingCart className="h-5 w-5" />
              {selectedServiceCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-white">
                  {selectedServiceCount}
                </span>
              ) : null}
            </button>

            {cartOpen ? (
              <div
                id={mobileCartSummaryId}
                role="region"
                aria-label="Cart summary"
                className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[95] rounded-2xl border border-line bg-[#141414] p-4 text-white shadow-2xl"
              >
                <h3 className="font-heading text-lg font-semibold text-white">Cart Summary</h3>
                <p className="mt-1 text-xs text-white/60">{vehiclesWithSelections.length} vehicles selected</p>
                {!hasCartSelections ? (
                  <p className="mt-2 rounded-xl bg-white/5 p-3 text-sm text-white/70">
                    No services selected yet. Choose services before booking.
                  </p>
                ) : null}
                {grandPricingBreakdown.savingsTotal > 0 ? (
                  <div className="mt-2 rounded-xl border border-burgundy/35 bg-burgundy/10 p-2 text-xs font-semibold text-white">
                    Savings applied -${grandPricingBreakdown.savingsTotal}
                  </div>
                ) : null}
                <div className="mt-2 border-t border-white/10 pt-2 text-right text-sm font-semibold text-fog">${getGrandTotal()}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href="/services" onClick={() => setCartOpen(false)} className="rounded-full border border-white/20 px-3 py-2 text-center text-xs font-semibold text-white">
                    {hasCartSelections ? 'Edit' : 'Services'}
                  </Link>
                  <button
                    type="button"
                    onClick={handleCartBookNow}
                    className="rounded-full bg-burgundy px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-burgundyAccent"
                  >
                    {hasCartSelections ? 'Book Now' : 'Select Services'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/95 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 backdrop-blur-md lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid w-full max-w-[760px] grid-cols-5 gap-1 px-2 sm:px-4">
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
                      ? 'bg-burgundy text-white shadow-md'
                      : 'bg-white/5 text-white hover:bg-burgundy/20'
                    : active
                      ? 'bg-burgundy text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
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
