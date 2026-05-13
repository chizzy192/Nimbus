'use client';

import { OnboardingShell, type OnboardingSlide } from '@/components/OnboardingShell';
import { useFirstVisit } from '@/hooks/useFirstVisit';

const slides: OnboardingSlide[] = [
  {
    eyebrow: 'Admin tour · 1 of 4',
    title: "You're the platform operator.",
    body:
      "This dashboard is for sponsors and the Nimbus team. You'll deploy escrows, run oracle checks, manage coverage pools, and watch every payout fire on-chain. Connect Freighter from the nav to authorise on-chain actions.",
    accent: 'green',
    illustration: (
      <div className="grid grid-cols-2 gap-3 p-6">
        {[
          { label: 'Farms', value: '1,247' },
          { label: 'Policies', value: '936' },
          { label: 'Escrow', value: '$184k' },
          { label: 'Triggers', value: '24' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-3)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
              {m.label}
            </div>
            <div className="mt-1 font-display text-2xl text-text">{m.value}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Admin tour · 2 of 4',
    title: 'Deploy and fund escrows.',
    body:
      'For each farmer, you deploy a Trustless Work Single-Release escrow on Stellar and fund it with USDC. All escrow roles are the platform wallet except the Receiver — that lock is what makes the payout trust-minimised.',
    accent: 'cyan',
    illustration: (
      <div className="space-y-3 p-6 font-mono text-[11px] text-text w-full">
        {[
          { role: 'Approver', val: 'platform' },
          { role: 'Service Provider', val: 'platform' },
          { role: 'Release Signer', val: 'platform' },
          { role: 'Dispute Resolver', val: 'platform' },
          { role: 'Receiver', val: 'farmer ✓', accent: true },
        ].map((r) => (
          <div
            key={r.role}
            className={`flex items-center justify-between rounded-md border px-3 py-2 ${
              r.accent
                ? 'border-oracle-safe/40 bg-[rgba(34,211,238,0.05)] text-oracle-safe'
                : 'border-[var(--border)] bg-[var(--bg-3)] text-nimbus-300'
            }`}
          >
            <span className="uppercase tracking-widest">{r.role}</span>
            <span>{r.val}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Admin tour · 3 of 4',
    title: 'Run the oracle.',
    body:
      'Vercel Cron hits the oracle at 06:00 UTC daily. You can also trigger manual checks or simulate drought for any active farmer — useful for demos and live testing. Each run is logged with rainfall data and any resulting transaction hash.',
    accent: 'amber',
    illustration: (
      <div className="space-y-2 p-6 font-mono text-[11px] w-full">
        <div className="text-[10px] uppercase tracking-widest text-nimbus-300/70">
          oracle.log
        </div>
        {[
          { t: '06:00:01', f: 'Amina Hassan', r: '38.4mm', s: 'safe' },
          { t: '06:00:02', f: 'Emeka Okonkwo', r: '91.2mm', s: 'safe' },
          { t: '06:00:03', f: 'Fatima Musa', r: '22.1mm', s: 'TRIGGER' },
          { t: '06:00:04', f: '→ approve-milestone', r: 'submitted', s: 'tx' },
          { t: '06:00:05', f: '→ release-funds', r: '$50 USDC', s: 'tx' },
        ].map((l, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between gap-2 ${
              l.s === 'TRIGGER'
                ? 'text-oracle-trigger'
                : l.s === 'tx'
                  ? 'text-nimbus-400'
                  : 'text-nimbus-300'
            }`}
          >
            <span className="text-nimbus-300/60">{l.t}</span>
            <span className="flex-1 truncate">{l.f}</span>
            <span>{l.r}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Admin tour · 4 of 4',
    title: 'Coverage pools fund the policies.',
    body:
      'Climate funds and NGOs deposit USDC into season-bounded coverage pools. Each pool can sponsor many farms. Every payout settles on-chain, so donors and grantmakers see real impact, not promises.',
    accent: 'green',
    illustration: (
      <div className="space-y-3 p-6 w-full">
        <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-3)] p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
            Kano 2026 Season
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-display text-3xl text-text">$5,000</div>
            <div className="font-mono text-[11px] text-nimbus-300">12 policies</div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-2)]">
            <div className="h-full w-1/3 bg-nimbus-500" />
          </div>
        </div>
        <div className="font-mono text-[11px] text-nimbus-300/70">
          Sponsor: Climate Resilience Fund · active
        </div>
      </div>
    ),
  },
];

export default function AdminOnboardingPage() {
  const visit = useFirstVisit('admin');

  return (
    <OnboardingShell
      brand="Admin tour"
      slides={slides}
      primaryCta={{ href: '/admin', label: 'Enter the dashboard' }}
      skipHref="/admin"
      onComplete={visit.markSeen}
    />
  );
}
