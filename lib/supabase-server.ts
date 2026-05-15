import { createClient } from '@supabase/supabase-js';

/**
 * Returns a service-role Supabase client.
 *
 * In live mode every API route checks `isDemoMode()` first and only reaches
 * this function when Supabase env vars are set. The guard below turns the
 * "ah, the env was missing" footgun into a clear, traceable error rather
 * than the cryptic `Invalid URL` that supabase-js otherwise throws.
 */
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'supabaseServer() called without NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY — ' +
        'this usually means a route forgot to check isDemoMode() before falling through to the live branch.'
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
