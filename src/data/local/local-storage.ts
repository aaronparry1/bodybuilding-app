type LocalStorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
type SQLiteStorageConstructor = new (databaseName: string) => {
  getLengthSync(): number;
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
  removeItemSync(key: string): boolean;
  getKeyByIndexSync(index: number): string | null;
};

declare const require: ((moduleName: "expo-sqlite/kv-store") => { SQLiteStorage: SQLiteStorageConstructor }) | undefined;

const memoryStorage = new Map<string, string>();
let sqliteLocalStorage: LocalStorageLike | null = null;

export class PersistentStorageUnavailableError extends Error {
  constructor(readonly causeValue: unknown) {
    super("persistent_storage_unavailable");
    this.name = "PersistentStorageUnavailableError";
  }
}

const fallbackStorage: LocalStorageLike = {
  get length() {
    return memoryStorage.size;
  },
  getItem(key: string) {
    return memoryStorage.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    memoryStorage.set(key, value);
  },
  removeItem(key: string) {
    memoryStorage.delete(key);
  },
  key(index: number) {
    return [...memoryStorage.keys()][index] ?? null;
  },
};

function getSQLiteLocalStorage(): LocalStorageLike {
  if (sqliteLocalStorage) return sqliteLocalStorage;

  if (typeof require !== "function") return fallbackStorage;
  const { SQLiteStorage } = require("expo-sqlite/kv-store");

  const storage = new SQLiteStorage("iron-logic-local-storage");
  sqliteLocalStorage = {
    get length() {
      return storage.getLengthSync();
    },
    getItem(key: string) {
      return storage.getItemSync(key);
    },
    setItem(key: string, value: string) {
      storage.setItemSync(key, value);
    },
    removeItem(key: string) {
      storage.removeItemSync(key);
    },
    key(index: number) {
      return storage.getKeyByIndexSync(index);
    },
  };

  return sqliteLocalStorage;
}

export function getLocalStorage(): LocalStorageLike {
  if (typeof localStorage !== "undefined") return localStorage;
  if (process.env.NODE_ENV === "test") return fallbackStorage;

  if (process.env.EXPO_OS !== "web") {
    try {
      return getSQLiteLocalStorage();
    } catch (error) {
      if (__DEV__) {
        console.warn("[startup:storage] persistent local storage unavailable", error);
      }
      // Never present an empty in-memory store as the user's durable store on
      // native. That makes retained data look deleted and permits defaults to
      // be written into a temporary authority. Startup must recover or retry.
      throw new PersistentStorageUnavailableError(error);
    }
  }

  return fallbackStorage;
}

export function getLocalStorageKeys(): string[] {
  const storage = getLocalStorage();
  return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => Boolean(key));
}
