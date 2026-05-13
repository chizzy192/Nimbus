'use client';

import { OnboardingShell, type OnboardingSlide } from '@/components/OnboardingShell';
import { useFirstVisit } from '@/hooks/useFirstVisit';

const slides: OnboardingSlide[] = [
  {
    eyebrow: 'Welcome',
    title: 'Drought insurance, automatic.',
    body:
      'Nimbus pays you in USDC when satellite rainfall data shows your season is below threshold. No claim forms, no adjusters, no waiting.',
    accent: 'green',
    illustration: (
      <div className="relative">
        <div className="text-[10rem]">☁︎</div>
        <div className="absolute -bottom-4 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-nimbus-500/60 animate-pulse-dot" />
      </div>
    ),
  },
  {
    eyebrow: 'How it works',
    title: 'The oracle watches the sky.',
    body:
      "Every morning we pull rainfall for your exact GPS pin from Open-Meteo. If the season's cumulative rainfall drops below your threshold, the escrow releases automatically.",
    accent: 'cyan',
    illustration: (
      <div className="relative h-full w-full">
        <div className="absolute inset-[15%] rounded-full border border-[var(--border-strong)]" />
        <div className="absolute inset-[28%] rounded-full border border-nimbus-500/40" />
        <div className="absolute inset-[42%] animate-ring-pulse rounded-full bg-oracle-safe/30" />
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-oracle-safe shadow-[0_0_30px_rgba(34,211,238,0.7)]" />
        <span className="absolute left-1/2 top-4 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-oracle-safe">
          Open-Meteo
        </span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-nimbus-300">
          Your farm
        </span>
      </div>
    ),
  },
  {
    eyebrow: 'Your wallet',
    title: 'We hold your wallet keys safely.',
    body:
      'When you enrol, we generate a Stellar wallet just for you and encrypt the keys with AES-256. Payouts land directly there — you can ask for the keys any time.',
    accent: 'green',
    illustration: (
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
          Your wallet
        </div>
        <div className="mt-3 break-all rounded-xl border border-[var(--border-strong)] bg-[var(--bg-3)] p-4 font-mono text-xs text-text">
          G···CUSTODIAL···WALLET···KEY···STELLAR
        </div>
        <div className="mt-4 font-display text-3xl text-nimbus-400">$50 USDC</div>
        <div className="font-mono text-[11px] text-nimbus-300/70">payout, if triggered</div>
      </div>
    ),
  },
  {
    eyebrow: 'Ready',
    title: "Let's enrol your field.",
    body:
      "Phone, GPS pin, crop and season. Less than two minutes. You'll get an SMS the moment a payout fires.",
    accent: 'amber',
    illustration: (
      <div className="flex flex-col items-center gap-4">
        <div className="font-display text-5xl text-text">2 mins</div>
        <ul className="space-y-2 font-body text-sm text-nimbus-300">
          <li>① Name &amp; phone</li>
          <li>② GPS pin + season</li>
          <li>③ Coverage tier</li>
        </ul>
      </div>
    ),
  },
];

export default function FarmerOnboardingPage() {
  const visit = useFirstVisit('farmer');

  return (
    <OnboardingShell
      brand="Farmer tour"
      slides={slides}
      primaryCta={{ href: '/farmer/register', label: 'Enrol my farm' }}
      skipHref="/farmer/register"
      onComplete={visit.markSeen}
    />
  );
}
