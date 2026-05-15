import { demoReason, isDemoMode } from '@/lib/demo-mode';

/**
 * Renders a thin strip across the top of every page when the app is running
 * in demo mode (no Supabase / Trustless Work / Stellar keys). Server-rendered
 * so the flag is evaluated once, on the server, with the real process.env.
 */
export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="relative z-50 border-b border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2 text-[11px]">
        <span className="font-mono uppercase tracking-widest text-oracle-warning">
          ⚠ Demo mode · in-memory store · no on-chain activity
        </span>
        <span className="hidden font-mono tracking-widest text-nimbus-300/70 md:inline">
          reason: {demoReason()} · set Supabase env vars to switch to live
        </span>
      </div>
    </div>
  );
}
