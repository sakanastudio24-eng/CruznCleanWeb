import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Mobile Detailing Services in Yorba Linda',
  description:
    'Compare Cruizn Clean interior detailing, exterior detailing, maintenance packages, paint correction, ceramic protection, and add-ons for Yorba Linda and Orange County vehicles.',
  path: '/services',
});

export default function ServicesLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
