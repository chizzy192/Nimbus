'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { forgetAccount, getRememberedAccount } from '@/lib/farmerSession';
import type { Account, Farmer } from '@/types/nimbus';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [farms, setFarms] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet reveal modal (operates against the first farm row — wallet is shared)
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealPhone, setRevealPhone] = useState('');
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ publicKey: string; secret: string } | null>(null);

  const [signOutOpen, setSignOutOpen] = useState(false);

  const load = useCallback(async () => {
    const id = getRememberedAccount();
    if (!id) {
      router.replace('/farmer/me');
      return;
    }
    setLoading(true);
    try {
      const [a, f] = await Promise.all([
        fetch(`/api/accounts/${id}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/accounts/${id}/farms`, { cache: 'no-store' }).then((r) => r.json()),
      ]);
      if (!a.account) {
        router.replace('/farmer/me');
        return;
      }
      setAccount(a.account);
      setFarms(f.farms ?? []);
      setName(a.account.name ?? '');
      setPhone(a.account.phone ?? '');
      setEmail(a.account.email ?? '');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!account) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'update failed');
        return;
      }
      setAccount(data.account);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function reveal() {
    const firstFarmId = farms[0]?.id;
    if (!firstFarmId) return;
    setRevealing(true);
    setRevealError(null);
    try {
      const res = await fetch(`/api/farmers/${firstFarmId}/export-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm_phone: revealPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRevealError(data.error ?? 'reveal failed');
        return;
      }
      setRevealed({ publicKey: data.publicKey, secret: data.secret });
    } finally {
      setRevealing(false);
    }
  }

  function closeReveal() {
    setRevealOpen(false);
    setRevealed(null);
    setRevealPhone('');
    setRevealError(null);
  }

  function signOut() {
    forgetAccount();
    router.push('/');
  }

  if (loading || !account) {
    return (
      <main className="grid min-h-screen place-items-center bg-grid">
        <div className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-grid">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              · Settings
            </span>
          </Link>
          <Link
            href="/farmer/me"
            className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70 hover:text-text"
          >
            ← Back to dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="section-label mb-3">Account</div>
        <h1 className="font-display text-5xl text-text">{account.name}</h1>
        <p className="mt-2 font-mono text-[11px] text-nimbus-300/70">id · {account.id}</p>

        {/* Demo wallet */}
        <div className="card mt-8 p-6">
          <div className="section-label mb-3">Demo wallet</div>
          <div className="flex items-baseline justify-between">
            <div className="font-display text-4xl text-nimbus-400">
              ${Number(account.demo_balance_usdc).toLocaleString()}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
              hackathon credit
            </span>
          </div>
          <p className="mt-3 font-body text-sm text-nimbus-300">
            Use this credit to pay your premiums in the demo. Each farm has a premium of about
            $5; you start with $20.
          </p>
        </div>

        {/* Profile */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-4">Profile</div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Phone (with country code)">
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Email (optional)">
              <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button className="btn-primary text-sm disabled:opacity-50" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                ✓ saved
              </span>
            )}
            {error && (
              <span className="font-mono text-[11px] text-oracle-trigger">{error}</span>
            )}
          </div>
        </div>

        {/* Wallet */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-3">Custodial wallet</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Public key
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="break-all font-mono text-xs text-text">
              {account.stellar_wallet ?? '—'}
            </span>
            {account.stellar_wallet && (
              <button
                className="shrink-0 rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-nimbus-300 hover:bg-[rgba(16,185,129,0.05)] hover:text-text"
                onClick={() => navigator.clipboard.writeText(account.stellar_wallet ?? '')}
              >
                ⧉ copy
              </button>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.04)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-oracle-trigger">
              Danger zone · export private key
            </div>
            <p className="mt-2 font-body text-sm text-nimbus-300">
              Reveal the Stellar secret. Anyone with this string controls the wallet — save it
              offline and never share it.
            </p>
            <button
              className="mt-3 rounded-md border border-[rgba(248,113,113,0.4)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-oracle-trigger hover:bg-[rgba(248,113,113,0.06)] disabled:opacity-50"
              disabled={farms.length === 0}
              onClick={() => setRevealOpen(true)}
              title={farms.length === 0 ? 'Enrol at least one farm first' : undefined}
            >
              Reveal private key
            </button>
          </div>
        </div>

        {/* Session */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-3">Session on this device</div>
          <p className="font-body text-sm text-nimbus-300">
            Nimbus remembers your account ID in this browser. Sign out clears it; your policies
            stay active.
          </p>
          <button
            className="mt-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-4 py-2 font-head text-sm text-text transition hover:bg-[rgba(16,185,129,0.05)]"
            onClick={() => setSignOutOpen(true)}
          >
            Sign out
          </button>
        </div>
      </section>

      {/* Reveal modal */}
      {revealOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 animate-fade-in">
          <div className="card w-full max-w-lg p-6">
            {!revealed ? (
              <>
                <div className="font-mono text-[10px] uppercase tracking-widest text-oracle-trigger">
                  Confirm to reveal
                </div>
                <h3 className="mt-2 font-head text-xl text-text">Type your registered phone</h3>
                <p className="mt-2 font-body text-sm text-nimbus-300">
                  We check it against the number on record before decrypting. We have{' '}
                  <span className="font-mono text-text">{account.phone ?? '—'}</span> on file.
                </p>
                <input
                  className={`${inputCls} mt-4`}
                  placeholder="+234 803 000 0000"
                  value={revealPhone}
                  onChange={(e) => setRevealPhone(e.target.value)}
                />
                {revealError && (
                  <div className="mt-3 font-mono text-[11px] text-oracle-trigger">
                    {revealError}
                  </div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <button className="btn-ghost text-sm" onClick={closeReveal}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary text-sm disabled:opacity-50"
                    disabled={revealing || !revealPhone.trim()}
                    onClick={reveal}
                  >
                    {revealing ? 'Decrypting…' : 'Reveal'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="font-mono text-[10px] uppercase tracking-widest text-oracle-trigger">
                  Stellar secret · save this once
                </div>
                <h3 className="mt-2 font-head text-xl text-text">Your private key</h3>
                <div className="mt-4 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-3)] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                    Public key
                  </div>
                  <div className="mt-1 break-all font-mono text-xs text-text">
                    {revealed.publicKey}
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.05)] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-oracle-trigger">
                    Secret key
                  </div>
                  <div className="mt-1 break-all font-mono text-xs text-text">
                    {revealed.secret}
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    className="btn-ghost text-sm"
                    onClick={() => navigator.clipboard.writeText(revealed.secret)}
                  >
                    Copy secret
                  </button>
                  <button className="btn-primary text-sm" onClick={closeReveal}>
                    I&apos;ve saved it
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sign-out confirmation */}
      {signOutOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 animate-fade-in">
          <div className="card w-full max-w-md p-6 text-center">
            <h3 className="font-head text-xl text-text">Sign out of this device?</h3>
            <p className="mt-2 font-body text-sm text-nimbus-300">
              Your policies stay active. Save your account ID first:
            </p>
            <div className="mt-3 break-all rounded-lg border border-[var(--border)] bg-[var(--bg-3)] p-3 font-mono text-xs text-text">
              {account.id}
            </div>
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
