import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Appointment Request Received',
  description:
    'Noindex confirmation page for Cruizn Clean booking intake, calendar selection, deposit status, and appointment preparation steps.',
  path: '/thank-you',
  noindex: true,
});

export default function ThankYouLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
