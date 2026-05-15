import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchSeasonRainfall } from '@/lib/openmeteo';
import { approveMilestone, releaseFunds } from '@/lib/trustlesswork';
import { signXDR, submitToStellar } from '@/lib/stellar';
import { sendSMS } from '@/lib/notify';
import { isDemoMode } from '@/lib/demo-mode';
import { demoChecks, demoFarmers } from '@/lib/demo-store';
import type { Farmer } from '@/types/nimbus';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface CheckResult {
  farmer_id: string;
  triggered: boolean;
  rainfall_mm: number;
  threshold_mm: number;
  tx_hash?: string;
  error?: string;
}

function isAuthorised(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (req.headers.get('x-vercel-cron') === '1') return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return true;
  return (req.headers.get('authorization') ?? '') === `Bearer ${expected}`;
}

async function loadCandidates(targetId: string | null, force: boolean): Promise<Farmer[]> {
  if (isDemoMode()) {
    let rows = demoFarmers.list().filter((f) => !f.payout_triggered);
    if (!force) rows = rows.filter((f) => f.status === 'active');
    if (targetId) rows = rows.filter((f) => f.id === targetId);
    return rows;
  }
  const supabase = supabaseServer();
  let query = supabase.from('farmers').select('*').eq('payout_triggered', false);
  if (!force) query = query.eq('status', 'active');
  if (targetId) query = query.eq('id', targetId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Farmer[];
}

async function recordCheck(
  farmerId: string,
  seasonStart: string,
  totalMm: number,
  thresholdMm: number,
  triggered: boolean,
  raw: unknown
): Promise<string | null> {
  if (isDemoMode()) {
    const row = demoChecks.insert({
      farmer_id: farmerId,
      check_date: new Date().toISOString().split('T')[0],
      season_start: seasonStart,
      rainfall_cumulative_mm: totalMm,
      threshold_mm: thresholdMm,
      triggered,
      open_meteo_raw: raw,
      tx_hash: null,
    });
    return row.id;
  }
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('oracle_checks')
    .insert({
      farmer_id: farmerId,
      check_date: new Date().toISOString().split('T')[0],
      season_start: seasonStart,
      rainfall_cumulative_mm: totalMm,
      threshold_mm: thresholdMm,
      triggered,
      open_meteo_raw: raw,
    })
    .select('id')
    .single();
  return data?.id ?? null;
}

async function updateCheck(id: string, patch: Record<string, unknown>) {
  if (isDemoMode()) {
    demoChecks.update(id, patch);
    return;
  }
  const supabase = supabaseServer();
  await supabase.from('oracle_checks').update(patch).eq('id', id);
}

async function markFarmerTriggered(farmer: Farmer, totalMm: number) {
  const patch = {
    payout_triggered: true,
    payout_triggered_at: new Date().toISOString(),
    trigger_rainfall_mm: totalMm,
    status: 'triggered' as const,
  };
  if (isDemoMode()) {
    demoFarmers.update(farmer.id, patch);
    return;
  }
  const supabase = supabaseServer();
  await supabase.from('farmers').update(patch).eq('id', farmer.id);
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  const targetId = req.nextUrl.searchParams.get('farmer_id');
  const force = req.nextUrl.searchParams.get('force') === 'true';

  let farmers: Farmer[];
  try {
    farmers = await loadCandidates(targetId, force);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'load failed' },
      { status: 500 }
    );
  }

  const results: CheckResult[] = [];

  for (const farmer of farmers) {
    try {
      const { totalMm, raw } = await fetchSeasonRainfall(
        farmer.latitude,
        farmer.longitude,
        farmer.season_start
      );

      const triggered = force || totalMm < farmer.drought_threshold_mm;
      const checkId = await recordCheck(
        farmer.id,
        farmer.season_start,
        totalMm,
        farmer.drought_threshold_mm,
        triggered,
        raw
      );

      // In demo mode we still want to demonstrate a full payout flow even
      // when no contract has been deployed — fabricate one on the fly.
      let contractId = farmer.contract_id;
      if (triggered && !contractId && isDemoMode()) {
        const id = `CDEM0${Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(50, '0')}`;
        contractId = id;
        demoFarmers.update(farmer.id, { contract_id: id });
      }

      if (triggered && contractId) {
        const secret = process.env.PLATFORM_WALLET_SECRET ?? '';
        let approveSubmitted = false;
        let txHash = '';
        try {
          const approveXdr = await approveMilestone(contractId);
          await submitToStellar(signXDR(approveXdr, secret));
          approveSubmitted = true;

          const releaseXdr = await releaseFunds(contractId);
          const tx = await submitToStellar(signXDR(releaseXdr, secret));
          txHash = (tx as { hash?: string }).hash ?? '';
        } catch (payoutErr) {
          const msg = payoutErr instanceof Error ? payoutErr.message : String(payoutErr);
          if (checkId) await updateCheck(checkId, { triggered: false });
          results.push({
            farmer_id: farmer.id,
            triggered: false,
            rainfall_mm: totalMm,
            threshold_mm: farmer.drought_threshold_mm,
            error: `payout ${approveSubmitted ? 'release' : 'approve'} failed: ${msg}`,
          });
          continue;
        }

        await markFarmerTriggered(farmer, totalMm);
        if (checkId) await updateCheck(checkId, { tx_hash: txHash });

        await sendSMS(
          farmer.phone,
          `Nimbus: Your drought insurance payout of $${farmer.coverage_usdc} USDC has been released. ` +
            `Rainfall: ${totalMm.toFixed(1)}mm (threshold: ${farmer.drought_threshold_mm}mm). ` +
            `Tx: ${txHash.slice(0, 16)}...`
        );

        results.push({
          farmer_id: farmer.id,
          triggered: true,
          rainfall_mm: totalMm,
          threshold_mm: farmer.drought_threshold_mm,
          tx_hash: txHash,
        });
      } else {
        results.push({
          farmer_id: farmer.id,
          triggered: false,
          rainfall_mm: totalMm,
          threshold_mm: farmer.drought_threshold_mm,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        farmer_id: farmer.id,
        triggered: false,
        rainfall_mm: 0,
        threshold_mm: farmer.drought_threshold_mm,
        error: msg,
      });
    }
  }

  return NextResponse.json({ checked: results.length, results });
}
