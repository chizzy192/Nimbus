'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Nimbus] runtime error:', error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-grid bg-aurora px-6">
      <div className="card max-w-xl p-10 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-oracle-trigger">
          Runtime error
        </div>
        <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">
          The storm cell hit a snag.
        </h1>
        <p className="mt-3 font-body text-sm text-nimbus-300">
          {error.message || 'Something went wrong while rendering this page.'}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-nimbus-300/70">
            digest · {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
