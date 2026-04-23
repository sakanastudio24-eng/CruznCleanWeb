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

/**
 * Defines reusable front-facing business profile values shared across screens.
 */
export const SITE_PROFILE: SiteProfile = {
  businessName: 'Cruzn Clean',
  locationLabel: 'Yorba Linda, California',
  phoneDisplay: '(555) 123-4567',
  phoneHref: 'tel:+15551234567',
  supportEmail: 'hello@cruznclean.com',
  siteUrl: 'https://www.cruznclean.com',
  hoursLabel: 'Mon-Sat 8:00AM - 6:00PM',
  serviceAreaLabel: 'Yorba Linda, Anaheim Hills, Placentia, and nearby Orange County neighborhoods.',
};
