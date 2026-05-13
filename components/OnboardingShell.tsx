'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';

export interface OnboardingSlide {
  eyebrow: string;
  title: string;
  body: string;
  accent?: 'green' | 'cyan' | 'amber' | 'red';
  illustration: ReactNode;
}

interface OnboardingShellProps {
  brand: string;
  slides: OnboardingSlide[];
  primaryCta: { href: string; label: string };
  skipHref: string;
  onComplete?: () => void;
}

const ACCENT_GLOW: Record<NonNullable<OnboardingSlide['accent']>, string> = {
  green: '0 0 60px rgba(16,185,129,0.35)',
  cyan: '0 0 60px rgba(34,211,238,0.35)',
  amber: '0 0 60px rgba(251,191,36,0.35)',
  red: '0 0 60px rgba(248,113,113,0.35)',
};

export function OnboardingShell({
  brand,
  slides,
  primaryCta,
  skipHref,
  onComplete,
}: OnboardingShellProps) {
  const [i, setI] = useState(0);
  const slide = slides[i];
  const last = i === slides.length - 1;

  function next() {
    if (last) {
      onComplete?.();
      return;
    }
    setI((x) => Math.min(x + 1, slides.length - 1));
  }

  function prev() {
    setI((x) => Math.max(x - 1, 0));
  }

  return (
    <main className="min-h-screen bg-grid bg-aurora">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☁︎</span>
            <span className="font-head text-2xl font-extrabold text-text">Nimbus</span>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-nimbus-400">
              · {brand}
            </span>
          </Link>
          <Link
            href={skipHref}
            onClick={onComplete}
            className="font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70 hover:text-text"
          >
            Skip tour →
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl items-center gap-12 px-6 py-10 md:grid-cols-2">
        {/* Illustration */}
        <div
          key={`art-${i}`}
          className="card relative flex aspect-square items-center justify-center overflow-hidden animate-fade-in"
          style={{ boxShadow: ACCENT_GLOW[slide.accent ?? 'green'] }}
        >
          {slide.illustration}
        </div>

        {/* Copy */}
        <div key={`copy-${i}`} className="flex flex-col justify-center animate-fade-up">
          <div className="section-label mb-4">{slide.eyebrow}</div>
          <h1 className="font-display text-4xl text-text md:text-5xl">{slide.title}</h1>
          <p className="mt-6 max-w-md font-body text-lg text-nimbus-300">{slide.body}</p>

          {/* Progress */}
          <div className="mt-10 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= i ? 'bg-nimbus-500' : 'bg-[var(--border)] hover:bg-[var(--border-strong)]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={prev}
              disabled={i === 0}
              className="font-mono text-xs uppercase tracking-widest text-nimbus-300 hover:text-text disabled:opacity-30"
            >
              ← Back
            </button>

            {last ? (
              <Link
                href={primaryCta.href}
                onClick={onComplete}
                className="btn-primary animate-glow"
              >
                {primaryCta.label} →
              </Link>
            ) : (
              <button onClick={next} className="btn-primary">
                Continue →
              </button>
            )}
          </div>

          <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-nimbus-300/70">
            {i + 1} of {slides.length}
          </div>
        </div>
      </section>
    </main>
  );
}
