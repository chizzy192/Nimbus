import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('coverage_pools')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pools: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('coverage_pools')
    .insert({
      name: body.name,
      sponsor_name: body.sponsor_name ?? null,
      region: body.region ?? null,
      season_start: body.season_start ?? null,
      season_end: body.season_end ?? null,
      total_usdc: body.total_usdc ?? null,
      status: 'active',
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pool: data });
}
