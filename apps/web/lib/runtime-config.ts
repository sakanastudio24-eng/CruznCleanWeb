import {
  DEFAULT_PUBLIC_RUNTIME_CONFIG,
  type PublicRuntimeConfig,
} from '@/lib/public-runtime';

let runtimeConfig: PublicRuntimeConfig = DEFAULT_PUBLIC_RUNTIME_CONFIG;

/**
 * Returns the latest public runtime config snapshot loaded for the browser session.
 */
export function getRuntimeConfig(): PublicRuntimeConfig {
  return runtimeConfig;
}

/**
 * Merges a fetched runtime payload into the browser-side config snapshot.
 */
export function setRuntimeConfig(nextConfig: Partial<PublicRuntimeConfig>): PublicRuntimeConfig {
  runtimeConfig = {
    ...DEFAULT_PUBLIC_RUNTIME_CONFIG,
    ...runtimeConfig,
    ...nextConfig,
  };

  return runtimeConfig;
}
