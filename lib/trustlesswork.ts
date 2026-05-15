import { isDemoMode } from './demo-mode';

const TW_BASE = process.env.NEXT_PUBLIC_TW_BASE_URL ?? 'https://dev.api.trustlesswork.com';
const TW_KEY = process.env.NEXT_PUBLIC_TW_API_KEY ?? '';

function twHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TW_KEY}`,
  };
}

function demoContractId(prefix = 'C'): string {
  const rand = Array.from({ length: 50 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
  ).join('');
  return `${prefix}DEM0${rand.slice(0, 50)}`;
}

function isTwUnavailable(): boolean {
  return isDemoMode() || !TW_KEY;
}

interface TWResponse {
  unsignedXdr?: string;
  unsignedTransaction?: string;
  contractId?: string;
  contract_id?: string;
  [key: string]: unknown;
}

async function postTW(path: string, body: unknown): Promise<TWResponse> {
  const res = await fetch(`${TW_BASE}${path}`, {
    method: 'POST',
    headers: twHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TW ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

function pickXdr(resp: TWResponse): string {
  const xdr = resp.unsignedXdr ?? resp.unsignedTransaction;
  if (!xdr) throw new Error(`TW response missing unsignedXdr (got keys: ${Object.keys(resp).join(',')})`);
  return xdr;
}

export interface DeployFarmerEscrowInput {
  id: string;
  name: string;
  region: string;
  stellarWallet: string;
  coverageUsdc: number;
  thresholdMm: number;
}

export interface DeployFarmerEscrowResult {
  unsignedXdr: string;
  contractId: string | null;
}

export async function deployFarmerEscrow(
  farmer: DeployFarmerEscrowInput
): Promise<DeployFarmerEscrowResult> {
  if (isTwUnavailable()) {
    return {
      unsignedXdr: `DEMO_XDR_deploy_${farmer.id}`,
      contractId: demoContractId(),
    };
  }
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  const resp = await postTW('/deployer/single-release', {
    signer: PLATFORM,
    engagementId: `nimbus_${farmer.id}`,
    title: `Drought insurance — ${farmer.name}, ${farmer.region}`,
    roles: {
      approver: PLATFORM,
      serviceProvider: PLATFORM,
      platformAddress: PLATFORM,
      releaseSigner: PLATFORM,
      receiver: farmer.stellarWallet,
      disputeResolver: PLATFORM,
    },
    milestones: [
      {
        description: `Drought payout · threshold: ${farmer.thresholdMm}mm/season`,
        amount: String(farmer.coverageUsdc),
        currency: 'USDC',
      },
    ],
  });
  return {
    unsignedXdr: pickXdr(resp),
    contractId: resp.contractId ?? resp.contract_id ?? null,
  };
}

export async function fundEscrow(contractId: string, amountUsdc: number): Promise<string> {
  if (isTwUnavailable()) return `DEMO_XDR_fund_${contractId}_${amountUsdc}`;
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  return pickXdr(
    await postTW('/escrow/single-release/fund-escrow', {
      contractId,
      signer: PLATFORM,
      amount: String(amountUsdc),
    })
  );
}

export async function approveMilestone(contractId: string): Promise<string> {
  if (isTwUnavailable()) return `DEMO_XDR_approve_${contractId}`;
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  return pickXdr(
    await postTW('/escrow/single-release/approve-milestone', {
      contractId,
      signer: PLATFORM,
    })
  );
}

export async function releaseFunds(contractId: string): Promise<string> {
  if (isTwUnavailable()) return `DEMO_XDR_release_${contractId}`;
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  return pickXdr(
    await postTW('/escrow/single-release/release-funds', {
      contractId,
      signer: PLATFORM,
    })
  );
}

export async function getEscrowStatus(contractId: string) {
  if (isTwUnavailable()) {
    return {
      contractId,
      status: 'active',
      balance: { currency: 'USDC', amount: '50' },
      milestones: [
        {
          description: 'Drought payout',
          amount: '50',
          status: 'awaiting-condition',
        },
      ],
      demo: true,
    };
  }
  const res = await fetch(`${TW_BASE}/escrow/single-release/${contractId}`, {
    headers: twHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`TW status failed: ${res.status}`);
  return res.json();
}
