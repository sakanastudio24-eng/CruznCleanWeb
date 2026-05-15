import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Privacy Policy',
  description:
    'Cruizn Clean privacy policy for booking details, contact messages, communications, service providers, and operational records.',
  path: '/privacy',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
