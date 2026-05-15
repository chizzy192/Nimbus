/**
 * In-memory data store used when isDemoMode() is true.
 *
 * The store lives at module scope, so it persists for the lifetime of the dev
 * server process (or a single serverless container) — long enough for a demo,
 * short enough that nothing real can leak in.
 */

import { randomUUID } from 'crypto';
import type { Account, CoveragePool, Farmer, OracleCheck } from '@/types/nimbus';

// ---- Fixed IDs so links stay stable across restarts ----------------------
const ADMIN_ID = '00000000-0000-0000-0000-00000000a001';
const AMINA_ID = '00000000-0000-0000-0000-00000000f001';
const EMEKA_ID = '00000000-0000-0000-0000-00000000f002';
const FATIMA_ID = '00000000-0000-0000-0000-00000000f003';

const AMINA_FARM_ID = '00000000-0000-0000-0000-00000000d001';
const EMEKA_FARM_ID = '00000000-0000-0000-0000-00000000d002';
const FATIMA_FARM_ID = '00000000-0000-0000-0000-00000000d003';

const KANO_POOL_ID = '00000000-0000-0000-0000-0000000000a1';

const now = () => new Date().toISOString();

const SEED_ACCOUNTS: Account[] = [
  {
    id: ADMIN_ID,
    role: 'admin',
    name: 'Nimbus Platform Admin',
    phone: null,
    email: null,
    stellar_wallet: 'GDEMOPLATFORM00000000000000000000000000000000000000000',
    demo_balance_usdc: 1000,
    created_at: now(),
  },
  {
    id: AMINA_ID,
    role: 'farmer',
    name: 'Amina Hassan',
    phone: '+2348030000001',
    email: null,
    stellar_wallet: 'GDEMOAMINA0000000000000000000000000000000000000000000',
    demo_balance_usdc: 20,
    created_at: now(),
  },
  {
    id: EMEKA_ID,
    role: 'farmer',
    name: 'Emeka Okonkwo',
    phone: '+2348030000002',
    email: null,
    stellar_wallet: 'GDEMOEMEKA0000000000000000000000000000000000000000000',
    demo_balance_usdc: 20,
    created_at: now(),
  },
  {
    id: FATIMA_ID,
    role: 'farmer',
    name: 'Fatima Musa',
    phone: '+2348030000003',
    email: null,
    stellar_wallet: 'GDEMOFATIMA000000000000000000000000000000000000000000',
    demo_balance_usdc: 20,
    created_at: now(),
  },
];

const SEED_FARMERS: Farmer[] = [
  {
    id: AMINA_FARM_ID,
    account_id: AMINA_ID,
    name: 'Amina Hassan',
    phone: '+2348030000001',
    latitude: 12.0,
    longitude: 8.52,
    region: 'Kano North',
    crop_type: 'sorghum',
    farm_size_ha: 1.5,
    season_start: '2024-03-01',
    season_end: '2024-04-30',
    drought_threshold_mm: 50,
    coverage_usdc: 50,
    premium_usdc: 5,
    premium_paid: false,
    stellar_wallet: 'GDEMOAMINA0000000000000000000000000000000000000000000',
    stellar_secret: null,
    contract_id: null,
    payout_triggered: false,
    payout_triggered_at: null,
    trigger_rainfall_mm: null,
    status: 'active',
    created_at: now(),
  },
  {
    id: EMEKA_FARM_ID,
    account_id: EMEKA_ID,
    name: 'Emeka Okonkwo',
    phone: '+2348030000002',
    latitude: 9.0765,
    longitude: 7.3986,
    region: 'Abuja Central',
    crop_type: 'maize',
    farm_size_ha: 2.0,
    season_start: '2024-03-01',
    season_end: '2024-04-30',
    drought_threshold_mm: 50,
    coverage_usdc: 50,
    premium_usdc: 5,
    premium_paid: true,
    stellar_wallet: 'GDEMOEMEKA0000000000000000000000000000000000000000000',
    stellar_secret: null,
    contract_id: null,
    payout_triggered: false,
    payout_triggered_at: null,
    trigger_rainfall_mm: null,
    status: 'active',
    created_at: now(),
  },
  {
    id: FATIMA_FARM_ID,
    account_id: FATIMA_ID,
    name: 'Fatima Musa',
    phone: '+2348030000003',
    latitude: 12.9816,
    longitude: 7.6005,
    region: 'Katsina',
    crop_type: 'millet',
    farm_size_ha: 1.0,
    season_start: '2024-03-01',
    season_end: '2024-04-30',
    drought_threshold_mm: 50,
    coverage_usdc: 50,
    premium_usdc: 5,
    premium_paid: true,
    stellar_wallet: 'GDEMOFATIMA000000000000000000000000000000000000000000',
    stellar_secret: null,
    contract_id: null,
    payout_triggered: false,
    payout_triggered_at: null,
    trigger_rainfall_mm: null,
    status: 'active',
    created_at: now(),
  },
];

