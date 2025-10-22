const ACTIVE_USER_STORAGE_KEY = 'activeUserId';
const LEGACY_USER_STORAGE_KEY = 'userId';
const FALLBACK_USER_ID = 1;

const parseUserId = (raw: string | null | undefined): number | null => {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const resolveActiveUserId = (): number => {
  let storedValue: string | null = null;
  if (typeof window !== 'undefined') {
    storedValue = window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (!storedValue) {
      storedValue = window.localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    }
  }
  const envValue = import.meta.env.VITE_DEFAULT_USER_ID;

  const resolved = parseUserId(storedValue) ?? parseUserId(envValue);
  if (resolved !== null) {
    return resolved;
  }

  console.warn('Active user ID is not configured. Falling back to the default seed user (ID=1).');
  return FALLBACK_USER_ID;
};

export const cacheActiveUserId = (userId: number): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, String(userId));
};
