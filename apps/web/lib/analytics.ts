'use client';

export type AnalyticsEventName =
  | 'click_book_now'
  | 'click_call'
  | 'click_social'
  | 'select_service'
  | 'start_booking'
  | 'generate_lead'
  | 'begin_checkout'
  | 'purchase';

export type AnalyticsSocialPlatform = 'facebook' | 'instagram' | 'tiktok';

export interface AnalyticsEventParams {
  page?: string;
  location?: string;
  platform?: AnalyticsSocialPlatform;
  url?: string;
  form_name?: string;
  lead_type?: string;
  service_interest?: string;
  service_name?: string;
  vehicle_type?: string;
  selected_total?: number;
  currency?: string;
  value?: number;
  checkout_type?: string;
  transaction_id?: string;
}

/**
 * Sends a privacy-safe business event to GA4 when the global tag is available.
 */
export function trackAnalyticsEvent(eventName: AnalyticsEventName, params: AnalyticsEventParams = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number>;

  window.gtag('event', eventName, cleanParams);
}
