'use client';

import { useCallback, useEffect, useState } from 'react';

interface FreighterState {
  publicKey: string | null;
  isConnected: boolean;
  isAllowed: boolean;
  loading: boolean;
  error: string | null;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    publicKey: null,
    isConnected: false,
    isAllowed: false,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const api = await import('@stellar/freighter-api');
      const connected = await api.isConnected();
      const allowed = await api.isAllowed();
      let pk: string | null = null;
      if (allowed.isAllowed) {
        const addr = await api.getAddress();
        pk = addr.address ?? null;
      }
      setState({
        publicKey: pk,
        isConnected: !!connected.isConnected,
        isAllowed: !!allowed.isAllowed,
        loading: false,
        error: null,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'freighter unavailable',
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const api = await import('@stellar/freighter-api');
      const access = await api.requestAccess();
      setState({
        publicKey: access.address ?? null,
        isConnected: true,
        isAllowed: true,
        loading: false,
        error: access.error ?? null,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'connect failed',
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, connect, refresh };
}
