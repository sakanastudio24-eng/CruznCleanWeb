'use client';

import { BookingProvider } from '@/components/providers/booking-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all client-side providers required by app routes.
 */
export function Providers({ children }: ProvidersProps): JSX.Element {
  return <BookingProvider>{children}</BookingProvider>;
}
