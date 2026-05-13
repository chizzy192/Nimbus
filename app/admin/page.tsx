'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatMm, formatUsdc, shortHash } from '@/lib/utils';
import type { Farmer, OracleCheck } from '@/types/nimbus';

const FarmMap = dynamic(() => import('@/components/FarmMap').then((m) => m.FarmMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-3)] font-mono text-xs text-nimbus-300/70">
      Loading map…
    </div>
  ),
});

export default function AdminOverviewPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [logs, setLogs] = useState<OracleCheck[]>([]);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const [f, l] = await Promise.all([
      fetch('/api/farmers').then((r) => r.json()),
      fetch('/api/oracle/logs?limit=20').then((r) => r.json()),
    ]);
    setFarmers(f.farmers ?? []);
    setLogs(l.logs ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function simulate(farmerId: string) {
    setSimulatingId(farmerId);
    setMessage(null);
    try {
      const res = await fetch('/api/oracle/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farmerId }),
      });
      const data = await res.json();
      setMessage(
        res.ok
          ? `Oracle fired. Checked ${data.checked ?? 1} farmer(s).`
          : data.error ?? 'simulate failed'
      );
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'simulate failed');
    } finally {
      setSimulatingId(null);
    }
  }

  const metrics = useMemo(() => {
    const totalUsdc = farmers.reduce((sum, f) => sum + (f.coverage_usdc ?? 0), 0);
    const active = farmers.filter((f) => f.status === 'active').length;
    const triggered = farmers.filter((f) => f.payout_triggered).length;
    return {
      farms: farmers.length,
      active,
      escrow: totalUsdc,
      triggered,
    };
  }, [farmers]);

  const pins = farmers.map((f) => ({
    id: f.id,
    name: f.name,
    latitude: f.latitude,
    longitude: f.longitude,
    status: (f.payout_triggered
      ? 'trigger'
      : f.status === 'active'
        ? 'active'
        : f.status === 'expired'
          ? 'expired'
          : 'pending') as 'pending' | 'active' | 'trigger' | 'expired',
  }));

  return (
    <main className="min-h-screen bg-grid">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              · Admin
            </span>
          </Link>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest">
            <Link href="/admin" className="text-text">
              Overview
            </Link>
            <Link href="/admin/deploy" className="text-nimbus-300 hover:text-text">
              Deploy
            </Link>
            <Link href="/admin/oracle" className="text-nimbus-300 hover:text-text">
              Oracle
            </Link>
            <Link href="/admin/pools" className="text-nimbus-300 hover:text-text">
              Pools
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric label="Total farms" value={String(metrics.farms)} />
          <Metric label="Active policies" value={String(metrics.active)} />
          <Metric label="USDC in escrow" value={formatUsdc(metrics.escrow)} />
          <Metric label="Payouts triggered" value={String(metrics.triggered)} accent="trigger" />
        </div>

        {message && (
          <div className="mt-6 card border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] p-4 font-mono text-xs text-oracle-safe">
            {message}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Farm map
              </span>
              <Link
                href="/admin/deploy"
                className="font-mono text-[11px] text-nimbus-300 hover:text-text"
              >
                + deploy escrow
              </Link>
            </div>
            <FarmMap pins={pins} height={440} />
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Simulate drought
              </span>
            </div>
            <ul className="divide-y divide-[var(--border)] max-h-[440px] overflow-y-auto">
              {farmers
                .filter((f) => !f.payout_triggered && f.status === 'active')
                .map((f) => (
                  <li key={f.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <div className="font-head text-sm text-text">{f.name}</div>
                      <div className="font-mono text-[11px] text-nimbus-300/70">
                        {f.region ?? '—'}
                      </div>
                    </div>
                    <button
                      className="btn-ghost text-xs disabled:opacity-50"
                      onClick={() => simulate(f.id)}
                      disabled={simulatingId === f.id}
                    >
                      {simulatingId === f.id ? 'firing…' : 'simulate'}
                    </button>
                  </li>
                ))}
              {farmers.filter((f) => !f.payout_triggered && f.status === 'active').length === 0 && (
                <li className="px-5 py-6 font-mono text-xs text-nimbus-300/70">
                  No active policies awaiting simulation. Deploy an escrow first.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 card overflow-hidden">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              Recent oracle checks
            </span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                <th className="px-5 py-2">Time</th>
                <th className="px-5 py-2">Farmer</th>
                <th className="px-5 py-2">Rainfall</th>
                <th className="px-5 py-2">Threshold</th>
                <th className="px-5 py-2">Status</th>
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
                      {formatMm(l.rainfall_cumulative_mm)}
                    </td>
                    <td className="px-5 py-2 font-mono text-xs text-nimbus-300">
                      {formatMm(l.threshold_mm, 0)}
                    </td>
                    <td className="px-5 py-2">
                      <StatusBadge status={l.triggered ? 'trigger' : 'safe'} />
                    </td>
                    <td className="px-5 py-2 font-mono text-[11px] text-oracle-trigger">
                      {l.tx_hash ? shortHash(l.tx_hash, 6, 4) : '—'}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 font-mono text-xs text-nimbus-300/70"
                  >
                    No oracle checks logged yet. Run /admin/oracle → manual check.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'trigger';
}) {
  return (
    <div className="card p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-3xl ${
          accent === 'trigger' ? 'text-oracle-trigger' : 'text-text'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
