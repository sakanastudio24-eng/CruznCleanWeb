import { buildRouteMetadata } from '@/lib/seo';
import { JsonLd, buildContactPageSchema } from '@/lib/schema';

export const metadata = buildRouteMetadata({
  title: 'Contact Cruizn Clean',
  description:
    'Contact Cruizn Clean for mobile auto detailing questions, Yorba Linda and Orange County service-area help, booking prep, and appointment support.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <>
      <JsonLd data={buildContactPageSchema()} />
      {children}
    </>
  );
}
