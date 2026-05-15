import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { decryptSecret } from '@/lib/wallet';
import { isDemoMode } from '@/lib/demo-mode';
import { demoFarmers } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

/**
 * Decrypts the farmer's custodial Stellar secret and returns it once.
 * Gated by the farmer's own phone number — the caller must echo it back to
 * prove they're looking at their own dashboard, not a random URL.
 *
 * NOT a long-term security model. For a real product, swap this for an OTP
 * sent via Termii to the registered phone before revealing the key.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as { confirm_phone?: string };
  const confirm = (body.confirm_phone ?? '').trim();
  if (!confirm) {
    return NextResponse.json({ error: 'confirm_phone required' }, { status: 400 });
  }

  let farmer: { phone: string; stellar_wallet: string | null; stellar_secret: string | null } | null = null;

  if (isDemoMode()) {
    const row = demoFarmers.get(params.id);
    if (row) {
      farmer = {
        phone: row.phone,
        stellar_wallet: row.stellar_wallet,
        stellar_secret: row.stellar_secret,
      };
    }
  } else {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('farmers')
      .select('id, phone, stellar_wallet, stellar_secret')
      .eq('id', params.id)
      .single();
    if (!error && data) {
      farmer = {
        phone: data.phone,
        stellar_wallet: data.stellar_wallet,
        stellar_secret: data.stellar_secret,
      };
    }
  }

  if (!farmer) {
    return NextResponse.json({ error: 'farmer not found' }, { status: 404 });
  }
  if (!farmer.stellar_secret) {
    return NextResponse.json({ error: 'no encrypted secret on record' }, { status: 404 });
  }

  // Normalise: strip spaces/dashes/parens so '+234 803 000 0001' matches '+2348030000001'.
  const normalise = (s: string) => s.replace(/[\s\-()]/g, '');
  if (normalise(confirm) !== normalise(farmer.phone)) {
    return NextResponse.json({ error: 'phone does not match record' }, { status: 401 });
  }

  let secret: string;
  try {
    secret = decryptSecret(farmer.stellar_secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'decrypt failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({
    publicKey: farmer.stellar_wallet,
    secret,
    warning:
      'Anyone with this secret controls the wallet. Save it offline and never share it.',
  });
}
