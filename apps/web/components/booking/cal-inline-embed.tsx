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

interface CalEmbedEvent {
  detail?: {
    data?: unknown;
    namespace?: string;
    type?: string;
  };
}

export interface CalBookingSuccessDetails {
  bookingId: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  eventTypeId: number | null;
  status: string;
  paymentRequired: boolean | null;
  isRecurring: boolean | null;
}

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
  onBookingSuccess: (details: CalBookingSuccessDetails) => void;
}

/**
 * Resolves the namespace Cal.com expects from the final segment of an event link.
 */
function getCalNamespace(calLink: string): string {
  const segments = calLink.split('/').map((segment) => segment.trim()).filter(Boolean);
  return segments.at(-1) || 'cruizn-clean-booking';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getBooleanOrNull(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeBookingSuccessDetails(bookingId: string, data: unknown): CalBookingSuccessDetails {
  const record = isRecord(data) ? data : {};

  return {
    bookingId,
    uid: getString(record.uid),
    title: getString(record.title),
    startTime: getString(record.startTime),
    endTime: getString(record.endTime),
    eventTypeId: getNumberOrNull(record.eventTypeId),
    status: getString(record.status),
    paymentRequired: getBooleanOrNull(record.paymentRequired),
    isRecurring: getBooleanOrNull(record.isRecurring),
  };
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
  onBookingSuccess,
}: CalInlineEmbedProps): JSX.Element {
  const namespace = useMemo(() => getCalNamespace(calLink), [calLink]);
  const mountId = useMemo(() => createMountId(namespace), [namespace]);
  const calPhoneLocation = useMemo(() => getCalPhoneLocation(phone), [phone]);
  const [embedReady, setEmbedReady] = useState(false);
  const [embedError, setEmbedError] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let listenerActive = true;

    if (!calLink.trim()) {
      setEmbedError('Calendar link is not configured');
      return;
    }

    const mountElement = document.getElementById(mountId);
    if (!mountElement) {
      setEmbedError('Calendar mount point is not ready');
      return;
    }

    mountElement.replaceChildren();
    setEmbedError('');
    setShowFallback(false);
    const Cal = ensureCalEmbedApi();
    Cal('init', namespace, { origin: CAL_EMBED_ORIGIN });
    const namespacedCal = window.Cal?.ns?.[namespace];
    if (!namespacedCal) {
      setEmbedError('Calendar embed failed to initialize');
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

    namespacedCal('on', {
      action: 'bookingSuccessfulV2',
      callback: (event: CalEmbedEvent) => {
        if (!listenerActive) {
          return;
        }

        onBookingSuccess(normalizeBookingSuccessDetails(bookingId, event.detail?.data));
      },
    });

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

    const fallbackTimer = window.setTimeout(() => {
      if (!mountElement.querySelector('iframe')) {
        setShowFallback(true);
      }
    }, 10000);

    return () => {
      listenerActive = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [bookingId, calLink, calPhoneLocation, customerName, email, estimatedTotal, mountId, namespace, onBookingSuccess, phone, servicesSummary, vehicleCount]);

  return (
    <section className="space-y-4">
      {embedError || showFallback ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-sm text-white/70">
            Having trouble with the scheduler? Open the booking calendar in a new tab. After your appointment is scheduled, return here to continue.
          </p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-burgundyAccent hover:bg-burgundyAccent/10"
          >
            Open booking calendar
          </a>
        </div>
      ) : null}

      {embedError ? <p className="a11y-error mt-3 text-sm font-medium">{embedError}</p> : null}
      {!embedReady && !embedError ? <p className="mt-3 text-sm text-white/65">Loading calendar</p> : null}

      <div
        id={mountId}
        className="h-[720px] min-h-[620px] w-full overflow-auto rounded-xl border border-line bg-ink sm:h-[760px]"
      />
    </section>
  );
}
