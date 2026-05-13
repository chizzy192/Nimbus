import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createCustodialWallet } from '@/lib/wallet';
import type { FarmerRegistrationPayload } from '@/types/nimbus';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as FarmerRegistrationPayload;

  if (!body.name || !body.phone || body.latitude == null || body.longitude == null) {
    return NextResponse.json({ error: 'name, phone, latitude, longitude required' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { publicKey, encryptedSecret } = createCustodialWallet();

  const { data, error } = await supabase
    .from('farmers')
    .insert({
      name: body.name,
      phone: body.phone,
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
      stellar_wallet: publicKey,
      stellar_secret: encryptedSecret,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // never return the encrypted secret in the API response
  const { stellar_secret: _omit, ...safe } = data;
  return NextResponse.json({ farmer: safe });
}
