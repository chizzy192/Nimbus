import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { isDemoMode } from '@/lib/demo-mode';
import { demoFarmers } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isDemoMode()) {
    const farmers = demoFarmers.list().map(({ stellar_secret: _omit, ...rest }) => rest);
    return NextResponse.json({ farmers });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('farmers')
    .select('id,name,phone,latitude,longitude,region,crop_type,season_start,season_end,drought_threshold_mm,coverage_usdc,premium_usdc,stellar_wallet,contract_id,payout_triggered,trigger_rainfall_mm,status,created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ farmers: data });
}
