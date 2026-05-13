'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatMm, rainfallStatus, shortHash, stellarExpertTxUrl } from '@/lib/utils';
import type { Farmer, OracleCheck } from '@/types/nimbus';

interface LiveReading {
  farmerId: string;
  name: string;
  totalMm: number | null;
  thresholdMm: number;
  error?: string;
}

export default function AdminOraclePage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [logs, setLogs] = useState<OracleCheck[]>([]);
  const [readings, setReadings] = useState<LiveReading[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAll() {
    const [f, l] = await Promise.all([
      fetch('/api/farmers').then((r) => r.json()),
      fetch('/api/oracle/logs?limit=100').then((r) => r.json()),
    ]);
    const fList: Farmer[] = f.farmers ?? [];
    setFarmers(fList);
    setLogs(l.logs ?? []);
    if (l.logs?.[0]) setLastRun(l.logs[0].checked_at);

    // Fetch live rainfall for each active farmer (parallel, via our oracle/check w/o trigger? we just call open-meteo direct)
    const live = await Promise.all(
      fList
        .filter((x) => x.status === 'active' || x.status === 'pending')
        .map(async (x): Promise<LiveReading> => {
          try {
            const url = new URL('https://archive-api.open-meteo.com/v1/archive');
            url.searchParams.set('latitude', String(x.latitude));
            url.searchParams.set('longitude', String(x.longitude));
            url.searchParams.set('daily', 'precipitation_sum');
            url.searchParams.set('start_date', x.season_start);
            url.searchParams.set('end_date', new Date().toISOString().split('T')[0]);
            url.searchParams.set('timezone', 'auto');
            const res = await fetch(url.toString());
            const data = await res.json();
            const total: number = (data?.daily?.precipitation_sum ?? []).reduce(
              (s: number, d: number | null) => s + (d ?? 0),
              0
            );
            return {
              farmerId: x.id,
              name: x.name,
              totalMm: total,
              thresholdMm: x.drought_threshold_mm,
            };
          } catch (e) {
            return {
              farmerId: x.id,
              name: x.name,
              totalMm: null,
              thresholdMm: x.drought_threshold_mm,
              error: e instanceof Error ? e.message : 'fetch failed',
            };
          }
        })
    );
    setReadings(live);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function runCheck(farmerId?: string) {
    setRunning(farmerId ?? 'all');
    setMessage(null);
    try {
      const url = farmerId
        ? `/api/oracle/check?farmer_id=${farmerId}`
        : '/api/oracle/check';
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      setMessage(
        res.ok
          ? `Oracle ran · checked ${data.checked ?? 0} farmer(s)${
              data.results?.some((r: { triggered: boolean }) => r.triggered)
                ? ' · 1 or more payouts triggered'
                : ''
            }`
          : data.error ?? 'oracle run failed'
      );
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'oracle run failed');
    } finally {
      setRunning(null);
    }
  }

  async function simulate(farmerId: string) {
    setRunning(farmerId);
    setMessage(null);
    try {
      const res = await fetch('/api/oracle/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farmerId }),
      });
      const data = await res.json();
      setMessage(res.ok ? 'Drought simulated. Payout released on-chain.' : data.error ?? 'simulate failed');
      await loadAll();
    } finally {
      setRunning(null);
    }
  }

  return (
    <main className="min-h-screen bg-grid">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              · Oracle
            </span>
          </Link>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest">
            <Link href="/admin" className="text-nimbus-300 hover:text-text">
              Overview
            </Link>
            <Link href="/admin/deploy" className="text-nimbus-300 hover:text-text">
              Deploy
            </Link>
            <Link href="/admin/oracle" className="text-text">
              Oracle
            </Link>
            <Link href="/admin/pools" className="text-nimbus-300 hover:text-text">
              Pools
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
              Last run
            </div>
            <div className="mt-2 font-display text-2xl text-text">
              {lastRun ? new Date(lastRun).toLocaleString() : '—'}
            </div>
          </div>
          <div className="card p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
              Schedule
            </div>
            <div className="mt-2 font-display text-2xl text-text">06:00 UTC · daily</div>
            <div className="mt-1 font-mono text-[11px] text-nimbus-300/70">
              cron: 0 6 * * * · Vercel
            </div>
          </div>
          <div className="card flex items-center justify-between p-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                Manual trigger
              </div>
              <div className="mt-2 font-body text-sm text-nimbus-300">Run for all active farms</div>
            </div>
            <button
              className="btn-primary text-sm disabled:opacity-50"
              disabled={running === 'all'}
              onClick={() => runCheck()}
            >
              {running === 'all' ? 'running…' : 'Run oracle now'}
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-6 card border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] p-4 font-mono text-xs text-oracle-safe">
            {message}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Live rainfall readings
              </span>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {readings.map((r) => {
                const status =
                  r.totalMm == null ? 'safe' : rainfallStatus(r.totalMm, r.thresholdMm);
                return (
                  <li key={r.farmerId} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                    <div className="col-span-5 font-head text-sm text-text">{r.name}</div>
                    <div className="col-span-3 font-mono text-sm text-text">
                      {r.totalMm != null ? formatMm(r.totalMm) : 'err'}
                      <span className="ml-1 text-nimbus-300/60">
                        / {formatMm(r.thresholdMm, 0)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={status} />
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        className="font-mono text-[11px] text-nimbus-300 hover:text-text disabled:opacity-50"
                        disabled={running === r.farmerId}
                        onClick={() => runCheck(r.farmerId)}
                      >
                        {running === r.farmerId ? '…' : 'check'}
                      </button>
                      {' · '}
                      <button
                        className="font-mono text-[11px] text-oracle-trigger hover:underline disabled:opacity-50"
                        disabled={running === r.farmerId}
                        onClick={() => simulate(r.farmerId)}
                      >
                        sim
                      </button>
                    </div>
                  </li>
                );
              })}
              {readings.length === 0 && (
                <li className="px-5 py-6 font-mono text-xs text-nimbus-300/70">
                  No active farmers to read.
                </li>
              )}
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Oracle check log
              </span>
            </div>
            <div className="max-h-[440px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[var(--bg-2)]">
                  <tr className="border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                    <th className="px-5 py-2">When</th>
                    <th className="px-5 py-2">Farmer</th>
                    <th className="px-5 py-2">Rainfall</th>
                    <th className="px-5 py-2">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => {
                    const farmer = farmers.find((f) => f.id === l.farmer_id);
                    return (
                      <tr key={l.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-5 py-2 font-mono text-[11px] text-nimbus-300">
                          {new Date(l.checked_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-2 font-body text-sm text-text">
                          {farmer?.name ?? shortHash(l.farmer_id, 4, 4)}
                        </td>
                        <td className="px-5 py-2 font-mono text-xs text-text">
                          {formatMm(l.rainfall_cumulative_mm)}{' '}
                          {l.triggered && (
                            <span className="ml-1 text-oracle-trigger">▼</span>
                          )}
                        </td>
                        <td className="px-5 py-2 font-mono text-[11px]">
                          {l.tx_hash ? (
                            <a
                              href={stellarExpertTxUrl(l.tx_hash)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-oracle-trigger hover:underline"
                            >
                              {shortHash(l.tx_hash, 6, 4)}
                            </a>
                          ) : (
                            <span className="text-nimbus-300/60">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 font-mono text-xs text-nimbus-300/70">
                        No oracle checks logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