const SEED_POOLS: CoveragePool[] = [
  {
    id: KANO_POOL_ID,
    name: 'Kano 2024 Pilot',
    sponsor_name: 'Nimbus Foundation',
    region: 'Kano',
    season_start: '2024-03-01',
    season_end: '2024-04-30',
    total_usdc: 5000,
    policies_count: 3,
    contract_id: null,
    status: 'active',
    created_at: now(),
  },
];

interface Store {
  accounts: Account[];
  farmers: Farmer[];
  pools: CoveragePool[];
  oracleChecks: OracleCheck[];
}

let store: Store = freshStore();

function freshStore(): Store {
  // Deep copy so tests / restarts don't share references with the seed
  return {
    accounts: SEED_ACCOUNTS.map((a) => ({ ...a })),
    farmers: SEED_FARMERS.map((f) => ({ ...f })),
    pools: SEED_POOLS.map((p) => ({ ...p })),
    oracleChecks: [],
  };
}

export function resetDemoStore(): void {
  store = freshStore();
}

// ============================================================================
// ACCOUNTS
// ============================================================================
export const demoAccounts = {
  list(): Account[] {
    return store.accounts;
  },
  get(id: string): Account | null {
    return store.accounts.find((a) => a.id === id) ?? null;
  },
  getByPhone(phone: string): Account | null {
    return store.accounts.find((a) => a.phone === phone) ?? null;
  },
  getAdmin(): Account {
    return store.accounts.find((a) => a.role === 'admin')!;
  },
  insert(input: Omit<Account, 'id' | 'created_at'>): Account {
    const row: Account = { id: randomUUID(), created_at: now(), ...input };
    store.accounts.push(row);
    return row;
  },
  update(id: string, patch: Partial<Account>): Account | null {
    const idx = store.accounts.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    store.accounts[idx] = { ...store.accounts[idx], ...patch };
    return store.accounts[idx];
  },
};

// ============================================================================
// FARMERS
// ============================================================================
export const demoFarmers = {
  list(): Farmer[] {
    return [...store.farmers].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  forAccount(accountId: string): Farmer[] {
    return store.farmers
      .filter((f) => f.account_id === accountId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  get(id: string): Farmer | null {
    return store.farmers.find((f) => f.id === id) ?? null;
  },
  insert(input: Omit<Farmer, 'id' | 'created_at'>): Farmer {
    const row: Farmer = { id: randomUUID(), created_at: now(), ...input };
    store.farmers.push(row);
    return row;
  },
  update(id: string, patch: Partial<Farmer>): Farmer | null {
    const idx = store.farmers.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    store.farmers[idx] = { ...store.farmers[idx], ...patch };
    return store.farmers[idx];
  },
};

// ============================================================================
// ORACLE CHECKS
// ============================================================================
export const demoChecks = {
  list(limit = 50, farmerId?: string): OracleCheck[] {
    let rows = store.oracleChecks;
    if (farmerId) rows = rows.filter((c) => c.farmer_id === farmerId);
    return [...rows]
      .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
      .slice(0, limit);
  },
  insert(input: Omit<OracleCheck, 'id' | 'checked_at'>): OracleCheck {
    const row: OracleCheck = { id: randomUUID(), checked_at: now(), ...input };
    store.oracleChecks.push(row);
    return row;
  },
  update(id: string, patch: Partial<OracleCheck>): OracleCheck | null {
    const idx = store.oracleChecks.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.oracleChecks[idx] = { ...store.oracleChecks[idx], ...patch };
    return store.oracleChecks[idx];
  },
};

// ============================================================================
// POOLS
// ============================================================================
export const demoPools = {
  list(): CoveragePool[] {
    return [...store.pools].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  insert(input: Omit<CoveragePool, 'id' | 'created_at'>): CoveragePool {
    const row: CoveragePool = { id: randomUUID(), created_at: now(), ...input };
    store.pools.push(row);
    return row;
  },
};
