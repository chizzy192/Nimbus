import './globals.css';
import type { Metadata, Viewport } from 'next';
import { DemoBanner } from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: {
    default: 'Nimbus — When rain fails, Nimbus pays',
    template: '%s · Nimbus',
  },
  description:
    'Parametric drought insurance for African smallholders. Satellite-verified. On-chain. Automatic.',
  applicationName: 'Nimbus',
  keywords: [
    'parametric insurance',
    'drought insurance',
    'Stellar',
    'Trustless Work',
    'smallholder farmers',
    'climate finance',
    'USDC',
    'Soroban',
    'Open-Meteo',
  ],
  authors: [{ name: 'Nimbus' }],
  openGraph: {
    title: 'Nimbus — When rain fails, Nimbus pays',
    description:
      'Parametric drought insurance for African smallholders. Built on Stellar with Trustless Work.',
    type: 'website',
    siteName: 'Nimbus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nimbus — When rain fails, Nimbus pays',
    description:
      'Parametric drought insurance for African smallholders. Built on Stellar with Trustless Work.',
  },
};

export const viewport: Viewport = {
  themeColor: '#050d0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
