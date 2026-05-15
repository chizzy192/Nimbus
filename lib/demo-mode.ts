/**
 * Nimbus runs in two modes:
 *
 *   1. Live    — Supabase, Trustless Work, and a Stellar platform wallet are
 *                all configured via env. Every route hits real services.
 *   2. Demo    — env is empty (or `DEMO_MODE=true` is set). Every route reads
 *                from / writes to an in-memory store, escrow deploys return
 *                fabricated contract IDs, Stellar submits return fake tx
 *                hashes, and a banner across the top says so.
 *
 * The whole app works in demo mode with no external setup, which is what
 * judges and casual cloners get when they `npm install && npm run dev`.
 */

export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === 'true') return true;
  if (process.env.DEMO_MODE === 'false') return false;
  // Auto-detect: missing Supabase config => demo
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_KEY);
  return !hasSupabase;
}

export function demoReason(): string {
  if (process.env.DEMO_MODE === 'true') return 'DEMO_MODE=true';
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return 'no NEXT_PUBLIC_SUPABASE_URL';
  if (!process.env.SUPABASE_SERVICE_KEY) return 'no SUPABASE_SERVICE_KEY';
  return 'unknown';
}
