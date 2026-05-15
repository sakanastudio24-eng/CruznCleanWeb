import type { Metadata } from 'next';
import Script from 'next/script';
import { Providers } from '@/app/providers';
import { buildIndexRobots, SITE_METADATA_DESCRIPTION, SITE_METADATA_TITLE } from '@/lib/seo';
import { SITE_PROFILE } from '@/lib/site-profile';
import favicon16 from '../assets/Logos/Cruz-favicon-16x.png';
import favicon48 from '../assets/Logos/Cruz-favicon-48x.png';
import favicon180 from '../assets/Logos/Cruz-favicon-180x.png';
import favicon192 from '../assets/Logos/Cruz-favicon-192x.png';
import favicon512 from '../assets/Logos/Cruz-favicon-512x.png';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_PROFILE.siteUrl),
  title: {
    default: SITE_METADATA_TITLE,
    template: '%s | Cruizn Clean',
  },
  description: SITE_METADATA_DESCRIPTION,
  applicationName: SITE_PROFILE.businessName,
  authors: [{ name: 'Zward Studio', url: 'https://zward.com' }],
  creator: 'Zward Studio',
  publisher: 'Zward Studio',
  icons: {
    icon: [
      { url: favicon16.src, sizes: '16x16', type: 'image/png' },
      { url: favicon48.src, sizes: '48x48', type: 'image/png' },
      { url: favicon192.src, sizes: '192x192', type: 'image/png' },
      { url: favicon512.src, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: favicon180.src, sizes: '180x180', type: 'image/png' }],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: SITE_PROFILE.businessName,
    title: SITE_METADATA_TITLE,
    description: SITE_METADATA_DESCRIPTION,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Cruizn Clean Yorba Linda mobile auto detailing social preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_METADATA_TITLE,
    description: SITE_METADATA_DESCRIPTION,
    images: [
      {
        url: '/twitter-image',
        alt: 'Cruizn Clean Yorba Linda mobile auto detailing social preview',
      },
    ],
  },
  robots: buildIndexRobots(),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Renders the top-level HTML shell for all web routes.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const gaConfigScript = gaId
    ? `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', ${JSON.stringify(gaId)});
          `
    : '';

  return (
    <html lang="en">
      <body className="bg-ink text-white font-body antialiased">
        {gaId ? (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} />
            <Script id="google-tag">{gaConfigScript}</Script>
          </>
        ) : null}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
