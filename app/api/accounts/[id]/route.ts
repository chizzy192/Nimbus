import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { isDemoMode } from '@/lib/demo-mode';
import { demoAccounts } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

const SAFE_COLUMNS =
  'id, role, name, phone, email, stellar_wallet, demo_balance_usdc, created_at';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isDemoMode()) {
    const account = demoAccounts.get(params.id);
    if (!account) return NextResponse.json({ error: 'account not found' }, { status: 404 });
    return NextResponse.json({ account });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('accounts')
    .select(SAFE_COLUMNS)
    .eq('id', params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ account: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  for (const key of ['name', 'phone', 'email'] as const) {
    if (typeof body[key] === 'string') patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no editable fields supplied' }, { status: 400 });
  }
  if (isDemoMode()) {
    const account = demoAccounts.update(params.id, patch);
    if (!account) return NextResponse.json({ error: 'account not found' }, { status: 404 });
    return NextResponse.json({ account });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('accounts')
    .update(patch)
    .eq('id', params.id)
    .select(SAFE_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ account: data });
}
