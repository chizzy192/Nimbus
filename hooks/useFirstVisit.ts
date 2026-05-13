'use client';

import { useEffect, useState } from 'react';

export function useFirstVisit(key: string) {
  const [isFirst, setIsFirst] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(`nimbus.visited.${key}`);
      setIsFirst(seen !== '1');
    } catch {
      setIsFirst(false);
    }
  }, [key]);

  function markSeen() {
    try {
      window.localStorage.setItem(`nimbus.visited.${key}`, '1');
    } catch {
      // ignore
    }
    setIsFirst(false);
  }

  function reset() {
    try {
      window.localStorage.removeItem(`nimbus.visited.${key}`);
    } catch {
      // ignore
    }
    setIsFirst(true);
  }

  return { isFirst, markSeen, reset };
}
