'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ANALYTICS_NOTICE_STORAGE_KEY = 'cruizn-clean-analytics-notice-ok-v1';

/**
 * Shows a small, non-blocking analytics transparency notice until acknowledged.
 */
export function AnalyticsNotice(): JSX.Element | null {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(ANALYTICS_NOTICE_STORAGE_KEY) !== 'true');
    } catch {
      setVisible(true);
    }
  }, []);

  function acknowledgeNotice(): void {
    try {
      localStorage.setItem(ANALYTICS_NOTICE_STORAGE_KEY, 'true');
    } catch {
      // The notice can still be dismissed for the current session when storage is unavailable.
    }

    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  const hasMobileFixedCta = pathname === '/services' || pathname === '/booking';
  const mobileBottomClass = hasMobileFixedCta
    ? 'max-lg:bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+8.75rem)]'
    : 'max-lg:bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+0.9rem)]';

  return (
    <section
      role="region"
      aria-label="Analytics privacy notice"
      className={`fixed left-3 right-3 z-[45] rounded-xl border border-burgundyAccent/70 bg-[#101010]/95 p-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-md sm:left-4 sm:right-auto sm:max-w-[23rem] sm:p-4 lg:bottom-5 lg:left-5 ${mobileBottomClass}`}
    >
      <p className="text-sm leading-5 text-white/80">
        We use analytics to improve booking. No private booking details are sold or sent to Google Analytics.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={acknowledgeNotice}
          className="inline-flex min-h-9 items-center justify-center rounded-full bg-burgundy px-4 text-xs font-bold text-white transition hover:bg-burgundyAccent"
          aria-label="Dismiss notice"
        >
          OK
        </button>
        <Link
          href="/privacy"
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/15 px-3 text-xs font-semibold text-white/78 transition hover:border-burgundyAccent hover:bg-burgundy/10 hover:text-white"
        >
          Privacy Policy
        </Link>
        <Link
          href="/privacy"
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/15 px-3 text-xs font-semibold text-white/78 transition hover:border-burgundyAccent hover:bg-burgundy/10 hover:text-white"
        >
          Data Request
        </Link>
      </div>
    </section>
  );
}
