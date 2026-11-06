import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { Platform } from 'react-native';

// Safe storage wrapper for Web/SSR and React Native
let storageInstance: any = null;
const getStorage = () => {
  if (storageInstance) return storageInstance;

  if (Platform.OS === 'web') {
    storageInstance = {
      set: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      },
      getString: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      delete: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    };
    return storageInstance;
  }

  try {
    const { MMKV } = require('react-native-mmkv');
    storageInstance = new MMKV();
  } catch (e) {
    const mem = new Map<string, string>();
    storageInstance = {
      set: (k: string, v: string) => mem.set(k, v),
      getString: (k: string) => mem.get(k) || null,
      delete: (k: string) => mem.delete(k),
    };
  }
  return storageInstance;
};

export function setupOfflinePersistence(queryClient: QueryClient) {
  // Only persist on client-side (web browser or physical native device)
  if (Platform.OS === 'web' && typeof window === 'undefined') return;

  try {
    const storage = getStorage();
    const clientPersister = {
      persistClient: (client: any) => {
        try {
          storage.set('react-query-cache', JSON.stringify(client));
        } catch (e) {}
      },
      restoreClient: () => {
        try {
          const cache = storage.getString('react-query-cache');
          return cache ? JSON.parse(cache) : undefined;
        } catch (e) {
          return undefined;
        }
      },
      removeClient: () => {
        try {
          storage.delete('react-query-cache');
        } catch (e) {}
      },
    };

    persistQueryClient({
      queryClient: queryClient as any,
      persister: clientPersister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days cache
    });
  } catch (e) {
    console.warn('[OfflineManager] Failed to setup react-query persistence:', e);
  }
}
