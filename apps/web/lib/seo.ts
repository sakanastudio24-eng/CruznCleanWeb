import type { Metadata } from 'next';

import { SITE_PROFILE } from '@/lib/site-profile';

export const SITE_METADATA_TITLE = 'Cruizn Clean | Yorba Linda Mobile Auto Detailing';
export const SITE_METADATA_DESCRIPTION =
  'Mobile auto detailing in Yorba Linda and nearby Orange County areas with detail packages, paint correction, ceramic protection, quotes, and online booking.';

const SOCIAL_IMAGE_ALT = 'Cruizn Clean Yorba Linda mobile auto detailing social preview';
const OPEN_GRAPH_IMAGE_PATH = '/opengraph-image';
const TWITTER_IMAGE_PATH = '/twitter-image';

interface RouteMetadataInput {
  title: string;
  description: string;
  path: `/${string}`;
  noindex?: boolean;
}

/**
 * Builds a normalized site URL for canonical and social metadata fields.
 */
export function buildCanonicalUrl(path: `/${string}`): URL {
  return new URL(path, SITE_PROFILE.siteUrl);
}

/**
 * Returns default crawl rules for public customer-facing pages.
 */
export function buildIndexRobots(): Metadata['robots'] {
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

/**
 * Returns crawl rules for private, transactional, and internal preview pages.
 */
export function buildNoindexRobots(): Metadata['robots'] {
  return {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

/**
 * Creates page-level metadata with consistent canonical and social previews.
 */
export function buildRouteMetadata({ title, description, path, noindex = false }: RouteMetadataInput): Metadata {
  const canonicalUrl = buildCanonicalUrl(path);

  return {
    metadataBase: new URL(SITE_PROFILE.siteUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: SITE_PROFILE.businessName,
      title,
      description,
      images: [
        {
          url: OPEN_GRAPH_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: SOCIAL_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: TWITTER_IMAGE_PATH,
          alt: SOCIAL_IMAGE_ALT,
        },
      ],
    },
    robots: noindex ? buildNoindexRobots() : buildIndexRobots(),
  };
}
