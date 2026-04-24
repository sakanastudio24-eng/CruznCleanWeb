import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cruzn Clean',
  description: 'Black-and-white mobile detailing site for Yorba Linda bookings, quotes, and Cal.com scheduling.',
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
