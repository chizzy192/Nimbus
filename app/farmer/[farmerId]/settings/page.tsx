'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { forgetFarmer } from '@/lib/farmerSession';
import type { Farmer } from '@/types/nimbus';

interface Props {
  params: { farmerId: string };
}

export default function FarmerSettingsPage({ params }: Props) {
  const router = useRouter();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [threshold, setThreshold] = useState<number>(50);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Wallet reveal modal
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealPhone, setRevealPhone] = useState('');
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState<{ publicKey: string; secret: string } | null>(null);

  // Sign-out confirmation
  const [signOutOpen, setSignOutOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/farmers/${params.farmerId}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'failed to load farmer');
        return;
      }
      const f = data.farmer as Farmer;
      setFarmer(f);
      setPhone(f.phone);
      setThreshold(f.drought_threshold_mm);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.farmerId]);

  async function save() {
    if (!farmer) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/farmers/${params.farmerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          drought_threshold_mm: threshold,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'update failed');
        return;
      }
      setFarmer(data.farmer as Farmer);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function revealKey() {
    setRevealing(true);
    setRevealError(null);
    try {
      const res = await fetch(`/api/farmers/${params.farmerId}/export-wallet`, {
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
    forgetFarmer();
    router.push('/');
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-grid">
        <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
          Loading settings…
        </div>
      </main>
    );
  }

  if (!farmer) {
    return (
      <main className="grid min-h-screen place-items-center bg-grid">
        <div className="card max-w-md p-8 text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-oracle-trigger">
            Couldn&apos;t load this farmer
          </div>
          <p className="mt-3 font-body text-sm text-nimbus-300">{error ?? 'unknown error'}</p>
          <Link href="/" className="btn-ghost mt-6 inline-block text-sm">
            Back home
          </Link>
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
            href={`/farmer/${farmer.id}`}
            className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70 hover:text-text"
          >
            ← Back to dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="section-label mb-4">Account</div>
        <h1 className="font-display text-5xl text-text">{farmer.name}</h1>
        <p className="mt-2 font-mono text-[11px] text-nimbus-300/70">id · {farmer.id}</p>

        {/* Profile */}
        <div className="card mt-8 p-6">
          <div className="section-label mb-4">Profile</div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Phone (with country code)">
              <input
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label="Drought threshold (mm/season)">
              <input
                type="number"
                className={inputCls}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </Field>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              className="btn-primary text-sm disabled:opacity-50"
              disabled={saving || (phone === farmer.phone && threshold === farmer.drought_threshold_mm)}
              onClick={save}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
                ✓ saved
              </span>
            )}
            {error && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-oracle-trigger">
                {error}
              </span>
            )}
          </div>
        </div>

        {/* Wallet */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-4">Custodial wallet</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Public key
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="break-all font-mono text-xs text-text">
              {farmer.stellar_wallet ?? '—'}
            </span>
            {farmer.stellar_wallet && (
              <button
                className="shrink-0 rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-nimbus-300 hover:bg-[rgba(16,185,129,0.05)] hover:text-text"
                onClick={() => navigator.clipboard.writeText(farmer.stellar_wallet ?? '')}
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
              Reveal and copy the Stellar secret key for this wallet. Anyone with this
              secret controls the funds — save it offline and never share it.
            </p>
            <button
              className="mt-3 rounded-md border border-[rgba(248,113,113,0.4)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-oracle-trigger hover:bg-[rgba(248,113,113,0.06)]"
              onClick={() => setRevealOpen(true)}
            >
              Reveal private key
            </button>
          </div>
        </div>

        {/* Session */}
        <div className="card mt-6 p-6">
          <div className="section-label mb-4">Session on this device</div>
          <p className="font-body text-sm text-nimbus-300">
            Nimbus remembers your farmer ID in this browser so you can return to your
            dashboard without re-typing the URL. Signing out clears that memory — your
            policy stays active and you can come back any time with the URL.
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
                <h3 className="mt-2 font-head text-xl text-text">
                  Type your registered phone number
                </h3>
                <p className="mt-2 font-body text-sm text-nimbus-300">
                  We compare it against the number on your record before decrypting your
                  secret. The phone we have on file is{' '}
                  <span className="font-mono text-text">{farmer.phone}</span>.
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
                    onClick={revealKey}
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
                <p className="mt-2 font-body text-sm text-nimbus-300">
                  Copy this somewhere safe (a password manager). Nimbus still holds an
                  encrypted copy, but anyone with this string controls your wallet.
                </p>
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
              Your policy stays active. Bookmark your URL or save your farmer ID first:
            </p>
            <div className="mt-3 break-all rounded-lg border border-[var(--border)] bg-[var(--bg-3)] p-3 font-mono text-xs text-text">
              {farmer.id}
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
