import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Mobile Detailing Gallery',
  description:
    'View Cruizn Clean mobile detailing results, including exterior details, interior details, paint correction, ceramic protection, wheels, headlights, and vehicle care examples.',
  path: '/gallery',
});

export default function GalleryLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
