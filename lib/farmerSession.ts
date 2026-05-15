// Tiny client-side "remember me" helpers. There is no password auth — the
// account's URL is the credential. These just stash IDs in localStorage so a
// user can land back on their dashboard or sign out cleanly.

const ACCOUNT_KEY = 'nimbus.accountId';
const LEGACY_FARMER_KEY = 'nimbus.farmerId';

export function rememberAccount(id: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACCOUNT_KEY, id);
  } catch {
    /* private mode / storage disabled */
  }
}

export function getRememberedAccount(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACCOUNT_KEY);
  } catch {
    return null;
  }
}

export function forgetAccount() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACCOUNT_KEY);
    window.localStorage.removeItem(LEGACY_FARMER_KEY);
  } catch {
    /* ignore */
  }
}

// ----- Legacy aliases -----------------------------------------------------
// The pre-accounts model stored a farmerId. We keep these named exports so
// older imports compile, and we read both keys when looking up a session.

export function rememberFarmer(id: string) {
  rememberAccount(id);
}

export function getRememberedFarmer(): string | null {
  return getRememberedAccount();
}

export function forgetFarmer() {
  forgetAccount();
}
