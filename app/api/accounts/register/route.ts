import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createCustodialWallet } from '@/lib/wallet';
import type { FarmerRegistrationPayload } from '@/types/nimbus';

export const dynamic = 'force-dynamic';

interface RegisterBody extends FarmerRegistrationPayload {
  name: string;
  phone: string;
  email?: string;
}

const DEMO_STARTING_BALANCE = 20;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterBody;

  if (!body.name || !body.phone || body.latitude == null || body.longitude == null) {
    return NextResponse.json(
      { error: 'name, phone, latitude, longitude required' },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();

  // 1. Find or create the account, keyed by phone.
  const { data: existing } = await supabase
    .from('accounts')
    .select('id, name, phone, email, stellar_wallet, stellar_secret, demo_balance_usdc, role')
    .eq('phone', body.phone)
    .maybeSingle();

  let accountId: string;
  let walletPublic: string | null = null;
  let walletSecret: string | null = null;

  if (existing) {
    accountId = existing.id;
    walletPublic = existing.stellar_wallet;
    walletSecret = existing.stellar_secret;
  } else {
    const { publicKey, encryptedSecret } = createCustodialWallet();
    walletPublic = publicKey;
    walletSecret = encryptedSecret;

    const { data: created, error: aerr } = await supabase
      .from('accounts')
      .insert({
        role: 'farmer',
        name: body.name,
        phone: body.phone,
        email: body.email ?? null,
        stellar_wallet: publicKey,
        stellar_secret: encryptedSecret,
        demo_balance_usdc: DEMO_STARTING_BALANCE,
      })
      .select('id')
      .single();

    if (aerr || !created) {
      return NextResponse.json(
        { error: aerr?.message ?? 'account creation failed' },
        { status: 500 }
      );
    }
    accountId = created.id;
  }

  // 2. Create the first farmer (policy) row under the account.
  const { data: farmer, error: ferr } = await supabase
    .from('farmers')
    .insert({
      account_id: accountId,
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
      stellar_wallet: walletPublic,
      stellar_secret: walletSecret,
      status: 'pending',
    })
    .select('*')
    .single();

  if (ferr || !farmer) {
    return NextResponse.json({ error: ferr?.message ?? 'farm creation failed' }, { status: 500 });
  }

  const { stellar_secret: _omit, ...safeFarmer } = farmer as { stellar_secret?: string };
  return NextResponse.json({ accountId, farmer: safeFarmer });
}
