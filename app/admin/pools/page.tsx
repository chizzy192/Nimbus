'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatUsdc } from '@/lib/utils';
import type { CoveragePool } from '@/types/nimbus';

interface PoolDraft {
  name: string;
  sponsor_name: string;
  region: string;
  season_start: string;
  season_end: string;
  total_usdc: string;
}

const empty: PoolDraft = {
  name: '',
  sponsor_name: '',
  region: '',
  season_start: '',
  season_end: '',
  total_usdc: '',
};

export default function AdminPoolsPage() {
  const [pools, setPools] = useState<CoveragePool[]>([]);
  const [draft, setDraft] = useState<PoolDraft>(empty);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch('/api/pools').then((r) => r.json());
    setPools(r.pools ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  function set<K extends keyof PoolDraft>(k: K, v: PoolDraft[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  async function create() {
    if (!draft.name) {
      setError('name required');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          sponsor_name: draft.sponsor_name || undefined,
          region: draft.region || undefined,
          season_start: draft.season_start || undefined,
          season_end: draft.season_end || undefined,
          total_usdc: draft.total_usdc ? Number(draft.total_usdc) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'pool creation failed');
        return;
      }
      setDraft(empty);
      await refresh();
    } finally {
      setCreating(false);
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
              · Pools
            </span>
          </Link>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest">
            <Link href="/admin" className="text-nimbus-300 hover:text-text">
              Overview
            </Link>
            <Link href="/admin/deploy" className="text-nimbus-300 hover:text-text">
              Deploy
            </Link>
            <Link href="/admin/oracle" className="text-nimbus-300 hover:text-text">
              Oracle
            </Link>
            <Link href="/admin/pools" className="text-text">
              Pools
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Coverage pools
              </span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                  <th className="px-5 py-2">Pool</th>
                  <th className="px-5 py-2">Sponsor</th>
                  <th className="px-5 py-2">Region · Season</th>
                  <th className="px-5 py-2">Funded</th>
                  <th className="px-5 py-2">Policies</th>
                  <th className="px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 font-head text-sm text-text">{p.name}</td>
                    <td className="px-5 py-3 font-body text-sm text-nimbus-300">
                      {p.sponsor_name ?? '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-nimbus-300">
                      {p.region ?? '—'}
                      <div className="text-nimbus-300/70">
                        {p.season_start ?? '—'} → {p.season_end ?? '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-display text-lg text-nimbus-400">
                      {p.total_usdc != null ? formatUsdc(p.total_usdc) : '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-text">{p.policies_count}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status === 'active' ? 'active' : 'expired'} />
                    </td>
                  </tr>
                ))}
                {pools.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 font-mono text-xs text-nimbus-300/70">
                      No pools yet. Create one to begin sponsoring policies.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <div className="section-label mb-3">New pool</div>
            <div className="space-y-3">
              <Field label="Name">
                <input
                  className={inputCls}
                  value={draft.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Kano 2026 Season"
                />
              </Field>
              <Field label="Sponsor">
                <input
                  className={inputCls}
                  value={draft.sponsor_name}
                  onChange={(e) => set('sponsor_name', e.target.value)}
                  placeholder="Climate Resilience Fund"
                />
              </Field>
              <Field label="Region">
                <input
                  className={inputCls}
                  value={draft.region}
                  onChange={(e) => set('region', e.target.value)}
                  placeholder="Kano"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Season start">
                  <input
                    type="date"
                    className={inputCls}
                    value={draft.season_start}
                    onChange={(e) => set('season_start', e.target.value)}
                  />
                </Field>
                <Field label="Season end">
                  <input
                    type="date"
                    className={inputCls}
                    value={draft.season_end}
                    onChange={(e) => set('season_end', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Total USDC">
                <input
                  type="number"
                  className={inputCls}
                  value={draft.total_usdc}
                  onChange={(e) => set('total_usdc', e.target.value)}
                  placeholder="5000"
                />
              </Field>

              {error && (
                <div className="rounded-lg border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)] p-3 font-mono text-[11px] text-oracle-trigger">
                  {error}
                </div>
              )}

              <button
                className="btn-primary w-full text-sm disabled:opacity-50"
                disabled={creating}
                onClick={create}
              >
                {creating ? 'Creating…' : 'Create pool'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-3 py-2 font-body text-sm text-text outline-none focus:border-nimbus-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
        {label}
      </span>
      {children}
    </label>
  );
}
