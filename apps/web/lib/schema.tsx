import { SITE_METADATA_DESCRIPTION, SITE_METADATA_TITLE, buildCanonicalUrl } from '@/lib/seo';
import { SERVICE_AREA_CITIES } from '@/lib/service-area';
import { SERVICES } from '@/lib/services-catalog';
import { SITE_PROFILE } from '@/lib/site-profile';
import { getFaqRecords } from '@/lib/faq-data';

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];

interface JsonLdObject {
  [key: string]: JsonLdValue;
}

interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[];
}

const BUSINESS_ID = `${SITE_PROFILE.siteUrl}/#business`;
const WEBSITE_ID = `${SITE_PROFILE.siteUrl}/#website`;
const SERVICE_CATALOG_ID = `${SITE_PROFILE.siteUrl}/services#offer-catalog`;

function absoluteUrl(path: `/${string}`): string {
  return buildCanonicalUrl(path).toString();
}

function getAreaServed(): JsonLdObject[] {
  return SERVICE_AREA_CITIES.map((city) => ({
    '@type': 'City',
    name: city,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Orange County, California',
    },
  }));
}

function getSameAs(): string[] | undefined {
  const socialUrls = SITE_PROFILE.socialLinks.map((link) => link.href);
  return socialUrls.length > 0 ? socialUrls : undefined;
}

function getTelephone(): string {
  return SITE_PROFILE.phoneHref.replace(/^tel:/, '');
}

function getServiceList(): JsonLdObject[] {
  return SERVICES.map((service) => ({
    '@type': 'Service',
    '@id': `${SITE_PROFILE.siteUrl}/services#${service.id}`,
    name: service.name,
    description: service.description,
    serviceType: service.category,
    provider: {
      '@id': BUSINESS_ID,
    },
    areaServed: getAreaServed(),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: service.price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl('/services'),
    },
  }));
}

/**
 * Renders JSON-LD in a reusable server component with React-safe escaping.
 */
export function JsonLd({ data }: JsonLdProps): JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function buildHomeSchema(): JsonLdObject[] {
  const businessSchema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoRepair'],
    '@id': BUSINESS_ID,
    name: SITE_PROFILE.businessName,
    description: SITE_METADATA_DESCRIPTION,
    url: SITE_PROFILE.siteUrl,
    image: absoluteUrl('/opengraph-image'),
    telephone: getTelephone(),
    email: SITE_PROFILE.supportEmail,
    areaServed: getAreaServed(),
    hasOfferCatalog: {
      '@id': SERVICE_CATALOG_ID,
    },
  };
  const sameAs = getSameAs();

  if (sameAs) {
    businessSchema.sameAs = sameAs;
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_PROFILE.businessName,
      url: SITE_PROFILE.siteUrl,
      description: SITE_METADATA_DESCRIPTION,
      publisher: {
        '@id': BUSINESS_ID,
      },
      inLanguage: 'en-US',
    },
    businessSchema,
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_PROFILE.siteUrl}/#webpage`,
      url: SITE_PROFILE.siteUrl,
      name: SITE_METADATA_TITLE,
      description: SITE_METADATA_DESCRIPTION,
      isPartOf: {
        '@id': WEBSITE_ID,
      },
      about: {
        '@id': BUSINESS_ID,
      },
      inLanguage: 'en-US',
    },
    buildServicesOfferCatalog(),
  ];
}

export function buildServicesOfferCatalog(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': SERVICE_CATALOG_ID,
    name: 'Cruizn Clean mobile detailing services',
    url: absoluteUrl('/services'),
    itemListElement: getServiceList(),
  };
}

export function buildServicesPageSchema(): JsonLdObject[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_PROFILE.siteUrl}/services#webpage`,
      url: absoluteUrl('/services'),
      name: 'Mobile Detailing Services in Yorba Linda',
      description:
        'Compare Cruizn Clean interior detailing, exterior detailing, maintenance packages, paint correction, ceramic protection, and add-ons for Yorba Linda and Orange County vehicles.',
      isPartOf: {
        '@id': WEBSITE_ID,
      },
      about: {
        '@id': BUSINESS_ID,
      },
      inLanguage: 'en-US',
    },
    buildServicesOfferCatalog(),
  ];
}

export function buildFaqPageSchema(): JsonLdObject[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_PROFILE.siteUrl}/faq#webpage`,
      url: absoluteUrl('/faq'),
      name: 'Mobile Detailing FAQ',
      isPartOf: {
        '@id': WEBSITE_ID,
      },
      about: {
        '@id': BUSINESS_ID,
      },
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${SITE_PROFILE.siteUrl}/faq#faq`,
      mainEntity: getFaqRecords().map((record) => ({
        '@type': 'Question',
        name: record.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: record.a,
        },
      })),
    },
  ];
}

export function buildContactPageSchema(): JsonLdObject[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${SITE_PROFILE.siteUrl}/contact#webpage`,
      url: absoluteUrl('/contact'),
      name: 'Contact Cruizn Clean',
      isPartOf: {
        '@id': WEBSITE_ID,
      },
      about: {
        '@id': BUSINESS_ID,
      },
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: getTelephone(),
      email: SITE_PROFILE.supportEmail,
      areaServed: 'US-CA',
      availableLanguage: 'English',
    },
  ];
}

export function buildQuotePageSchema(): JsonLdObject[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_PROFILE.siteUrl}/quote#webpage`,
      url: absoluteUrl('/quote'),
      name: 'Request a Mobile Detailing Quote',
      isPartOf: {
        '@id': WEBSITE_ID,
      },
      about: {
        '@id': BUSINESS_ID,
      },
      inLanguage: 'en-US',
    },
  ];
}
