import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nimbus — When rain fails, Nimbus pays',
  description:
    'Parametric drought insurance for African smallholders. Satellite-verified. On-chain. Automatic.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
