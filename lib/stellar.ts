import { Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';
import { isDemoMode } from './demo-mode';

const NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC ?? 'https://soroban-testnet.stellar.org';

function demoTxHash(): string {
  // 64 hex chars, like a real Stellar tx hash. Prefixed `dem0` so it's
  // obviously a fake when seen in logs but still passes shape checks.
  const rand = Array.from({ length: 60 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `dem0${rand}`;
}

export function signXDR(unsignedXDR: string, secretKey: string): string {
  if (isDemoMode() || !secretKey || unsignedXDR.startsWith('DEMO_XDR_')) {
    return unsignedXDR;
  }
  const keypair = Keypair.fromSecret(secretKey);
  const tx = TransactionBuilder.fromXDR(unsignedXDR, NETWORK);
  tx.sign(keypair);
  return tx.toXDR();
}

export async function submitToStellar(signedXDR: string) {
  if (isDemoMode() || signedXDR.startsWith('DEMO_XDR_')) {
    // Match the shape of Soroban RPC's SendTransactionResponse so callers
    // that read `.hash` keep working.
    return {
      status: 'PENDING' as const,
      hash: demoTxHash(),
      latestLedger: 0,
      latestLedgerCloseTime: '0',
    };
  }
  const server = new Server(RPC_URL);
  const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK);
  return server.sendTransaction(tx);
}

export function generateFarmerWallet() {
  if (isDemoMode()) {
    // Stable-looking demo keypair — never used to sign anything real.
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    return {
      publicKey: `GDEMO${id}${'0'.repeat(56 - 5 - id.length)}`,
      secret: `SDEMO${id}${'0'.repeat(56 - 5 - id.length)}`,
    };
  }
  const kp = Keypair.random();
  return { publicKey: kp.publicKey(), secret: kp.secret() };
}

export function networkLabel(): 'testnet' | 'public' {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'public' : 'testnet';
}
