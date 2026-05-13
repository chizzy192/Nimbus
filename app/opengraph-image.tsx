import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Nimbus · When rain fails, Nimbus pays.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(60% 50% at 20% 30%, rgba(16,185,129,0.35), transparent 70%), radial-gradient(50% 40% at 80% 70%, rgba(34,211,238,0.25), transparent 70%), #050d0a',
          color: '#ecfdf5',
          padding: '72px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 64 }}>☁︎</span>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>Nimbus</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 28,
              color: '#10b981',
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Parametric drought insurance · Stellar
          </span>
          <span
            style={{
              marginTop: 32,
              fontSize: 110,
              lineHeight: 1.05,
              fontWeight: 700,
              fontFamily: 'serif',
            }}
          >
            When rain fails,
          </span>
          <span
            style={{
              fontSize: 110,
              lineHeight: 1.05,
              fontWeight: 700,
              fontFamily: 'serif',
              color: '#34d399',
            }}
          >
            Nimbus pays.
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#6ee7b7',
            fontSize: 24,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <span>Built on Trustless Work</span>
          <span>Boundless × TW · May 2026</span>
        </div>
      </div>
    ),
    size
  );
}
