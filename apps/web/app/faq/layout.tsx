import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Mobile Detailing FAQ',
  description:
    'Answers about Cruizn Clean booking, service areas, pricing, vehicle prep, deposits, mobile detailing, paint correction, and ceramic protection.',
  path: '/faq',
});

export default function FaqLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
