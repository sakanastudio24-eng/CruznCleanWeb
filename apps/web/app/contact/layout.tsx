import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Contact Cruizn Clean',
  description:
    'Contact Cruizn Clean for mobile detailing questions, service-area help, booking prep, and Yorba Linda-area appointment support.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
