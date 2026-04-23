export interface SupabaseScaffoldConfig {
  url: string;
  publishableKey: string;
  storageBackend: 'local_json' | 'supabase';
}

/**
 * Reads future-facing Supabase settings without forcing the current blueprint to require live credentials.
 */
export function getSupabaseScaffoldConfig(env: NodeJS.ProcessEnv = process.env): SupabaseScaffoldConfig {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '',
    publishableKey:
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
      '',
    storageBackend: env.NEXT_PUBLIC_STORAGE_BACKEND?.trim() === 'supabase' ? 'supabase' : 'local_json',
  };
}

/**
 * Reports whether enough public env values exist to begin the later Supabase browser wiring.
 */
export function isSupabaseBrowserConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const config = getSupabaseScaffoldConfig(env);
  return Boolean(config.url && config.publishableKey);
}

/**
 * Placeholder hook point for later browser-client creation once the Supabase package is added.
 */
export function createSupabaseBrowserClientPlaceholder(): null {
  return null;
}
