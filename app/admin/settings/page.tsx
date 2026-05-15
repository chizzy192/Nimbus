'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { forgetAccount } from '@/lib/farmerSession';
import { shortHash } from '@/lib/utils';
import type { Account } from '@/types/nimbus';

interface AdminConfig {
  admin: Account;
  network: string;
  rpc: string | null;
  platform_wallet: string | null;
  tw_base_url: string | null;
  tw_api_key_set: boolean;
  cron_secret_set: boolean;
  resend_key_set: boolean;
  termii_key_set: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [cfg, setCfg] = useState<AdminConfig | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const load = useCallback(async () => {
    const data = (await fetch('/api/admin/settings', { cache: 'no-store' }).then((r) =>
      r.json()
    )) as AdminConfig;
    setCfg(data);
    setName(data.admin?.name ?? '');
    setEmail(data.admin?.email ?? '');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? 'save failed');
      } else {
        setMessage('Saved.');
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function resetBalance() {
    setResetting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_balance_usdc: 'reset' }),
      });
      const data = await res.json();
      setMessage(res.ok ? 'Demo balance reset to $1000.' : data.error ?? 'reset failed');
      await load();
    } finally {
      setResetting(false);
    }
  }

  function signOut() {
    forgetAccount();
    router.push('/');
  }

  if (!cfg) {
    return (
      <main className="grid min-h-screen place-items-center bg-grid">
        <div className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
          Loading admin settings…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-grid">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              · Admin · Settings
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
            <Link href="/admin/pools" className="text-nimbus-300 hover:text-text">
              Pools
            </Link>
            <Link href="/admin/settings" className="text-text">
              Settings
            </Link>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="section-label mb-3">Operator</div>
        <h1 className="font-display text-5xl text-text">{cfg.admin.name}</h1>
        <p className="mt-2 font-mono text-[11px] text-nimbus-300/70">
          admin account · {cfg.admin.id}
        </p>

        {message && (
          <div className="mt-6 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-3)] p-3 font-mono text-[11px] text-nimbus-300">
            {message}
          </div>
        )}

        {/* Demo budget */}
        <div className="card mt-8 p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="section-label mb-2">Demo budget</div>
              <p className="font-body text-sm text-nimbus-300">
                Hackathon credit you use to fund pools and escrows in demo mode. Resets to
                $1000 on click.
              </p>
            </div>
            <div className="font-display text-4xl text-nimbus-400">
              ${Number(cfg.admin.demo_balance_usdc).toLocaleString()}
            </div>
          </div>
          <button
            className="mt-5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-nimbus-300 hover:bg-[rgba(16,185,129,0.05)] hover:text-text disabled:opacity-50"
            disabled={resetting}
            onClick={resetBalance}
          >
            {resetting ? 'Resetting…' : 'Reset to $1000'}
          </button>
        </div>

        {/* Profile */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-4">Profile</div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Display name">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Contact email">
              <input
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nimbus.test"
              />
            </Field>
          </div>
          <button
            className="mt-5 btn-primary text-sm disabled:opacity-50"
            disabled={saving}
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* Platform / env */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-4">Platform configuration</div>
          <dl className="grid gap-4 md:grid-cols-2">
            <KV
              label="Network"
              value={cfg.network.toUpperCase()}
              accent={cfg.network === 'mainnet' ? 'amber' : 'green'}
            />
            <KV label="Soroban RPC" value={cfg.rpc ?? '—'} mono />
            <KV
              label="Platform wallet"
              value={cfg.platform_wallet ? shortHash(cfg.platform_wallet, 8, 8) : '—'}
              mono
            />
            <KV label="Trustless Work base" value={cfg.tw_base_url ?? '—'} mono />
            <KV label="TW API key" value={cfg.tw_api_key_set ? 'set ✓' : 'missing'} accent={cfg.tw_api_key_set ? 'green' : 'red'} />
            <KV label="CRON_SECRET" value={cfg.cron_secret_set ? 'set ✓' : 'missing'} accent={cfg.cron_secret_set ? 'green' : 'amber'} />
            <KV label="Resend (email)" value={cfg.resend_key_set ? 'set ✓' : 'missing'} accent={cfg.resend_key_set ? 'green' : 'amber'} />
            <KV label="Termii (SMS)" value={cfg.termii_key_set ? 'set ✓' : 'missing'} accent={cfg.termii_key_set ? 'green' : 'amber'} />
          </dl>
        </div>

        {/* Session */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-3">Session on this device</div>
          <p className="font-body text-sm text-nimbus-300">
            Sign out clears any locally stored account ID from this browser. The admin record
            in the database stays untouched.
          </p>
          <button
            className="mt-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-4 py-2 font-head text-sm text-text transition hover:bg-[rgba(16,185,129,0.05)]"
            onClick={() => setSignOutOpen(true)}
          >
            Sign out
          </button>
        </div>
      </section>

      {signOutOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 animate-fade-in">
          <div className="card w-full max-w-md p-6 text-center">
            <h3 className="font-head text-xl text-text">Sign out of this device?</h3>
            <p className="mt-2 font-body text-sm text-nimbus-300">
              You can return any time — the admin record stays in the database.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="btn-ghost text-sm" onClick={() => setSignOutOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary text-sm" onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-4 py-2.5 font-body text-text outline-none focus:border-nimbus-500';

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

function KV({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'amber' | 'red';
  mono?: boolean;
}) {
  const colour =
    accent === 'green'
      ? 'text-nimbus-400'
      : accent === 'amber'
        ? 'text-oracle-warning'
        : accent === 'red'
          ? 'text-oracle-trigger'
          : 'text-text';
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-3)] p-4">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
        {label}
      </dt>
      <dd
        className={`mt-1 ${mono ? 'font-mono text-xs break-all' : 'font-head text-base'} ${colour}`}
      >
        {value}
      </dd>
    </div>
  );
}
