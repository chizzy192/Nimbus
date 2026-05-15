'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { StatusBadge } from '@/components/StatusBadge';
import { formatUsdc, shortHash, stellarExpertContractUrl, escrowViewerUrl } from '@/lib/utils';
import type { Farmer } from '@/types/nimbus';

export default function AdminDeployPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyStage, setBusyStage] = useState<'deploy' | 'fund' | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function refresh() {
    const r = await fetch('/api/farmers').then((r) => r.json());
    setFarmers(r.farmers ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  function pushLog(line: string) {
    setLog((l) => [`${new Date().toLocaleTimeString()} · ${line}`, ...l].slice(0, 30));
  }

  async function deploy(farmer: Farmer) {
    setBusyId(farmer.id);
    setBusyStage('deploy');
    pushLog(`Deploying escrow for ${farmer.name}…`);
    try {
      const res = await fetch('/api/escrow/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farmer.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushLog(`✗ deploy failed: ${data.error}`);
      } else {
        pushLog(`✓ contract: ${shortHash(data.contractId ?? '—')}`);
      }
      await refresh();
    } finally {
      setBusyId(null);
      setBusyStage(null);
    }
  }

  async function fund(farmer: Farmer) {
    setBusyId(farmer.id);
    setBusyStage('fund');
    pushLog(`Funding ${formatUsdc(farmer.coverage_usdc)} into ${farmer.name}'s escrow…`);
    try {
      const res = await fetch('/api/escrow/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farmer.id }),
      });
      const data = await res.json();
      pushLog(res.ok ? `✓ funded: ${shortHash(data.tx?.hash ?? '—')}` : `✗ fund failed: ${data.error}`);
      await refresh();
    } finally {
      setBusyId(null);
      setBusyStage(null);
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
              · Deploy
            </span>
          </Link>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest">
            <Link href="/admin" className="text-nimbus-300 hover:text-text">
              Overview
            </Link>
            <Link href="/admin/deploy" className="text-text">
              Deploy
            </Link>
            <Link href="/admin/oracle" className="text-nimbus-300 hover:text-text">
              Oracle
            </Link>
            <Link href="/admin/pools" className="text-nimbus-300 hover:text-text">
              Pools
            </Link>
            <Link href="/admin/settings" className="text-nimbus-300 hover:text-text">
              Settings
            </Link>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="card mb-8 flex items-center justify-between p-5">
          <div>
            <div className="section-label mb-1">Sponsor wallet</div>
            <p className="mt-1 font-body text-sm text-nimbus-300/80">
              Connect Freighter to deploy and fund escrows. Funds are signed server-side
              by the platform wallet; your wallet authorises the deployment.
            </p>
          </div>
          <WalletConnect />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Farmers
              </span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                  <th className="px-5 py-2">Farmer</th>
                  <th className="px-5 py-2">Coverage</th>
                  <th className="px-5 py-2">Contract</th>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f) => (
                  <tr key={f.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-head text-sm text-text">{f.name}</div>
                      <div className="font-mono text-[11px] text-nimbus-300/70">
                        {f.region ?? '—'} · {f.crop_type ?? '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-display text-lg text-nimbus-400">
                      {formatUsdc(f.coverage_usdc)}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-nimbus-300">
                      {f.contract_id ? (
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={stellarExpertContractUrl(f.contract_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-text hover:underline"
                          >
                            {shortHash(f.contract_id, 6, 6)}
                          </a>
                          <a
                            href={escrowViewerUrl(f.contract_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-nimbus-400 hover:underline"
                          >
                            view escrow ↗
                          </a>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={
                          f.payout_triggered
                            ? 'trigger'
                            : f.status === 'active'
                              ? 'active'
                              : f.status === 'expired'
                                ? 'expired'
                                : 'pending'
                        }
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!f.contract_id ? (
                        <button
                          className="btn-ghost text-xs disabled:opacity-50"
                          disabled={busyId === f.id}
                          onClick={() => deploy(f)}
                        >
                          {busyId === f.id && busyStage === 'deploy' ? 'deploying…' : 'deploy'}
                        </button>
                      ) : (
                        <button
                          className="btn-ghost text-xs disabled:opacity-50"
                          disabled={busyId === f.id}
                          onClick={() => fund(f)}
                        >
                          {busyId === f.id && busyStage === 'fund' ? 'funding…' : 'fund'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {farmers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 font-mono text-xs text-nimbus-300/70">
                      No farmers yet. Register one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                Deploy log
              </span>
            </div>
            <ul className="max-h-[440px] overflow-y-auto p-5 space-y-2 font-mono text-[11px] text-nimbus-300">
              {log.length === 0 && <li className="text-nimbus-300/60">awaiting actions…</li>}
              {log.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
