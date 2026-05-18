import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Book Mobile Auto Detailing',
  description:
    'Book Cruizn Clean mobile auto detailing for Yorba Linda and surrounding Orange County cities with vehicle details, selected services, scheduling, and deposit checkout.',
  path: '/booking',
});

export default function BookingLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
