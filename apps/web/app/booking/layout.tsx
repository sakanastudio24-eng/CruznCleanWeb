import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Book Mobile Auto Detailing',
  description:
    'Start a Cruizn Clean booking request with vehicle details, selected services, scheduling, and deposit handoff for Yorba Linda-area mobile detailing.',
  path: '/booking',
});

export default function BookingLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
