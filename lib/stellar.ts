import { Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';

const NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC ?? 'https://soroban-testnet.stellar.org';

export function signXDR(unsignedXDR: string, secretKey: string): string {
  const keypair = Keypair.fromSecret(secretKey);
  const tx = TransactionBuilder.fromXDR(unsignedXDR, NETWORK);
  tx.sign(keypair);
  return tx.toXDR();
}

export async function submitToStellar(signedXDR: string) {
  const server = new Server(RPC_URL);
  const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK);
  return server.sendTransaction(tx);
}

export function generateFarmerWallet() {
  const kp = Keypair.random();
  return { publicKey: kp.publicKey(), secret: kp.secret() };
}

export function networkLabel(): 'testnet' | 'public' {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'public' : 'testnet';
}
