import { StatusBadge } from './StatusBadge';
import { formatMm } from '@/lib/utils';

export interface OracleRow {
  farm: string;
  region: string;
  rainfallMm: number;
  thresholdMm: number;
  status: 'safe' | 'warning' | 'trigger';
  txHash?: string;
}

export function OracleStatusCard({ rows }: { rows: OracleRow[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-nimbus-500" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-nimbus-400" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
            Oracle · Live
          </span>
        </div>
        <span className="font-mono text-[11px] text-nimbus-300/70">Open-Meteo · 06:00 UTC</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5">
            <div className="col-span-5">
              <div className="font-head text-sm text-text">{row.farm}</div>
              <div className="font-mono text-[11px] text-nimbus-300/70">{row.region}</div>
            </div>
            <div className="col-span-3 font-mono text-sm text-text">
              {formatMm(row.rainfallMm)}
              <span className="ml-1 text-nimbus-300/60">/ {formatMm(row.thresholdMm, 0)}</span>
            </div>
            <div className="col-span-4 flex justify-end">
              {row.txHash ? (
                <a
                  className="font-mono text-[11px] text-oracle-trigger underline-offset-2 hover:underline"
                  href={`https://stellar.expert/explorer/testnet/tx/${row.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  PAID · {row.txHash.slice(0, 8)}…
                </a>
              ) : (
                <StatusBadge status={row.status} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
