import { buildRouteMetadata } from '@/lib/seo';

export const metadata = buildRouteMetadata({
  title: 'Mobile Detailing Gallery',
  description:
    'View real Cruizn Clean detailing work across exterior details, interior cleaning, wheels, headlights, paint enhancement, and correction results.',
  path: '/gallery',
});

export default function GalleryLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
