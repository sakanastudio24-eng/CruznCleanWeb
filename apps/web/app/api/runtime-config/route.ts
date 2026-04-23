import { NextResponse } from 'next/server';

import { buildPublicRuntimeConfig } from '@/lib/public-runtime';

/**
 * Serves a client-safe runtime config payload so public settings are injected at request time.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(buildPublicRuntimeConfig(), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
