import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchSeasonRainfall } from '@/lib/openmeteo';
import { approveMilestone, releaseFunds } from '@/lib/trustlesswork';
import { signXDR, submitToStellar } from '@/lib/stellar';
import { sendSMS } from '@/lib/notify';
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

export async function GET(req: NextRequest) {
  const supabase = supabaseServer();
  const targetId = req.nextUrl.searchParams.get('farmer_id');
  const force = req.nextUrl.searchParams.get('force') === 'true';

  let query = supabase
    .from('farmers')
    .select('*')
    .eq('payout_triggered', false);
  if (!force) query = query.eq('status', 'active');
  if (targetId) query = query.eq('id', targetId);

  const { data: farmers, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: CheckResult[] = [];

  for (const farmer of (farmers ?? []) as Farmer[]) {
    try {
      const { totalMm, raw } = await fetchSeasonRainfall(
        farmer.latitude,
        farmer.longitude,
        farmer.season_start
      );

      const triggered = force || totalMm < farmer.drought_threshold_mm;

      const checkInsert = await supabase
        .from('oracle_checks')
        .insert({
          farmer_id: farmer.id,
          check_date: new Date().toISOString().split('T')[0],
          season_start: farmer.season_start,
          rainfall_cumulative_mm: totalMm,
          threshold_mm: farmer.drought_threshold_mm,
          triggered,
          open_meteo_raw: raw,
        })
        .select('id')
        .single();

      if (triggered && farmer.contract_id) {
        const secret = process.env.PLATFORM_WALLET_SECRET!;

        const approveXdr = await approveMilestone(farmer.contract_id);
        const signedApprove = signXDR(approveXdr, secret);
        await submitToStellar(signedApprove);

        const releaseXdr = await releaseFunds(farmer.contract_id);
        const signedRelease = signXDR(releaseXdr, secret);
        const tx = await submitToStellar(signedRelease);
        const txHash = (tx as { hash?: string }).hash ?? '';

        await supabase
          .from('farmers')
          .update({
            payout_triggered: true,
            payout_triggered_at: new Date().toISOString(),
            trigger_rainfall_mm: totalMm,
            status: 'triggered',
          })
          .eq('id', farmer.id);

        if (checkInsert.data?.id) {
          await supabase
            .from('oracle_checks')
            .update({ tx_hash: txHash })
            .eq('id', checkInsert.data.id);
        }

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
