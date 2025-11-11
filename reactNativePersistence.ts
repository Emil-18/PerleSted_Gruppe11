// src/firebase/reactNativePersistence.ts
// Minimal RN persistence for Firebase Auth using AsyncStorage.

export interface ReactNativeAsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }
  
  type PersistenceValue = Record<string, unknown> | string;
  
  const TEST_KEY = "__firebase_persistence_available__";
  
  // This returns a Persistence-like object that Firebase Auth accepts.
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage) {
    return {
      type: "LOCAL" as const,
  
      async _isAvailable() {
        try {
          await storage.setItem(TEST_KEY, "1");
          await storage.removeItem(TEST_KEY);
          return true;
        } catch {
          return false;
        }
      },
  
      async _set(key: string, value: PersistenceValue) {
        await storage.setItem(key, JSON.stringify(value));
      },
  
      async _get<T extends PersistenceValue>(key: string): Promise<T | null> {
        const json = await storage.getItem(key);
        return json ? (JSON.parse(json) as T) : null;
      },
  
      async _remove(key: string) {
        await storage.removeItem(key);
      },
  
      // RN has no native storage events; no-ops are fine:
      _addListener(_key: string, _listener: (v: PersistenceValue | null) => void) {},
      _removeListener(_key: string, _listener: (v: PersistenceValue | null) => void) {},
  
      // Allow migration from prior persistence where applicable
      _shouldAllowMigration: true,
    };
  }
  