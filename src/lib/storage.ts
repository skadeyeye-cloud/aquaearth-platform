'use client';

/**
 * AquaEarth Sovereign Platform - Resilient Persistent Database & Storage Layer
 * Ensures zero data loss across browser refreshes, tab switches, and sessions.
 */

const DB_PREFIX = 'ae_db_';

export function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}${key}`);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return defaultValue;
    return parsed as T;
  } catch (err) {
    console.warn(`[AquaEarth DB] Failed to load key "${key}" from storage:`, err);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`[AquaEarth DB] Failed to persist key "${key}":`, err);
  }
}

export function clearDatabase(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(DB_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.error('[AquaEarth DB] Failed to clear database:', err);
  }
}
