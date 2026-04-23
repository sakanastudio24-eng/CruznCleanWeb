import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

interface SiteShellProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with shared header and footer.
 */
export function SiteShell({ children }: SiteShellProps): JSX.Element {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
