import type { MetadataRoute } from 'next';

import { SITE_PROFILE } from '@/lib/site-profile';

const PUBLIC_ROUTES = ['/', '/services', '/gallery', '/quote', '/booking', '/contact', '/faq', '/privacy', '/terms'];

/**
 * Lists public customer-facing routes for search indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_PROFILE.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
