'use client';

import { useState } from 'react';
import { useFreighter } from '@/hooks/useFreighter';
import { shortHash } from '@/lib/utils';

const FREIGHTER_URL = 'https://www.freighter.app/';

export function WalletConnect() {
  const fr = useFreighter();
  const [open, setOpen] = useState(false);

  if (fr.status === 'detecting' || fr.status === 'idle') {
    return (
      <button
        className="btn-ghost text-xs"
        disabled
      >
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-nimbus-400" />
          Detecting wallet…
        </span>
      </button>
    );
  }

  if (fr.status === 'not-installed') {
    return (
      <a
        href={FREIGHTER_URL}
        target="_blank"
        rel="noreferrer"
        className="btn-primary text-xs"
      >
        Install Freighter ↗
      </a>
    );
  }

  if (fr.status === 'locked') {
    return (
      <button className="btn-primary text-xs" onClick={fr.connect}>
        Unlock Freighter
      </button>
    );
  }

  if (fr.status === 'wrong-network') {
    return (
      <button
        className="btn-ghost text-xs"
        style={{ borderColor: 'rgba(251,191,36,0.5)', color: '#fbbf24' }}
        onClick={fr.refresh}
      >
        Switch to {fr.expectedNetwork.toUpperCase()}
      </button>
    );
  }

  if (fr.status === 'error') {
    return (
      <button
        className="btn-ghost text-xs"
        style={{ borderColor: 'rgba(248,113,113,0.5)', color: '#f87171' }}
        onClick={fr.connect}
        title={fr.error ?? undefined}
      >
        Connect failed · retry
      </button>
    );
  }

  // Connected
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-2)] px-3 py-1.5 font-mono text-[11px] text-nimbus-300 transition hover:bg-[rgba(16,185,129,0.05)]"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-nimbus-500" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-nimbus-400" />
        </span>
        {shortHash(fr.publicKey ?? '', 4, 4)}
        <span className="text-nimbus-300/60">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-2)] p-4 shadow-2xl animate-fade-in">
          <div className="font-mono text-[10px] uppercase tracking-widest text-nimbus-300/70">
            Connected wallet
          </div>
          <div className="mt-2 break-all font-mono text-[11px] text-text">{fr.publicKey}</div>
          <div className="mt-3 border-t border-[var(--border)] pt-3 font-mono text-[11px] text-nimbus-300">
            Network · <span className="text-text">{fr.network ?? '—'}</span>
          </div>
          <button
            className="mt-3 w-full rounded-md border border-[var(--border)] py-2 font-mono text-[11px] uppercase tracking-widest text-nimbus-300 transition hover:bg-[rgba(16,185,129,0.05)]"
            onClick={() => {
              setOpen(false);
              fr.disconnect();
            }}
          >
            Forget connection
          </button>
        </div>
      )}
    </div>
  );
}
