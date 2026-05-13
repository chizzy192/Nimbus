'use client';

import { useCallback, useEffect, useState } from 'react';

interface EscrowStatus {
  contractId: string | null;
  balance: number | null;
  state: string | null;
  loading: boolean;
  error: string | null;
}

export function useEscrow(contractId: string | null | undefined) {
  const [status, setStatus] = useState<EscrowStatus>({
    contractId: contractId ?? null,
    balance: null,
    state: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!contractId) return;
    setStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/escrow/status?contract_id=${encodeURIComponent(contractId)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setStatus({
        contractId,
        balance: data.balance ?? null,
        state: data.state ?? null,
        loading: false,
        error: data.error ?? null,
      });
    } catch (e) {
      setStatus((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'fetch failed',
      }));
    }
  }, [contractId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deploy = useCallback(async (farmerId: string) => {
    const res = await fetch('/api/escrow/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmer_id: farmerId }),
    });
    return res.json();
  }, []);

  const fund = useCallback(async (farmerId: string) => {
    const res = await fetch('/api/escrow/fund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmer_id: farmerId }),
    });
    return res.json();
  }, []);

  return { ...status, refresh, deploy, fund };
}
