import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Mobile Detailing Services in Yorba Linda',
  description:
    'Compare Cruizn Clean detail packages, paint correction, ceramic protection services, and add-ons for mobile auto detailing in Yorba Linda and nearby Orange County areas.',
  path: '/services',
});

export default function ServicesLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
