import Link from 'next/link';
import { LiveTicker } from '@/components/LiveTicker';
import { OracleStatusCard } from '@/components/OracleStatusCard';
import { OracleRingVisual } from '@/components/OracleRingVisual';
import { Reveal } from '@/components/Reveal';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-grid">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold tracking-tight text-text">
              Nimbus
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#how" className="font-body text-sm text-nimbus-300 link-draw hover:text-text">
              How it works
            </Link>
            <Link href="#oracle" className="font-body text-sm text-nimbus-300 link-draw hover:text-text">
              The Oracle
            </Link>
            <Link href="#trust-model" className="font-body text-sm text-nimbus-300 link-draw hover:text-text">
              Trust model
            </Link>
            <Link href="#roles" className="font-body text-sm text-nimbus-300 link-draw hover:text-text">
              Escrow
            </Link>
            <Link href="#sponsors" className="font-body text-sm text-nimbus-300 link-draw hover:text-text">
              Sponsors
            </Link>
            <Link href="/admin" className="font-body text-sm text-nimbus-300 link-draw hover:text-text">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/farmer/me"
              className="hidden font-mono text-[11px] uppercase tracking-widest text-nimbus-300 link-draw hover:text-text md:inline"
            >
              I have a policy
            </Link>
            <Link href="/farmer/onboarding" className="btn-primary text-sm">
              Enrol your farm
            </Link>
          </div>
        </div>
      </nav>

      {/* Hackathon banner */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-2)]/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5 text-[11px]">
          <span className="font-mono uppercase tracking-widest text-nimbus-400">
            ☁︎ Built for Boundless × Trustless Work · May 13–16, 2026
          </span>
          <Link
            href="/about"
            className="font-mono uppercase tracking-widest text-nimbus-300 link-draw hover:text-text"
          >
            Submission details →
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-aurora">
        {/* Floating cloud glyphs */}
        <span className="cloud" style={{ top: '12%', left: '8%', animationDelay: '0s' }}>☁︎</span>
        <span className="cloud" style={{ top: '60%', left: '4%', fontSize: '2.5rem', animationDelay: '-4s' }}>☁︎</span>
        <span className="cloud" style={{ top: '20%', right: '12%', fontSize: '3rem', animationDelay: '-7s' }}>☁︎</span>
        <span className="cloud" style={{ bottom: '14%', right: '6%', fontSize: '5rem', animationDelay: '-10s' }}>☁︎</span>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <Reveal>
              <div className="section-label mb-6">Parametric climate insurance · Stellar</div>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="font-display text-5xl leading-[1.05] text-text md:text-7xl">
                When rain fails,
                <br />
                <span className="text-shimmer">Nimbus pays.</span>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-md font-body text-lg text-nimbus-300">
                Drought insurance for Africa&apos;s smallholders. Satellite-verified rainfall.
                On-chain escrow. USDC payouts in seconds — no claims, no adjusters, no paperwork.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/farmer/onboarding" className="btn-primary animate-glow">
                  Enrol a farm
                </Link>
                <Link href="#how" className="btn-ghost">
                  See how it works
                </Link>
              </div>
            </Reveal>
            <Reveal delay={480}>
              <div className="mt-10 flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70">
                <span>Built on Stellar</span>
                <span className="h-1 w-1 rounded-full bg-nimbus-300/40" />
                <span>Trustless Work</span>
                <span className="h-1 w-1 rounded-full bg-nimbus-300/40" />
                <span>Open-Meteo</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300} className="flex items-center">
            <OracleStatusCard
              rows={[
                { farm: 'Amina Hassan', region: 'Kano North · sorghum', rainfallMm: 38.4, thresholdMm: 50, status: 'warning' },
                { farm: 'Emeka Okonkwo', region: 'Abuja Central · maize', rainfallMm: 91.2, thresholdMm: 50, status: 'safe' },
                { farm: 'Fatima Musa', region: 'Katsina · millet', rainfallMm: 22.1, thresholdMm: 50, status: 'trigger', txHash: 'abc123def456789012345' },
                { farm: 'Yusuf Bello', region: 'Sokoto · sorghum', rainfallMm: 64.8, thresholdMm: 50, status: 'safe' },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Ticker */}
      <LiveTicker
        stats={[
          { label: 'Farms protected', value: '1,247' },
          { label: 'USDC paid out', value: '$184k' },
          { label: 'Active policies', value: '936' },
          { label: 'Avg payout', value: '4.8s' },
          { label: 'Oracle uptime', value: '99.98%' },
          { label: 'Regions live', value: '14' },
        ]}
      />

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="section-label mb-4">How it works</div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mb-12 max-w-2xl font-display text-4xl text-text md:text-5xl">
            Four steps. No claim forms.
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { n: '01', t: 'Register', d: 'Farmer enrols with phone + GPS pin. A custodial Stellar wallet is generated.' },
            { n: '02', t: 'Oracle monitors', d: 'Daily Open-Meteo rainfall pull at 06:00 UTC. Cumulative totals tracked per farm.' },
            { n: '03', t: 'Drought confirmed', d: 'Cumulative rainfall below threshold triggers an automatic escrow release.' },
            { n: '04', t: 'USDC arrives', d: 'Stellar Soroban contract pays the farmer wallet. SMS confirmation in seconds.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="card lift relative overflow-hidden p-6 h-full">
                <div className="absolute -right-2 -top-6 font-display text-7xl text-nimbus-500/10">
                  {s.n}
                </div>
                <div className="relative">
                  <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
                    Step {s.n}
                  </div>
                  <h3 className="mt-2 font-head text-xl text-text">{s.t}</h3>
                  <p className="mt-2 font-body text-sm text-nimbus-300">{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The Oracle */}
      <section id="oracle" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <OracleRingVisual />
          </Reveal>
          <div>
            <Reveal>
              <div className="section-label mb-4">The Oracle</div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mb-6 font-display text-4xl text-text md:text-5xl">
                An insurance department made of code.
              </h2>
            </Reveal>
            <ul className="space-y-5">
              {[
                { t: 'Satellite-grade rainfall', d: 'Open-Meteo historical archive — global coverage, no API key, deterministic outputs.' },
                { t: 'Daily cron at 06:00 UTC', d: 'Vercel Cron triggers the oracle endpoint every morning. Every active policy is checked.' },
                { t: 'Server-side XDR signing', d: 'Stellar SDK signs Trustless Work approvals on the server. No wallet popups for farmers.' },
                { t: 'On-chain audit trail', d: 'Every check, threshold breach, and payout transaction is recorded on Stellar Expert.' },
              ].map((b, i) => (
                <Reveal key={b.t} delay={i * 100}>
                  <li className="flex gap-4">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-nimbus-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse-dot" />
                    <div>
                      <div className="font-head text-base text-text">{b.t}</div>
                      <div className="font-body text-sm text-nimbus-300">{b.d}</div>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust model — the four judging questions */}
      <section id="trust-model" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="section-label mb-4">Trust model</div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mb-12 max-w-3xl font-display text-4xl text-text md:text-5xl">
            Four answers every escrow product owes you.
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              q: 'What trust problem are we solving?',
              a:
                "Smallholder farmers can't afford traditional crop insurance — premiums are too high, claims take months, and adjusters never visit their villages. Climate funds want to send relief faster than NGO operations allow.",
            },
            {
              q: 'Who are the parties?',
              a:
                'The farmer (Receiver), the sponsor pool funding the coverage, Nimbus as the platform operator that runs the oracle, and Open-Meteo as the off-chain weather source.',
            },
            {
              q: 'What condition unlocks the funds?',
              a:
                "Cumulative rainfall at the farmer's GPS coordinates falling below their season threshold (default 50mm). The oracle reads from Open-Meteo's historical archive — deterministic, auditable, no human judgement.",
            },
            {
              q: 'Who resolves disputes?',
              a:
                'The platform wallet is the Dispute Resolver of last resort. In practice the oracle is parametric — there is nothing to dispute: rainfall either crossed the threshold or it did not, and the on-chain record proves which.',
            },
          ].map((item, i) => (
            <Reveal key={item.q} delay={i * 100}>
              <div className="card lift p-7 h-full">
                <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
                  Q · 0{i + 1}
                </div>
                <h3 className="mt-2 font-head text-lg text-text">{item.q}</h3>
                <p className="mt-3 font-body text-sm text-nimbus-300">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Escrow roles & milestone */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="section-label mb-4">The escrow</div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mb-3 max-w-3xl font-display text-4xl text-text md:text-5xl">
            One Single-Release escrow per farmer.
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mb-12 max-w-2xl font-body text-nimbus-300">
            Trustless Work&apos;s primitive: a milestone-based escrow that only releases when its
            condition is met. Every role is the platform wallet so the oracle can fire the payout
            autonomously — except <span className="text-text">Receiver</span>, locked to the
            farmer&apos;s custodial wallet so funds can only ever land with them.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-[var(--border)] md:grid-cols-5">
              {[
                { role: 'Approver', who: 'Platform', tone: 'mute' },
                { role: 'Service Provider', who: 'Platform', tone: 'mute' },
                { role: 'Release Signer', who: 'Platform', tone: 'mute' },
                { role: 'Dispute Resolver', who: 'Platform', tone: 'mute' },
                { role: 'Receiver', who: 'Farmer ✓', tone: 'accent' },
              ].map((r) => (
                <div key={r.role} className="px-5 py-6 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
                    {r.role}
                  </div>
                  <div
                    className={`mt-2 font-head text-lg ${
                      r.tone === 'accent' ? 'text-oracle-safe' : 'text-text'
                    }`}
                  >
                    {r.who}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border)] bg-[var(--bg-3)]/60 px-5 py-4 font-mono text-[11px] text-nimbus-300">
              <span className="text-nimbus-400">milestone[0]</span> ·{' '}
              <span className="text-text">drought payout</span> ·{' '}
              <span className="text-text">amount</span>:{' '}
              <span className="text-oracle-safe">coverage.usdc</span> ·{' '}
              <span className="text-text">currency</span>:{' '}
              <span className="text-oracle-safe">USDC</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* For sponsors */}
      <section id="sponsors" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="section-label mb-4">For sponsors</div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mb-12 max-w-2xl font-display text-4xl text-text md:text-5xl">
            Fund the coverage. Watch the impact.
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card lift p-8 h-full">
              <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
                Climate funds &amp; NGOs
              </div>
              <h3 className="mt-3 font-display text-3xl text-text">Fund a pool</h3>
              <p className="mt-4 font-body text-nimbus-300">
                Deposit USDC into a season-bounded coverage pool for a region.
                Every payout is on-chain — full transparency for your donors and grant reports.
              </p>
              <Link href="/admin/onboarding" className="mt-6 inline-block btn-ghost text-sm">
                Sponsor a region →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card lift p-8 h-full">
              <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
                DeFi protocols
              </div>
              <h3 className="mt-3 font-display text-3xl text-text">Earn yield</h3>
              <p className="mt-4 font-body text-nimbus-300">
                Capital-efficient parametric coverage. Premiums collected; payouts triggered only by
                real climate events. Composable with existing Stellar liquidity pools.
              </p>
              <Link href="/admin/onboarding" className="mt-6 inline-block btn-ghost text-sm">
                See pool mechanics →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust chain */}
      <section id="trust" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="section-label mb-4">Trust chain</div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mb-12 max-w-2xl font-display text-4xl text-text md:text-5xl">
            From cloud to crop.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <div className="card relative overflow-hidden p-6">
            {/* Sweeping highlight bar */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-sweep bg-gradient-to-r from-transparent via-nimbus-500/10 to-transparent" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              {['Open-Meteo', 'Oracle', 'Trustless Work', 'Stellar', 'Mobile money'].map(
                (node, i, arr) => (
                  <div key={node} className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-3)] font-mono text-sm text-nimbus-400">
                        {i + 1}
                      </div>
                      <div className="font-head text-sm text-text">{node}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="hidden h-px w-12 bg-[var(--border-strong)] md:block" />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <div className="card lift bg-aurora relative overflow-hidden p-16 text-center">
            <div className="relative">
              <h2 className="mx-auto max-w-3xl font-display text-5xl text-text md:text-6xl">
                Africa&apos;s farmers deserve better than paperwork.
              </h2>
              <p className="mx-auto mt-6 max-w-xl font-body text-nimbus-300">
                Help us put parametric coverage in every village. Enrol a farm or fund a pool today.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/farmer/onboarding" className="btn-primary animate-glow">
                  Enrol a farm
                </Link>
                <Link href="/admin/onboarding" className="btn-ghost">
                  Sponsor a region
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-2)]/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">☁︎</span>
                <span className="font-head text-lg font-extrabold text-text">Nimbus</span>
              </div>
              <p className="mt-3 font-body text-sm text-nimbus-300/80">
                When rain fails, Nimbus pays. Parametric drought insurance on Stellar.
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
                Built for Boundless × Trustless Work · May 2026
              </p>
            </div>

            <div>
              <div className="section-label mb-3">Product</div>
              <ul className="space-y-2 font-body text-sm text-nimbus-300">
                <li><Link href="/farmer/onboarding" className="hover:text-text">Enrol a farm</Link></li>
                <li><Link href="/admin/onboarding" className="hover:text-text">Sponsor a region</Link></li>
                <li><Link href="/admin" className="hover:text-text">Admin dashboard</Link></li>
                <li><Link href="/about" className="hover:text-text">Submission details</Link></li>
              </ul>
            </div>

            <div>
              <div className="section-label mb-3">Trustless Work</div>
              <ul className="space-y-2 font-body text-sm text-nimbus-300">
                <li><a href="https://docs.trustlesswork.com" target="_blank" rel="noreferrer" className="hover:text-text">Docs ↗</a></li>
                <li><a href="https://dapp.trustlesswork.com" target="_blank" rel="noreferrer" className="hover:text-text">BackOffice dApp ↗</a></li>
                <li><a href="https://viewer.trustlesswork.com" target="_blank" rel="noreferrer" className="hover:text-text">Escrow Viewer ↗</a></li>
                <li><a href="https://github.com/Trustless-Work" target="_blank" rel="noreferrer" className="hover:text-text">GitHub ↗</a></li>
              </ul>
            </div>

            <div>
              <div className="section-label mb-3">Stack</div>
              <ul className="space-y-2 font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70">
                <li>Stellar Soroban</li>
                <li>Trustless Work REST</li>
                <li>Open-Meteo</li>
                <li>Supabase</li>
                <li>Next.js 14 · Vercel</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[var(--border)] pt-6 md:flex-row md:items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/60">
              © 2026 Nimbus · open source under MIT
            </span>
            <a
              href="https://boundlessfi.xyz"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/60 hover:text-text"
            >
              boundlessfi.xyz ↗
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
