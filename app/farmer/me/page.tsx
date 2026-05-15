'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getRememberedAccount, rememberAccount } from '@/lib/farmerSession';
import { StatusBadge } from '@/components/StatusBadge';
import { WalletConnect } from '@/components/WalletConnect';
import { formatMm, formatUsdc, shortHash } from '@/lib/utils';
import type { Account, Farmer } from '@/types/nimbus';

type Phase = 'looking' | 'missing' | 'ready';

export default function AccountHomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('looking');
  const [accountIdInput, setAccountIdInput] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [farms, setFarms] = useState<Farmer[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setError(null);
    try {
      const [a, f] = await Promise.all([
        fetch(`/api/accounts/${id}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/accounts/${id}/farms`, { cache: 'no-store' }).then((r) => r.json()),
      ]);
      if (a.error || !a.account) {
        setError(a.error ?? 'account not found');
        setPhase('missing');
        return;
      }
      setAccount(a.account);
      setFarms(f.farms ?? []);
      setPhase('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'load failed');
      setPhase('missing');
    }
  }, []);

  useEffect(() => {
    const id = getRememberedAccount();
    if (id) {
      load(id);
    } else {
      setPhase('missing');
    }
  }, [load]);

  function openAccountFromInput() {
    const trimmed = accountIdInput.trim();
    if (!trimmed) return;
    rememberAccount(trimmed);
    load(trimmed);
  }

  async function payPremium(farm: Farmer) {
    if (!account) return;
    setPayingId(farm.id);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${account.id}/pay-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farm.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'payment failed');
        return;
      }
      await load(account.id);
    } finally {
      setPayingId(null);
    }
  }

  if (phase === 'looking') {
    return (
      <main className="grid min-h-screen place-items-center bg-grid bg-aurora">
        <div className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
          Looking up your account…
        </div>
      </main>
    );
  }

  if (phase === 'missing') {
    return (
      <main className="grid min-h-screen place-items-center bg-grid bg-aurora px-6">
        <div className="card w-full max-w-md p-8">
          <div className="section-label mb-3">Find your account</div>
          <h1 className="font-display text-3xl text-text">No policy on this device.</h1>
          <p className="mt-3 font-body text-sm text-nimbus-300">
            Paste your account ID below — it&apos;s the long string in your enrolment URL — or
            enrol a new farm.
          </p>
          {error && (
            <div className="mt-4 font-mono text-[11px] text-oracle-trigger">{error}</div>
          )}
          <label className="mt-6 block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
              Account ID
            </span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-3 py-2 font-mono text-sm text-text outline-none focus:border-nimbus-500"
              placeholder="e.g. 8f4a2d1c-…"
              value={accountIdInput}
              onChange={(e) => setAccountIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openAccountFromInput();
              }}
            />
          </label>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="btn-primary disabled:opacity-50"
              disabled={!accountIdInput.trim()}
              onClick={openAccountFromInput}
            >
              Open dashboard →
            </button>
            <Link href="/farmer/register" className="btn-ghost">
              Enrol a new farm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!account) return null;

  const totalCoverage = farms.reduce((s, f) => s + Number(f.coverage_usdc ?? 0), 0);
  const triggeredCount = farms.filter((f) => f.payout_triggered).length;

  return (
    <main className="min-h-screen bg-grid">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/farmer/me/settings"
              className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70 hover:text-text"
            >
              Settings
            </Link>
            <Link
              href="/farmer/onboarding"
              className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70 hover:text-text"
            >
              Help
            </Link>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-label mb-2">Welcome back</div>
            <h1 className="font-display text-5xl text-text">{account.name}</h1>
            <div className="mt-2 font-mono text-[11px] text-nimbus-300/70">
              {account.phone ?? '—'}
            </div>
          </div>
          <Link href="/farmer/me/add" className="btn-primary text-sm animate-glow">
            + Add another farm
          </Link>
        </div>

        {/* Metric cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Demo wallet" value={formatUsdc(account.demo_balance_usdc)} accent="green" />
          <Metric label="Farms enrolled" value={String(farms.length)} />
          <Metric label="Total coverage" value={formatUsdc(totalCoverage)} />
          <Metric
            label="Payouts triggered"
            value={String(triggeredCount)}
            accent={triggeredCount > 0 ? 'trigger' : undefined}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)] p-3 font-mono text-xs text-oracle-trigger">
            {error}
          </div>
        )}

        <div className="mt-10 card overflow-hidden">
          <div className="border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              Your farms &amp; seasons
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
              click a row for details
            </span>
          </div>
          {farms.length === 0 ? (
            <div className="px-5 py-8 font-mono text-xs text-nimbus-300/70">
              No farms enrolled yet. Use the &ldquo;Add another farm&rdquo; button above.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {farms.map((f) => {
                const farmStatus = f.payout_triggered
                  ? 'trigger'
                  : f.status === 'active'
                    ? 'active'
                    : f.status === 'expired'
                      ? 'expired'
                      : 'pending';
                return (
                  <li
                    key={f.id}
                    className="grid grid-cols-12 items-center gap-3 px-5 py-4 hover:bg-[rgba(16,185,129,0.04)]"
                  >
                    <Link
                      href={`/farmer/${f.id}`}
                      className="col-span-4 flex flex-col"
                      title="Open policy"
                    >
                      <span className="font-head text-base text-text">
                        {f.region ?? '—'} · {f.crop_type ?? 'crop n/a'}
                      </span>
                      <span className="font-mono text-[11px] text-nimbus-300/70">
                        {f.season_start} → {f.season_end}
                      </span>
                    </Link>
                    <div className="col-span-2 font-display text-xl text-nimbus-400">
                      {formatUsdc(f.coverage_usdc)}
                    </div>
                    <div className="col-span-2 font-mono text-[11px] text-nimbus-300">
                      threshold · {formatMm(f.drought_threshold_mm, 0)}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={farmStatus} />
                    </div>
                    <div className="col-span-2 text-right">
                      {f.premium_paid ? (
                        <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                          premium ✓ paid
                        </span>
                      ) : (
                        <button
                          className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-nimbus-300 hover:bg-[rgba(16,185,129,0.05)] hover:text-text disabled:opacity-50"
                          disabled={
                            payingId === f.id ||
                            Number(account.demo_balance_usdc) < Number(f.premium_usdc)
                          }
                          onClick={() => payPremium(f)}
                        >
                          {payingId === f.id
                            ? 'paying…'
                            : `pay ${formatUsdc(f.premium_usdc)} premium`}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-3)] p-4 font-mono text-[11px] text-nimbus-300/70">
          Account ID · <span className="text-text">{shortHash(account.id, 8, 8)}</span> · keep
          this safe to come back later from a different device.
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
  accent?: 'green' | 'trigger';
}) {
  return (
    <div className="card p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-3xl ${
          accent === 'trigger'
            ? 'text-oracle-trigger'
            : accent === 'green'
              ? 'text-nimbus-400'
              : 'text-text'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
