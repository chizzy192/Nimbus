// Tiny client-side "remember me" helper for the farmer dashboard.
// There is no password auth — the farmer's URL is the credential. This
// just stores the most recent farmerId in localStorage so the user can
// land back on their dashboard from the marketing site or after a tab close.

const KEY = 'nimbus.farmerId';

export function rememberFarmer(id: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    // private browsing / storage disabled — silently skip
  }
}

export function getRememberedFarmer(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function forgetFarmer() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
