import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { fundEscrow } from '@/lib/trustlesswork';
import { signXDR, submitToStellar } from '@/lib/stellar';
import { isDemoMode } from '@/lib/demo-mode';
import { demoFarmers } from '@/lib/demo-store';
import type { Farmer } from '@/types/nimbus';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { farmer_id } = await req.json();
  if (!farmer_id) {
    return NextResponse.json({ error: 'farmer_id required' }, { status: 400 });
  }

  let farmer: Farmer | null = null;
  if (isDemoMode()) {
    farmer = demoFarmers.get(farmer_id);
  } else {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', farmer_id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'farmer not found' }, { status: 404 });
    }
    farmer = data as Farmer;
  }
  if (!farmer) {
    return NextResponse.json({ error: 'farmer not found' }, { status: 404 });
  }
  if (!farmer.contract_id) {
    return NextResponse.json({ error: 'farmer escrow not deployed' }, { status: 400 });
  }

  try {
    const unsignedXdr = await fundEscrow(farmer.contract_id, farmer.coverage_usdc);
    const signed = signXDR(unsignedXdr, process.env.PLATFORM_WALLET_SECRET ?? '');
    const tx = await submitToStellar(signed);
    return NextResponse.json({ ok: true, tx });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
