export interface SiteProfile {
  businessName: string;
  locationLabel: string;
  phoneDisplay: string;
  phoneHref: string;
  supportEmail: string;
  siteUrl: string;
  hoursLabel: string;
  serviceAreaLabel: string;
}

const PUBLIC_SUPPORT_EMAIL = 'hello@cruiznclean.com';

/**
 * Keeps legacy env defaults from leaking into public contact copy.
 */
function getPublicSupportEmail(): string {
  const configuredEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();

  if (!configuredEmail || configuredEmail.toLowerCase() === 'admin@cruiznclean.com') {
    return PUBLIC_SUPPORT_EMAIL;
  }

  return configuredEmail;
}

/**
 * Defines reusable front-facing business profile values shared across screens.
 */
export const SITE_PROFILE: SiteProfile = {
  businessName: 'Cruizn Clean',
  locationLabel: 'Yorba Linda, California',
  phoneDisplay: '(951)-434-3767',
  phoneHref: 'tel:+19514343767',
  supportEmail: getPublicSupportEmail(),
  siteUrl: 'https://www.cruiznclean.com',
  hoursLabel: 'Mon-Sat 8:00AM - 6:00PM',
  serviceAreaLabel: 'Yorba Linda, Anaheim Hills, Placentia, and nearby Orange County neighborhoods',
};
