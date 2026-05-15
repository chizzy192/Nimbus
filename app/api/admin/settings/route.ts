import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ADMIN_COLUMNS =
  'id, role, name, phone, email, stellar_wallet, demo_balance_usdc, created_at';
const DEFAULT_ADMIN_BUDGET = 1000;

async function getOrCreateAdmin() {
  const supabase = supabaseServer();
  const existing = await supabase
    .from('accounts')
    .select(ADMIN_COLUMNS)
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle();
  if (existing.data) return existing.data;

  const created = await supabase
    .from('accounts')
    .insert({
      role: 'admin',
      name: 'Nimbus Platform Admin',
      demo_balance_usdc: DEFAULT_ADMIN_BUDGET,
    })
    .select(ADMIN_COLUMNS)
    .single();
  return created.data;
}

export async function GET() {
  const admin = await getOrCreateAdmin();
  return NextResponse.json({
    admin,
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet',
    rpc: process.env.NEXT_PUBLIC_STELLAR_RPC ?? null,
    platform_wallet: process.env.PLATFORM_WALLET_PUBLIC ?? null,
    tw_base_url: process.env.NEXT_PUBLIC_TW_BASE_URL ?? null,
    tw_api_key_set: Boolean(process.env.NEXT_PUBLIC_TW_API_KEY),
    cron_secret_set: Boolean(process.env.CRON_SECRET),
    resend_key_set: Boolean(process.env.RESEND_API_KEY),
    termii_key_set: Boolean(process.env.TERMII_API_KEY),
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const admin = await getOrCreateAdmin();
  if (!admin) return NextResponse.json({ error: 'admin not found' }, { status: 500 });

  const patch: Record<string, unknown> = {};
  if (typeof body.name === 'string') patch.name = body.name;
  if (typeof body.email === 'string') patch.email = body.email;
  if (body.demo_balance_usdc === 'reset') patch.demo_balance_usdc = DEFAULT_ADMIN_BUDGET;
  else if (typeof body.demo_balance_usdc === 'number')
    patch.demo_balance_usdc = body.demo_balance_usdc;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no editable fields supplied' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('accounts')
    .update(patch)
    .eq('id', admin.id)
    .select(ADMIN_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admin: data });
}
