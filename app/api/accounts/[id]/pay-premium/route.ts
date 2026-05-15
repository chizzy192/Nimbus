import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { isDemoMode } from '@/lib/demo-mode';
import { demoAccounts, demoFarmers } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

/**
 * Demo-only premium payment. Debits the account's demo balance and marks the
 * policy's premium_paid. In production this would trigger a real USDC transfer
 * from the farmer's wallet to the platform; here it's a UI fiction.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const farmerId: string | undefined = body.farmer_id;
  if (!farmerId) {
    return NextResponse.json({ error: 'farmer_id required' }, { status: 400 });
  }

  if (isDemoMode()) {
    const account = demoAccounts.get(params.id);
    if (!account) return NextResponse.json({ error: 'account not found' }, { status: 404 });
    const farmer = demoFarmers.get(farmerId);
    if (!farmer) return NextResponse.json({ error: 'farm not found' }, { status: 404 });
    if (farmer.account_id !== account.id) {
      return NextResponse.json({ error: 'farm does not belong to this account' }, { status: 403 });
    }
    if (farmer.premium_paid) {
      return NextResponse.json({ error: 'premium already paid' }, { status: 409 });
    }
    if (Number(account.demo_balance_usdc) < Number(farmer.premium_usdc)) {
      return NextResponse.json(
        {
          error: `insufficient demo balance · need $${farmer.premium_usdc}, have $${account.demo_balance_usdc}`,
        },
        { status: 402 }
      );
    }
    const newBalance = Number(account.demo_balance_usdc) - Number(farmer.premium_usdc);
    demoAccounts.update(account.id, { demo_balance_usdc: newBalance });
    demoFarmers.update(farmer.id, { premium_paid: true });
    return NextResponse.json({
      ok: true,
      debited_usdc: Number(farmer.premium_usdc),
      new_balance_usdc: newBalance,
    });
  }

  const supabase = supabaseServer();

  const { data: account, error: aerr } = await supabase
    .from('accounts')
    .select('id, demo_balance_usdc')
    .eq('id', params.id)
    .single();
  if (aerr || !account) {
    return NextResponse.json({ error: 'account not found' }, { status: 404 });
  }

  const { data: farmer, error: ferr } = await supabase
    .from('farmers')
    .select('id, account_id, premium_usdc, premium_paid')
    .eq('id', farmerId)
    .single();
  if (ferr || !farmer) {
    return NextResponse.json({ error: 'farm not found' }, { status: 404 });
  }
  if (farmer.account_id !== account.id) {
    return NextResponse.json({ error: 'farm does not belong to this account' }, { status: 403 });
  }
  if (farmer.premium_paid) {
    return NextResponse.json({ error: 'premium already paid' }, { status: 409 });
  }
  if (Number(account.demo_balance_usdc) < Number(farmer.premium_usdc)) {
    return NextResponse.json(
      {
        error: `insufficient demo balance · need $${farmer.premium_usdc}, have $${account.demo_balance_usdc}`,
      },
      { status: 402 }
    );
  }

  const newBalance = Number(account.demo_balance_usdc) - Number(farmer.premium_usdc);

  const { error: updErr } = await supabase
    .from('accounts')
    .update({ demo_balance_usdc: newBalance })
    .eq('id', account.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  const { error: pErr } = await supabase
    .from('farmers')
    .update({ premium_paid: true })
    .eq('id', farmer.id);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    debited_usdc: Number(farmer.premium_usdc),
    new_balance_usdc: newBalance,
  });
}
