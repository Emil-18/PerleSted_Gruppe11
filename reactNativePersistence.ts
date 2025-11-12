export interface RNAsyncStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

type PersistenceValue = unknown;

const TEST_KEY = "__firebase_persistence_available__";

export class ReactNativePersistence {
  public readonly type = "LOCAL" as const;
  private storage: RNAsyncStorage;

  constructor(storage: RNAsyncStorage) {
    this.storage = storage;
  }

  async _isAvailable() {
    try {
      await this.storage.setItem(TEST_KEY, "1");
      await this.storage.removeItem(TEST_KEY);
      return true;
    } catch {
      return false;
    }
  }

  async _set(key: string, value: PersistenceValue) {
    await this.storage.setItem(key, JSON.stringify(value));
  }

  async _get<T = PersistenceValue>(key: string): Promise<T | null> {
    const v = await this.storage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async _remove(key: string) {
    await this.storage.removeItem(key);
  }
  _addListener(_key: string, _listener: (v: PersistenceValue | null) => void) {}
  _removeListener(_key: string, _listener: (v: PersistenceValue | null) => void) {}

  _shouldAllowMigration = true;
}
