import { NextRequest, NextResponse } from 'next/server';
import { getEscrowStatus } from '@/lib/trustlesswork';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const contractId = req.nextUrl.searchParams.get('contractId');
  if (!contractId) {
    return NextResponse.json({ error: 'contractId required' }, { status: 400 });
  }
  try {
    const data = await getEscrowStatus(contractId);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
