import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { deployFarmerEscrow } from '@/lib/trustlesswork';
import { signXDR, submitToStellar } from '@/lib/stellar';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { farmer_id } = await req.json();
  if (!farmer_id) {
    return NextResponse.json({ error: 'farmer_id required' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: farmer, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('id', farmer_id)
    .single();

  if (error || !farmer) {
    return NextResponse.json({ error: error?.message ?? 'farmer not found' }, { status: 404 });
  }
  if (!farmer.stellar_wallet) {
    return NextResponse.json({ error: 'farmer has no stellar wallet' }, { status: 400 });
  }

  try {
    const { unsignedXdr, contractId } = await deployFarmerEscrow({
      id: farmer.id,
      name: farmer.name,
      region: farmer.region ?? '—',
      stellarWallet: farmer.stellar_wallet,
      coverageUsdc: farmer.coverage_usdc,
      thresholdMm: farmer.drought_threshold_mm,
    });

    if (!contractId) {
      return NextResponse.json(
        { error: 'Trustless Work deploy response did not include a contractId' },
        { status: 502 }
      );
    }

    const signed = signXDR(unsignedXdr, process.env.PLATFORM_WALLET_SECRET!);
    const tx = await submitToStellar(signed);
    const txHash = (tx as { hash?: string }).hash ?? null;

    await supabase
      .from('farmers')
      .update({ contract_id: contractId, status: 'active' })
      .eq('id', farmer.id);

    return NextResponse.json({ ok: true, contractId, txHash, tx });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
