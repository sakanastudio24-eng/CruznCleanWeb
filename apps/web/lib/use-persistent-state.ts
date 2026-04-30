'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Hydrates one JSON-serializable value from local storage and keeps it in sync after mount.
 * When a legacy key is provided, old drafts are copied into the new key on first load.
 */
export function usePersistentState<T>(
  storageKey: string,
  initialValue: T,
  legacyStorageKeys: string | string[] = [],
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const persistedValue = window.localStorage.getItem(storageKey);
      const legacyKeys = Array.isArray(legacyStorageKeys) ? legacyStorageKeys : [legacyStorageKeys].filter(Boolean);
      const matchedLegacyKey = legacyKeys.find((legacyKey) => window.localStorage.getItem(legacyKey));
      const legacyPersistedValue = matchedLegacyKey ? window.localStorage.getItem(matchedLegacyKey) : null;
      const storedValue = persistedValue ?? legacyPersistedValue;

      if (storedValue) {
        setValue(JSON.parse(storedValue) as T);

        if (!persistedValue && legacyPersistedValue) {
          window.localStorage.setItem(storageKey, legacyPersistedValue);
          legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      const legacyKeys = Array.isArray(legacyStorageKeys) ? legacyStorageKeys : [legacyStorageKeys].filter(Boolean);
      legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
    } finally {
      setHydrated(true);
    }
  }, [legacyStorageKeys, storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [hydrated, storageKey, value]);

  /**
   * Clears one persisted value and resets state back to the provided initial value.
   */
  function clear(): void {
    window.localStorage.removeItem(storageKey);
    const legacyKeys = Array.isArray(legacyStorageKeys) ? legacyStorageKeys : [legacyStorageKeys].filter(Boolean);
    legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
    setValue(initialValue);
  }

  return [value, setValue, clear];
}
