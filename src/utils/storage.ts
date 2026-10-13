// Safe Storage Utility: Browser LocalStorage with In-Memory fallback for SSR/Testing

const inMemoryStore = new Map<string, string>();

export const getStorageItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return inMemoryStore.get(key) || null;
};

export const setStorageItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {}
  inMemoryStore.set(key, value);
};

export const removeStorageItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {}
  inMemoryStore.delete(key);
};
