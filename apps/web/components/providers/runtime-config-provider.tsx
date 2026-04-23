'use client';

import { useEffect } from 'react';

import { setRuntimeConfig } from '@/lib/runtime-config';
import type { PublicRuntimeConfig } from '@/lib/public-runtime';

/**
 * Hydrates browser-side runtime settings from the request-time config endpoint.
 */
export function RuntimeConfigProvider(): null {
  useEffect(() => {
    let cancelled = false;

    /**
     * Loads public runtime settings once so client-side helpers avoid hardcoded build-time env values.
     */
    async function loadRuntimeConfig(): Promise<void> {
      try {
        const response = await fetch('/api/runtime-config', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as Partial<PublicRuntimeConfig>;
        if (!cancelled) {
          setRuntimeConfig(payload);
        }
      } catch {
        // Keep defaults when runtime config cannot be reached during local boot.
      }
    }

    void loadRuntimeConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
