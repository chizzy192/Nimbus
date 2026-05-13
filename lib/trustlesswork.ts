const TW_BASE = process.env.NEXT_PUBLIC_TW_BASE_URL ?? 'https://dev.api.trustlesswork.com';
const TW_KEY = process.env.NEXT_PUBLIC_TW_API_KEY ?? '';

function twHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TW_KEY}`,
  };
}

async function postTW(path: string, body: unknown): Promise<{ unsignedXdr: string }> {
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

export interface DeployFarmerEscrowInput {
  id: string;
  name: string;
  region: string;
  stellarWallet: string;
  coverageUsdc: number;
  thresholdMm: number;
}

export async function deployFarmerEscrow(farmer: DeployFarmerEscrowInput): Promise<string> {
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  const { unsignedXdr } = await postTW('/deployer/single-release', {
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
  return unsignedXdr;
}

export async function fundEscrow(contractId: string, amountUsdc: number): Promise<string> {
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  const { unsignedXdr } = await postTW('/escrow/single-release/fund-escrow', {
    contractId,
    signer: PLATFORM,
    amount: String(amountUsdc),
  });
  return unsignedXdr;
}

export async function approveMilestone(contractId: string): Promise<string> {
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  const { unsignedXdr } = await postTW('/escrow/single-release/approve-milestone', {
    contractId,
    signer: PLATFORM,
  });
  return unsignedXdr;
}

export async function releaseFunds(contractId: string): Promise<string> {
  const PLATFORM = process.env.PLATFORM_WALLET_PUBLIC!;
  const { unsignedXdr } = await postTW('/escrow/single-release/release-funds', {
    contractId,
    signer: PLATFORM,
  });
  return unsignedXdr;
}

export async function getEscrowStatus(contractId: string) {
  const res = await fetch(`${TW_BASE}/escrow/single-release/${contractId}`, {
    headers: twHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`TW status failed: ${res.status}`);
  return res.json();
}
