import { SITE_PROFILE } from '@/lib/site-profile';

export interface PublicRuntimeConfig {
  apiBaseUrl: string;
  calendarUrl: string;
  calendarLink: string;
  siteUrl: string;
  businessName: string;
  locationLabel: string;
  supportEmail: string;
  phoneDisplay: string;
  marketingMenuEnabled: boolean;
}

export const DEFAULT_PUBLIC_RUNTIME_CONFIG: PublicRuntimeConfig = {
  apiBaseUrl: 'http://127.0.0.1:8000',
  calendarUrl: 'https://cal.com',
  calendarLink: 'zechariah-ward-t6yded/testing-1212',
  siteUrl: SITE_PROFILE.siteUrl,
  businessName: SITE_PROFILE.businessName,
  locationLabel: SITE_PROFILE.locationLabel,
  supportEmail: SITE_PROFILE.supportEmail,
  phoneDisplay: SITE_PROFILE.phoneDisplay,
  marketingMenuEnabled: false,
};

/**
 * Normalizes server environment into a client-safe runtime payload.
 */
export function buildPublicRuntimeConfig(env: NodeJS.ProcessEnv = process.env): PublicRuntimeConfig {
  return {
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.apiBaseUrl,
    calendarUrl: env.NEXT_PUBLIC_CAL_COM_URL?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.calendarUrl,
    calendarLink: env.NEXT_PUBLIC_CAL_COM_LINK?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.calendarLink,
    siteUrl: env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.siteUrl,
    businessName: env.NEXT_PUBLIC_BUSINESS_NAME?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.businessName,
    locationLabel: env.NEXT_PUBLIC_LOCATION_LABEL?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.locationLabel,
    supportEmail: env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.supportEmail,
    phoneDisplay: env.NEXT_PUBLIC_PHONE_DISPLAY?.trim() || DEFAULT_PUBLIC_RUNTIME_CONFIG.phoneDisplay,
    marketingMenuEnabled: env.NEXT_PUBLIC_MARKETING_MENU_ENABLED?.trim().toLowerCase() === 'true',
  };
}
