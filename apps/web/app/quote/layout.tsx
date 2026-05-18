import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Request a Mobile Detailing Quote',
  description:
    'Request a custom Cruizn Clean quote for mobile auto detailing, vehicle condition, paint correction, ceramic protection, or service-area review near Yorba Linda.',
  path: '/quote',
});

export default function QuoteLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
