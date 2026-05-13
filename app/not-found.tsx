import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-grid bg-aurora px-6">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-nimbus-400">
          404 · not found
        </div>
        <h1 className="mt-3 font-display text-6xl text-text md:text-7xl">
          The cloud drifted off.
        </h1>
        <p className="mx-auto mt-4 max-w-md font-body text-nimbus-300">
          We couldn&apos;t find that page. The rain forgot to fall here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back home
          </Link>
          <Link href="/admin" className="btn-ghost">
            Admin dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
