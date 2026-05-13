import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { formatMm, formatUsdc, shortHash, stellarExpertContractUrl, escrowViewerUrl } from '@/lib/utils';
import type { Farmer } from '@/types/nimbus';

export function PolicyCard({ farmer }: { farmer: Farmer }) {
  const status = farmer.payout_triggered
    ? 'trigger'
    : farmer.status === 'active'
      ? 'active'
      : farmer.status === 'expired'
        ? 'expired'
        : 'pending';

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="section-label mb-2">Policy</div>
          <h3 className="font-display text-3xl text-text">{farmer.name}</h3>
          <div className="font-mono text-xs text-nimbus-300/70">
            {farmer.region ?? '—'} · {farmer.crop_type ?? 'crop n/a'}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Coverage
          </dt>
          <dd className="font-display text-2xl text-nimbus-400">
            {formatUsdc(farmer.coverage_usdc)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Premium
          </dt>
          <dd className="flex items-baseline gap-2 font-display text-2xl text-text">
            {formatUsdc(farmer.premium_usdc)}
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                farmer.premium_paid ? 'text-nimbus-400' : 'text-oracle-warning'
              }`}
            >
              {farmer.premium_paid ? '· paid' : '· due'}
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Threshold
          </dt>
          <dd className="font-mono text-sm text-text">
            {formatMm(farmer.drought_threshold_mm, 0)} / season
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Season
          </dt>
          <dd className="font-mono text-sm text-text">
            {farmer.season_start} → {farmer.season_end}
          </dd>
        </div>
      </dl>

      {farmer.contract_id && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
              Escrow Contract
            </span>
            <Link
              href={stellarExpertContractUrl(farmer.contract_id)}
              target="_blank"
              className="font-mono text-xs text-nimbus-400 hover:underline"
            >
              {shortHash(farmer.contract_id)}
            </Link>
          </div>
          <Link
            href={escrowViewerUrl(farmer.contract_id)}
            target="_blank"
            className="mt-1 inline-block font-mono text-[10px] uppercase tracking-widest text-nimbus-400 hover:underline"
          >
            Open in Escrow Viewer ↗
          </Link>
        </div>
      )}

      {farmer.payout_triggered && farmer.trigger_rainfall_mm != null && (
        <div className="mt-4 rounded-lg border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)] p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-oracle-trigger">
            Payout released
          </div>
          <div className="mt-1 font-body text-sm text-text">
            Rainfall fell to{' '}
            <span className="font-mono text-oracle-trigger">
              {formatMm(farmer.trigger_rainfall_mm)}
            </span>{' '}
            — {formatUsdc(farmer.coverage_usdc)} USDC released to wallet.
          </div>
        </div>
      )}
    </div>
  );
}
