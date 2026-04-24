import type { MetadataRoute } from 'next';

import { SITE_PROFILE } from '@/lib/site-profile';

/**
 * Exposes crawl guidance for public search engines.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/email-preview', '/styleguide'],
    },
    sitemap: `${SITE_PROFILE.siteUrl}/sitemap.xml`,
  };
}
