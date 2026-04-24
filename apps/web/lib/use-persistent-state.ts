'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Hydrates one JSON-serializable value from local storage and keeps it in sync after mount.
 */
export function usePersistentState<T>(storageKey: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const persistedValue = window.localStorage.getItem(storageKey);
      if (persistedValue) {
        setValue(JSON.parse(persistedValue) as T);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

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
    setValue(initialValue);
  }

  return [value, setValue, clear];
}
