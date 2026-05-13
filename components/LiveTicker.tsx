export interface TickerStat {
  label: string;
  value: string;
}

export function LiveTicker({ stats }: { stats: TickerStat[] }) {
  const doubled = [...stats, ...stats];
  return (
    <div className="overflow-hidden border-y border-[var(--border)] bg-[var(--bg-2)]/40 py-4">
      <div className="flex animate-ticker whitespace-nowrap gap-12">
        {doubled.map((s, i) => (
          <div key={i} className="flex shrink-0 items-baseline gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
              {s.label}
            </span>
            <span className="font-display text-2xl text-text">{s.value}</span>
            <span className="text-nimbus-700">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
