import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Terms of Service',
  description:
    'Cruizn Clean terms covering appointments, deposits, pricing, weather rescheduling, service limits, and mobile detailing policies.',
  path: '/terms',
});

export default function TermsLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
