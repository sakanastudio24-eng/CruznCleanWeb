import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { SITE_PROFILE } from '@/lib/site-profile';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_PROFILE.siteUrl),
  title: {
    default: 'Cruzn Clean | Yorba Linda Mobile Auto Detailing',
    template: '%s | Cruzn Clean',
  },
  description: 'Mobile auto detailing in Yorba Linda with service packages, add-ons, quote requests, and Cal.com booking.',
  applicationName: SITE_PROFILE.businessName,
  authors: [{ name: 'Zward Studio', url: 'https://zward.com' }],
  creator: 'Zward Studio',
  publisher: 'Zward Studio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: SITE_PROFILE.businessName,
    title: 'Cruzn Clean | Yorba Linda Mobile Auto Detailing',
    description: 'Book mobile detailing, request custom quotes, and review service packages for Yorba Linda-area vehicles.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cruzn Clean | Yorba Linda Mobile Auto Detailing',
    description: 'Mobile auto detailing in Yorba Linda with clear booking, packages, add-ons, and quote requests.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Renders the top-level HTML shell for all web routes.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-black text-white font-body antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
