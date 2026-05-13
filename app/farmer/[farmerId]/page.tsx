import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchSeasonRainfall } from '@/lib/openmeteo';
import { PolicyCard } from '@/components/PolicyCard';
import { RainfallChart } from '@/components/RainfallChart';
import { StatusBadge } from '@/components/StatusBadge';
import { formatMm, rainfallStatus, shortHash, stellarExpertTxUrl } from '@/lib/utils';
import type { Farmer, OracleCheck } from '@/types/nimbus';

export const dynamic = 'force-dynamic';

export default async function FarmerDashboardPage({
  params,
}: {
  params: { farmerId: string };
}) {
  const supabase = supabaseServer();
  const { data: farmer } = await supabase
    .from('farmers')
    .select('*')
    .eq('id', params.farmerId)
    .single();

  if (!farmer) notFound();
  const f = farmer as Farmer;

  let dailyMm: number[] = [];
  let totalMm = 0;
  let rainfallError: string | null = null;
  try {
    const r = await fetchSeasonRainfall(f.latitude, f.longitude, f.season_start);
    dailyMm = r.dailyMm;
    totalMm = r.totalMm;
  } catch (e) {
    rainfallError = e instanceof Error ? e.message : 'rainfall fetch failed';
  }

  const { data: checks } = await supabase
    .from('oracle_checks')
    .select('id,checked_at,check_date,rainfall_cumulative_mm,threshold_mm,triggered,tx_hash,farmer_id,season_start,open_meteo_raw')
    .eq('farmer_id', f.id)
    .order('checked_at', { ascending: false })
    .limit(7);

  const live = rainfallStatus(totalMm, f.drought_threshold_mm);

  return (
    <main className="min-h-screen bg-grid">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
          </Link>
          <Link
            href="/admin"
            className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70 hover:text-text"
          >
            Admin →
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PolicyCard farmer={f} />

            <div className="mt-6">
              {rainfallError ? (
                <div className="card p-6 font-mono text-xs text-oracle-trigger">
                  Rainfall data unavailable: {rainfallError}
                </div>
              ) : (
                <RainfallChart
                  daily={dailyMm}
                  seasonStart={f.season_start}
                  thresholdMm={f.drought_threshold_mm}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <div className="section-label mb-3">Live status</div>
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-text">{formatMm(totalMm)}</span>
                <StatusBadge status={live} />
              </div>
              <div className="mt-2 font-mono text-[11px] text-nimbus-300/70">
                threshold · {formatMm(f.drought_threshold_mm, 0)}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-3)]">
                <div
                  className={`h-full ${
                    live === 'trigger'
                      ? 'bg-oracle-trigger'
                      : live === 'warning'
                        ? 'bg-oracle-warning'
                        : 'bg-oracle-safe'
                  }`}
                  style={{
                    width: `${Math.min(100, (totalMm / Math.max(f.drought_threshold_mm * 1.5, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="card p-6">
              <div className="section-label mb-3">Oracle log · last 7</div>
              {(!checks || checks.length === 0) && (
                <div className="font-mono text-xs text-nimbus-300/70">
                  No oracle checks yet. The daily cron runs at 06:00 UTC.
                </div>
              )}
              <ul className="space-y-3">
                {(checks ?? []).map((c: OracleCheck) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between font-mono text-[11px] text-nimbus-300"
                  >
                    <span>{c.check_date}</span>
                    <span className="text-text">{formatMm(c.rainfall_cumulative_mm)}</span>
                    {c.triggered ? (
                      <a
                        className="text-oracle-trigger hover:underline"
                        href={c.tx_hash ? stellarExpertTxUrl(c.tx_hash) : '#'}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.tx_hash ? `paid · ${shortHash(c.tx_hash, 6, 4)}` : 'triggered'}
                      </a>
                    ) : (
                      <StatusBadge status="safe" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <div className="section-label mb-3">Custodial wallet</div>
              <div className="font-mono text-[11px] text-nimbus-300">
                {f.stellar_wallet ? shortHash(f.stellar_wallet, 8, 8) : '—'}
              </div>
              <p className="mt-3 font-body text-xs text-nimbus-300/70">
                USDC payouts land directly here. Nimbus manages the keys until you request export.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
