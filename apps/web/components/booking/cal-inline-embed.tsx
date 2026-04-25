'use client';

import { useEffect, useMemo, useState } from 'react';

const CAL_EMBED_SCRIPT_SRC = 'https://app.cal.com/embed/embed.js';
const CAL_EMBED_ORIGIN = 'https://app.cal.com';

type CalArgument = string | Record<string, unknown> | undefined;
type CalQueueFunction = ((...args: CalArgument[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, CalQueueFunction>;
  q?: CalArgument[][];
};

declare global {
  interface Window {
    Cal?: CalQueueFunction;
  }
}

interface CalInlineEmbedProps {
  bookingId: string;
  calLink: string;
  customerName: string;
  email: string;
  phone: string;
  estimatedTotal: number;
  vehicleCount: number;
  servicesSummary: string;
  fallbackUrl: string;
}

/**
 * Resolves the namespace Cal.com expects from the final segment of an event link.
 */
function getCalNamespace(calLink: string): string {
  const segments = calLink.split('/').map((segment) => segment.trim()).filter(Boolean);
  return segments.at(-1) || 'cruzn-clean-booking';
}

/**
 * Builds one DOM-safe ID for the inline calendar mount element.
 */
function createMountId(namespace: string): string {
  const safeNamespace = namespace.replace(/[^a-zA-Z0-9_-]/g, '-');
  return `cal-inline-${safeNamespace}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Formats common US phone input into the E.164-style value Cal.com expects.
 */
function getCalPhoneLocation(phone: string): string {
  const trimmedPhone = phone.trim();
  const numericPhone = trimmedPhone.replace(/\D/g, '');

  if (trimmedPhone.startsWith('+') && numericPhone.length >= 10) {
    return `+${numericPhone}`;
  }

  if (numericPhone.length === 10) {
    return `+1${numericPhone}`;
  }

  if (numericPhone.length === 11 && numericPhone.startsWith('1')) {
    return `+${numericPhone}`;
  }

  return '';
}

/**
 * Installs Cal.com's queueing embed loader without using raw inline script tags.
 */
function ensureCalEmbedApi(): CalQueueFunction {
  if (window.Cal) {
    return window.Cal;
  }

  const documentRef = window.document;
  const calApi = function calApi(...args: CalArgument[]): void {
    const cal = window.Cal as CalQueueFunction;
    if (!cal.loaded) {
      const script = documentRef.createElement('script');
      script.src = CAL_EMBED_SCRIPT_SRC;
      script.async = true;
      documentRef.head.appendChild(script);
      cal.loaded = true;
    }

    if (args[0] === 'init') {
      const namespace = args[1];
      const namespaceApi = function namespaceApi(...namespaceArgs: CalArgument[]): void {
        const queuedNamespaceApi = namespaceApi as CalQueueFunction;
        queuedNamespaceApi.q = queuedNamespaceApi.q || [];
        queuedNamespaceApi.q.push(namespaceArgs);
      } as CalQueueFunction;

      if (typeof namespace === 'string') {
        cal.ns = cal.ns || {};
        cal.ns[namespace] = cal.ns[namespace] || namespaceApi;
        cal.ns[namespace].q = cal.ns[namespace].q || [];
        cal.ns[namespace].q?.push(args);
        cal.q = cal.q || [];
        cal.q.push(['initNamespace', namespace]);
      } else {
        cal.q = cal.q || [];
        cal.q.push(args);
      }
      return;
    }

    cal.q = cal.q || [];
    cal.q.push(args);
  } as CalQueueFunction;

  window.Cal = calApi;
  return calApi;
}

/**
 * Renders the post-intake inline Cal.com scheduling widget with booking metadata.
 */
export function CalInlineEmbed({
  bookingId,
  calLink,
  customerName,
  email,
  phone,
  estimatedTotal,
  vehicleCount,
  servicesSummary,
  fallbackUrl,
}: CalInlineEmbedProps): JSX.Element {
  const namespace = useMemo(() => getCalNamespace(calLink), [calLink]);
  const mountId = useMemo(() => createMountId(namespace), [namespace]);
  const calPhoneLocation = useMemo(() => getCalPhoneLocation(phone), [phone]);
  const [embedReady, setEmbedReady] = useState(false);
  const [embedError, setEmbedError] = useState('');

  useEffect(() => {
    if (!calLink.trim()) {
      setEmbedError('Calendar link is not configured.');
      return;
    }

    const mountElement = document.getElementById(mountId);
    if (!mountElement) {
      setEmbedError('Calendar mount point is not ready.');
      return;
    }

    mountElement.replaceChildren();
    setEmbedError('');
    const Cal = ensureCalEmbedApi();
    Cal('init', namespace, { origin: CAL_EMBED_ORIGIN });
    const namespacedCal = window.Cal?.ns?.[namespace];
    if (!namespacedCal) {
      setEmbedError('Calendar embed failed to initialize.');
      return;
    }

    const embedConfig: Record<string, string> = {
      layout: 'month_view',
      useSlotsViewOnSmallScreen: 'true',
      name: customerName,
      email,
      'metadata[bookingId]': bookingId,
      'metadata[phone]': phone,
      'metadata[vehicleCount]': String(vehicleCount),
      'metadata[estimatedTotal]': String(estimatedTotal),
      'metadata[servicesSummary]': servicesSummary,
    };

    if (calPhoneLocation) {
      embedConfig.location = JSON.stringify({
        value: 'phone',
        optionValue: calPhoneLocation,
      });
    }

    namespacedCal('inline', {
      elementOrSelector: `#${mountId}`,
      config: embedConfig,
      calLink,
    });

    namespacedCal('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
    setEmbedReady(true);
  }, [bookingId, calLink, calPhoneLocation, customerName, email, estimatedTotal, mountId, namespace, phone, servicesSummary, vehicleCount]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111111] p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-white">Choose your date and time</h3>
          <p className="mt-1 text-sm text-white/70">
            Your intake is saved. Cal.com handles the confirmed appointment, deposit, and final confirmation.
          </p>
        </div>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          Open fallback link
        </a>
      </div>

      {embedError ? <p className="a11y-error mt-3 text-sm font-medium">{embedError}</p> : null}
      {!embedReady && !embedError ? <p className="mt-3 text-sm text-white/65">Loading calendar...</p> : null}

      <div
        id={mountId}
        className="mt-4 h-[720px] min-h-[620px] w-full overflow-auto rounded-xl border border-white/10 bg-black sm:h-[760px]"
      />
    </section>
  );
}
