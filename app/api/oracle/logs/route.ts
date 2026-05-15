import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { isDemoMode } from '@/lib/demo-mode';
import { demoChecks } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 50);
  const farmerId = req.nextUrl.searchParams.get('farmer_id');

  if (isDemoMode()) {
    return NextResponse.json({ logs: demoChecks.list(limit, farmerId ?? undefined) });
  }

  const supabase = supabaseServer();

  let query = supabase
    .from('oracle_checks')
    .select('id,farmer_id,checked_at,check_date,rainfall_cumulative_mm,threshold_mm,triggered,tx_hash')
    .order('checked_at', { ascending: false })
    .limit(limit);

  if (farmerId) query = query.eq('farmer_id', farmerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data });
}
