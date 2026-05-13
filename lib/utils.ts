import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsdc(amount: number | string | null | undefined): string {
  if (amount == null) return '$0';
  const n = typeof amount === 'string' ? Number(amount) : amount;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatMm(mm: number | null | undefined, digits = 1): string {
  if (mm == null) return '—';
  return `${mm.toFixed(digits)}mm`;
}

export function shortHash(hash: string | null | undefined, head = 8, tail = 6): string {
  if (!hash) return '—';
  if (hash.length <= head + tail) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function stellarExpertTxUrl(hash: string, network: 'testnet' | 'public' = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

export function stellarExpertContractUrl(
  contractId: string,
  network: 'testnet' | 'public' = 'testnet'
): string {
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
}

export function rainfallStatus(totalMm: number, thresholdMm: number): 'safe' | 'warning' | 'trigger' {
  if (totalMm < thresholdMm) return 'trigger';
  if (totalMm < thresholdMm * 1.4) return 'warning';
  return 'safe';
}
