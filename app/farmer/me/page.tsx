'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRememberedFarmer } from '@/lib/farmerSession';

export default function FarmerMePage() {
  const router = useRouter();
  const [state, setState] = useState<'looking' | 'missing'>('looking');
  const [farmerIdInput, setFarmerIdInput] = useState('');

  useEffect(() => {
    const id = getRememberedFarmer();
    if (id) {
      router.replace(`/farmer/${id}`);
    } else {
      setState('missing');
    }
  }, [router]);

  function go() {
    const trimmed = farmerIdInput.trim();
    if (!trimmed) return;
    router.push(`/farmer/${trimmed}`);
  }

  if (state === 'looking') {
    return (
      <main className="grid min-h-screen place-items-center bg-grid bg-aurora">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
            Looking up your policy…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-grid bg-aurora px-6">
      <div className="card w-full max-w-md p-8">
        <div className="section-label mb-3">Find your policy</div>
        <h1 className="font-display text-3xl text-text">No policy on this device.</h1>
        <p className="mt-3 font-body text-sm text-nimbus-300">
          Paste your farmer ID below — it&apos;s the long string in your enrolment URL. Or
          enrol a new farm.
        </p>

        <label className="mt-6 block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
            Farmer ID
          </span>
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-3 py-2 font-mono text-sm text-text outline-none focus:border-nimbus-500"
            placeholder="e.g. 8f4a2d1c-…"
            value={farmerIdInput}
            onChange={(e) => setFarmerIdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') go();
            }}
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary disabled:opacity-50" disabled={!farmerIdInput.trim()} onClick={go}>
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
