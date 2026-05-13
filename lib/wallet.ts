import crypto from 'crypto';
import { generateFarmerWallet } from './stellar';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.WALLET_ENCRYPTION_KEY ?? '';
  if (!raw) {
    // Deterministic dev fallback so the app can boot locally without secrets.
    // In production WALLET_ENCRYPTION_KEY must be set (32 bytes, base64 or hex).
    return crypto.createHash('sha256').update('nimbus-dev-key').digest();
  }
  if (raw.length === 64) return Buffer.from(raw, 'hex');
  if (raw.length === 44) return Buffer.from(raw, 'base64');
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const enc = Buffer.from(encB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

export function createCustodialWallet() {
  const { publicKey, secret } = generateFarmerWallet();
  return { publicKey, encryptedSecret: encryptSecret(secret) };
}
