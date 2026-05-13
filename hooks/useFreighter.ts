'use client';

import { useCallback, useEffect, useState } from 'react';

export type WalletStatus =
  | 'idle'
  | 'detecting'
  | 'not-installed'
  | 'locked'
  | 'wrong-network'
  | 'connected'
  | 'error';

interface FreighterState {
  status: WalletStatus;
  publicKey: string | null;
  network: string | null;
  networkPassphrase: string | null;
  error: string | null;
}

const EXPECTED_NETWORK =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet'
    : 'testnet';

const initial: FreighterState = {
  status: 'idle',
  publicKey: null,
  network: null,
  networkPassphrase: null,
  error: null,
};

export function useFreighter() {
  const [state, setState] = useState<FreighterState>(initial);

  const detect = useCallback(async () => {
    setState((s) => ({ ...s, status: 'detecting', error: null }));
    try {
      const api = await import('@stellar/freighter-api');
      const connected = await api.isConnected();
      if (!connected?.isConnected) {
        setState({ ...initial, status: 'not-installed' });
        return;
      }

      const allowed = await api.isAllowed();
      if (!allowed?.isAllowed) {
        setState({ ...initial, status: 'locked' });
        return;
      }

      const [addrRes, netRes] = await Promise.all([api.getAddress(), api.getNetwork()]);
      const network = (netRes as { network?: string })?.network ?? null;
      const expectedNorm = EXPECTED_NETWORK.toLowerCase();
      const networkNorm = (network ?? '').toLowerCase();

      if (network && !networkNorm.includes(expectedNorm)) {
        setState({
          status: 'wrong-network',
          publicKey: addrRes.address ?? null,
          network,
          networkPassphrase:
            (netRes as { networkPassphrase?: string })?.networkPassphrase ?? null,
          error: `Switch Freighter to ${EXPECTED_NETWORK.toUpperCase()}`,
        });
        return;
      }

      setState({
        status: 'connected',
        publicKey: addrRes.address ?? null,
        network,
        networkPassphrase:
          (netRes as { networkPassphrase?: string })?.networkPassphrase ?? null,
        error: null,
      });
    } catch (e) {
      setState({
        ...initial,
        status: 'error',
        error: e instanceof Error ? e.message : 'freighter unavailable',
      });
    }
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, status: 'detecting', error: null }));
    try {
      const api = await import('@stellar/freighter-api');
      const access = await api.requestAccess();
      if (access.error) {
        setState((s) => ({ ...s, status: 'error', error: access.error ?? null }));
        return;
      }
      await detect();
    } catch (e) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: e instanceof Error ? e.message : 'connect failed',
      }));
    }
  }, [detect]);

  const disconnect = useCallback(() => {
    // Freighter has no programmatic disconnect; we just forget the address locally.
    setState({ ...initial, status: 'not-installed' });
    setTimeout(() => detect(), 0);
  }, [detect]);

  useEffect(() => {
    detect();
  }, [detect]);

  const isReady = state.status === 'connected';
  return {
    ...state,
    expectedNetwork: EXPECTED_NETWORK,
    isReady,
    connect,
    disconnect,
    refresh: detect,
  };
}
