import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import type { FarmerRegistrationPayload } from '@/types/nimbus';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('account_id', params.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stripped = (data ?? []).map((row) => {
    const { stellar_secret: _omit, ...safe } = row as { stellar_secret?: string };
    return safe;
  });
  return NextResponse.json({ farms: stripped });
}

/** Add another farm (policy row) under this account. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as FarmerRegistrationPayload;
  if (!body || body.latitude == null || body.longitude == null) {
    return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: account, error: aerr } = await supabase
    .from('accounts')
    .select('id, name, phone, stellar_wallet, stellar_secret')
    .eq('id', params.id)
    .single();
  if (aerr || !account) {
    return NextResponse.json({ error: 'account not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('farmers')
    .insert({
      account_id: account.id,
      name: body.name ?? account.name,
      phone: body.phone ?? account.phone ?? '',
      latitude: body.latitude,
      longitude: body.longitude,
      region: body.region ?? null,
      crop_type: body.crop_type ?? null,
      farm_size_ha: body.farm_size_ha ?? null,
      season_start: body.season_start,
      season_end: body.season_end,
      drought_threshold_mm: body.drought_threshold_mm ?? 50,
      coverage_usdc: body.coverage_usdc,
      premium_usdc: body.premium_usdc,
      // farm shares the account's custodial wallet so payouts converge there
      stellar_wallet: account.stellar_wallet,
      stellar_secret: account.stellar_secret,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { stellar_secret: _omit, ...safe } = data as { stellar_secret?: string };
  return NextResponse.json({ farm: safe });
}
