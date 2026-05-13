'use client';

import { useState } from 'react';

export function CopyLinkButton({ label = 'Copy policy link' }: { label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState('copied');
      setTimeout(() => setState('idle'), 1800);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 1800);
    }
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-3)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-nimbus-300 transition hover:bg-[rgba(16,185,129,0.05)] hover:text-text"
    >
      {state === 'copied' ? '✓ copied' : state === 'error' ? 'copy failed' : `⧉ ${label}`}
    </button>
  );
}
