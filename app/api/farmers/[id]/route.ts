import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('farmers')
    .select('id,name,phone,latitude,longitude,region,crop_type,farm_size_ha,season_start,season_end,drought_threshold_mm,coverage_usdc,premium_usdc,premium_paid,stellar_wallet,contract_id,payout_triggered,payout_triggered_at,trigger_rainfall_mm,status,created_at')
    .eq('id', params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ farmer: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('farmers')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { stellar_secret: _omit, ...safe } = data;
  return NextResponse.json({ farmer: safe });
}
