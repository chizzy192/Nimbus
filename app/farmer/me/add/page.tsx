'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRememberedAccount } from '@/lib/farmerSession';
import type { Account } from '@/types/nimbus';

const FarmMap = dynamic(() => import('@/components/FarmMap').then((m) => m.FarmMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-3)] font-mono text-xs text-nimbus-300/70">
      Loading map…
    </div>
  ),
});

interface FormState {
  region: string;
  crop_type: string;
  farm_size_ha: string;
  latitude: number | null;
  longitude: number | null;
  season_start: string;
  season_end: string;
  drought_threshold_mm: number;
  coverage_usdc: number;
  premium_usdc: number;
}

const TIERS = [
  { coverage: 25, premium: 3 },
  { coverage: 50, premium: 5 },
  { coverage: 100, premium: 9 },
];

export default function AddFarmPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    region: '',
    crop_type: 'sorghum',
    farm_size_ha: '',
    latitude: null,
    longitude: null,
    season_start: '',
    season_end: '',
    drought_threshold_mm: 50,
    coverage_usdc: 50,
    premium_usdc: 5,
  });

  useEffect(() => {
    const id = getRememberedAccount();
    if (!id) {
      router.replace('/farmer/me');
      return;
    }
    fetch(`/api/accounts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.account) setAccount(data.account);
        else router.replace('/farmer/me');
      });
  }, [router]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function selectTier(c: number, p: number) {
    setForm((f) => ({ ...f, coverage_usdc: c, premium_usdc: p }));
  }
  function canFrom1() {
    return form.latitude != null && form.longitude != null;
  }
  function canFrom2() {
    return form.season_start && form.season_end;
  }

  async function submit() {
    if (!account) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${account.id}/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: form.region || undefined,
          crop_type: form.crop_type,
          farm_size_ha: form.farm_size_ha ? Number(form.farm_size_ha) : undefined,
          latitude: form.latitude!,
          longitude: form.longitude!,
          season_start: form.season_start,
          season_end: form.season_end,
          drought_threshold_mm: form.drought_threshold_mm,
          coverage_usdc: form.coverage_usdc,
          premium_usdc: form.premium_usdc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'add-farm failed');
        return;
      }
      router.push('/farmer/me');
    } finally {
      setSubmitting(false);
    }
  }

  if (!account) {
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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70">
            Step {step} / 3
          </span>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="section-label mb-3">Add another farm or season</div>
        <h1 className="font-display text-5xl text-text">
          {step === 1 && 'Drop a pin on the field.'}
          {step === 2 && 'When does the season run?'}
          {step === 3 && 'Choose coverage.'}
        </h1>
        <p className="mt-3 font-mono text-[11px] text-nimbus-300/70">
          adding under · {account.name}
        </p>

        <div className="mt-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? 'bg-nimbus-500' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        <div className="mt-10 card p-8">
          {step === 1 && (
            <div className="space-y-5">
              <FarmMap
                pins={[]}
                pickable
                picked={
                  form.latitude != null && form.longitude != null
                    ? { lat: form.latitude, lon: form.longitude }
                    : null
                }
                onPick={(lat, lon) => {
                  set('latitude', lat);
                  set('longitude', lon);
                }}
                height={380}
              />
              <div className="grid grid-cols-2 gap-3 font-mono text-xs text-nimbus-300">
                <div>
                  Latitude: <span className="text-text">{form.latitude?.toFixed(5) ?? '—'}</span>
                </div>
                <div>
                  Longitude:{' '}
                  <span className="text-text">{form.longitude?.toFixed(5) ?? '—'}</span>
                </div>
              </div>
              <Field label="Region (optional)">
                <input
                  className={inputCls}
                  value={form.region}
                  onChange={(e) => set('region', e.target.value)}
                  placeholder="Kano North"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-5">
                <Field label="Crop">
                  <select
                    className={inputCls}
                    value={form.crop_type}
                    onChange={(e) => set('crop_type', e.target.value)}
                  >
                    {['sorghum', 'millet', 'maize', 'cassava', 'rice', 'cowpea'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Farm size (ha)">
                  <input
                    className={inputCls}
                    type="number"
                    step="0.1"
                    value={form.farm_size_ha}
                    onChange={(e) => set('farm_size_ha', e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Season start">
                  <input
                    type="date"
                    className={inputCls}
                    value={form.season_start}
                    onChange={(e) => set('season_start', e.target.value)}
                  />
                </Field>
                <Field label="Season end">
                  <input
                    type="date"
                    className={inputCls}
                    value={form.season_end}
                    onChange={(e) => set('season_end', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid gap-3 md:grid-cols-3">
                {TIERS.map((t) => {
                  const active = form.coverage_usdc === t.coverage;
                  return (
                    <button
                      key={t.coverage}
                      onClick={() => selectTier(t.coverage, t.premium)}
                      className={`rounded-xl border p-5 text-left transition ${
                        active
                          ? 'border-nimbus-500 bg-[rgba(16,185,129,0.08)]'
                          : 'border-[var(--border)] bg-[var(--bg-3)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="font-display text-3xl text-text">${t.coverage}</div>
                      <div className="font-mono text-xs text-nimbus-300/70">USDC coverage</div>
                      <div className="mt-3 font-body text-sm text-nimbus-300">
                        Premium: <span className="text-text">${t.premium}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Field label="Drought threshold (mm cumulative)">
                <input
                  type="number"
                  className={inputCls}
                  value={form.drought_threshold_mm}
                  onChange={(e) => set('drought_threshold_mm', Number(e.target.value))}
                />
              </Field>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-3)] p-5 font-body text-sm text-nimbus-300">
                Your demo balance: <span className="text-text">${account.demo_balance_usdc}</span>{' '}
                · this premium will be ${form.premium_usdc}. You can pay later from the dashboard.
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)] p-3 font-mono text-xs text-oracle-trigger">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6">
            <button
              className="font-body text-sm text-nimbus-300 hover:text-text disabled:opacity-30"
              disabled={step === 1 || submitting}
              onClick={() => setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3))}
            >
              ← Back
            </button>
            {step < 3 ? (
              <button
                className="btn-primary disabled:opacity-50"
                disabled={step === 1 ? !canFrom1() : !canFrom2()}
                onClick={() => setStep((s) => (Math.min(3, s + 1) as 1 | 2 | 3))}
              >
                Continue →
              </button>
            ) : (
              <button className="btn-primary disabled:opacity-50" disabled={submitting} onClick={submit}>
                {submitting ? 'Adding…' : 'Add farm'}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-4 py-3 font-body text-text outline-none focus:border-nimbus-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
        {label}
      </span>
      {children}
    </label>
  );
}
