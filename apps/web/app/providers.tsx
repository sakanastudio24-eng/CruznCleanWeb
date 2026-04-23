'use client';

import { BookingProvider } from '@/components/providers/booking-provider';
import { RuntimeConfigProvider } from '@/components/providers/runtime-config-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all client-side providers required by app routes.
 */
export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <BookingProvider>
      <RuntimeConfigProvider />
      {children}
    </BookingProvider>
  );
}
