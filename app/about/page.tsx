import Link from 'next/link';
import { Reveal } from '@/components/Reveal';

export const metadata = {
  title: 'Nimbus · Submission · Boundless × Trustless Work',
  description: 'Hackathon submission summary for Nimbus.',
};

const KEY_LINKS = [
  { label: 'Trustless Work docs', href: 'https://docs.trustlesswork.com' },
  { label: 'Developer hub', href: 'https://www.trustlesswork.com/developers' },
  { label: 'BackOffice dApp', href: 'https://dapp.trustlesswork.com' },
  { label: 'Escrow Viewer', href: 'https://viewer.trustlesswork.com' },
  { label: 'MCP server', href: 'https://mcp.trustlesswork.com/mcp' },
  { label: 'Trustless Work GitHub', href: 'https://github.com/Trustless-Work' },
  { label: 'Boundless', href: 'https://boundlessfi.xyz' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-grid">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              · Submission
            </span>
          </Link>
          <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300 hover:text-text">
            ← Back to site
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <div className="section-label mb-4">Hackathon submission</div>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="font-display text-5xl text-text md:text-6xl">
            Nimbus
            <br />
            <span className="text-shimmer">parametric drought insurance.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 max-w-2xl font-body text-lg text-nimbus-300">
            Submitted to <strong className="text-text">Boundless × Trustless Work</strong> ·
            May 13–16, 2026 · virtual build + in-person Demo Day at The Block Hive, Nsukka.
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="card mt-10 p-7">
            <Field label="Project name" value="Nimbus" />
            <Field
              label="Project category"
              value="Core Trustless Work Applications · Microfinance & transparent capital allocation"
            />
            <Field
              label="Project description"
              value="Parametric drought insurance for African smallholder farmers. Every farmer is covered by a Trustless Work Single-Release escrow on Stellar. A daily oracle fetches rainfall from Open-Meteo for the farmer's GPS coordinates; if cumulative seasonal rainfall stays below threshold, the oracle signs the approve-milestone and release-funds calls server-side and USDC moves to the farmer's custodial wallet in seconds — no claim form, no adjuster, no paperwork."
            />
            <Field label="Integration path" value="React + Next.js 14 frontend talking directly to the Trustless Work REST API. Server-side XDR signing via @stellar/stellar-sdk. No SDK wrappers." />
            <Field label="Repository" value="(add your GitHub URL when you push)" mono />
            <Field label="Demo video" value="(add your Loom or YouTube URL)" mono />
            <Field label="Live demo" value="(Vercel deployment URL)" mono />
          </div>
        </Reveal>

        <Reveal delay={340}>
          <div className="mt-12">
            <div className="section-label mb-4">Trust questions</div>
            <ul className="space-y-5">
              <Trust
                q="What trust problem are we solving?"
                a="Smallholder farmers across the Sahel lose entire seasons to drought with no financial safety net. Traditional insurance is too slow, too expensive, and never reaches the last mile. Climate funds want faster, auditable relief."
              />
              <Trust
                q="Who are the parties?"
                a="Receiver: the farmer's custodial Stellar wallet. Approver / Service Provider / Release Signer / Dispute Resolver: the Nimbus platform wallet, controlled by the oracle. Funder: a coverage-pool sponsor (NGO, climate fund, or DeFi protocol)."
              />
              <Trust
                q="What condition unlocks the funds?"
                a="Cumulative rainfall at the farmer's exact GPS coordinates falling below the contracted threshold (default 50mm/season), as measured by Open-Meteo's historical weather archive. Deterministic, satellite-grade, no API key required."
              />
              <Trust
                q="Who resolves disputes?"
                a="The platform wallet holds Dispute Resolver as a last resort, but the parametric design means there is rarely anything to dispute — rainfall either crossed the threshold or it didn't, and the on-chain record is the source of truth."
              />
            </ul>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-12">
            <div className="section-label mb-4">Trustless Work integration</div>
            <ul className="space-y-3 font-body text-nimbus-300">
              <li>
                <strong className="text-text">Single-Release escrow per policy</strong> · one
                milestone, deployed via <code className="font-mono text-nimbus-400">/deployer/single-release</code>.
              </li>
              <li>
                <strong className="text-text">approve-milestone</strong> + <strong className="text-text">release-funds</strong> ·
                called server-side by the oracle, XDR signed by the platform wallet, submitted
                directly to Stellar Soroban.
              </li>
              <li>
                <strong className="text-text">Live escrow inspection</strong> · every contract
                links out to{' '}
                <a
                  href="https://viewer.trustlesswork.com"
                  className="text-nimbus-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  viewer.trustlesswork.com
                </a>{' '}
                so judges can see escrow state at any moment.
              </li>
              <li>
                <strong className="text-text">Receiver-locked design</strong> · the Receiver role
                is the only one held by the farmer, guaranteeing funds can only land with the
                covered farmer regardless of what the platform does.
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={460}>
          <div className="mt-12">
            <div className="section-label mb-4">Key links</div>
            <ul className="grid gap-2 md:grid-cols-2">
              {KEY_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-4 py-3 font-mono text-[12px] text-nimbus-300 transition hover:border-[var(--border-strong)] hover:text-text"
                  >
                    <span>{l.label}</span>
                    <span>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/admin/onboarding" className="btn-primary">
              Tour the admin
            </Link>
            <Link href="/farmer/onboarding" className="btn-ghost">
              Tour the farmer flow
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-400">
        {label}
      </div>
      <div className={`mt-1 ${mono ? 'font-mono text-xs' : 'font-body text-sm'} text-text`}>
        {value}
      </div>
    </div>
  );
}

function Trust({ q, a }: { q: string; a: string }) {
  return (
    <li className="border-l-2 border-nimbus-500/40 pl-4">
      <div className="font-head text-base text-text">{q}</div>
      <div className="mt-1 font-body text-sm text-nimbus-300">{a}</div>
    </li>
  );
}
