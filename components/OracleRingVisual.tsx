export function OracleRingVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* Concentric rings */}
      <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
      <div className="absolute inset-[8%] rounded-full border border-[var(--border)]" />
      <div className="absolute inset-[18%] rounded-full border border-[var(--border-strong)]" />
      <div className="absolute inset-[30%] rounded-full border border-[rgba(16,185,129,0.4)]" />
      <div className="absolute inset-[42%] animate-ring-pulse rounded-full bg-nimbus-500/20" />

      {/* Center core */}
      <div className="absolute inset-[46%] rounded-full bg-nimbus-500 shadow-[0_0_40px_rgba(16,185,129,0.6)]" />

      {/* Orbit nodes */}
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-md bg-[var(--bg-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-oracle-safe">
        Open-Meteo
      </span>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-md bg-[var(--bg-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
        Stellar RPC
      </span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-md bg-[var(--bg-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-nimbus-300">
        Trustless Work
      </span>
      <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-[var(--bg-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-oracle-warning">
        Supabase
      </span>

      {/* Center label */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
          Oracle
        </div>
        <div className="font-display text-xl text-text">06:00 UTC</div>
      </div>
    </div>
  );
}
