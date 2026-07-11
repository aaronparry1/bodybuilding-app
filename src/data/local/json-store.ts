import { getLocalStorage, getLocalStorageKeys } from "@/data/local/local-storage";

type Listener = () => void;
type CacheEntry = {
  rawValue: string | null;
  value: unknown;
};

const listeners = new Map<string, Set<Listener>>();
const valueCache = new Map<string, CacheEntry>();

function notify(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

export const jsonStore = {
  get<T>(key: string, fallback: T): T {
    const rawValue = getLocalStorage().getItem(key);
    const cached = valueCache.get(key);
    if (cached && cached.rawValue === rawValue) {
      return cached.value as T;
    }

    const value = rawValue ? (JSON.parse(rawValue) as T) : fallback;
    valueCache.set(key, { rawValue, value });
    return value;
  },

  set<T>(key: string, value: T): void {
    const rawValue = JSON.stringify(value);
    const cached = valueCache.get(key);

    getLocalStorage().setItem(key, rawValue);
    valueCache.set(key, { rawValue, value });

    if (cached?.rawValue !== rawValue) {
      notify(key);
    }
  },

  remove(key: string): void {
    const hadValue = getLocalStorage().getItem(key) !== null || valueCache.has(key);
    getLocalStorage().removeItem(key);
    valueCache.delete(key);
    if (hadValue) {
      notify(key);
    }
  },

  clearByPrefix(prefix: string): void {
    getLocalStorageKeys()
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => {
        getLocalStorage().removeItem(key);
        valueCache.delete(key);
        notify(key);
      });
  },

  resetCache(): void {
    valueCache.clear();
  },

  subscribe(key: string, listener: Listener): () => void {
    const keyListeners = listeners.get(key) ?? new Set<Listener>();
    keyListeners.add(listener);
    listeners.set(key, keyListeners);
    return () => keyListeners.delete(listener);
  },
};
