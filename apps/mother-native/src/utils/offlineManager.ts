import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// Safe storage wrapper for Web/SSR
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      set: (key: string, value: string) => localStorage.setItem(key, value),
      getString: (key: string) => localStorage.getItem(key),
      delete: (key: string) => localStorage.removeItem(key),
    };
  }
  return new MMKV();
};

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

export function setupOfflinePersistence(queryClient: QueryClient) {
  // Only persist on actual client-side
  if (typeof window !== 'undefined') {
    persistQueryClient({
      queryClient: queryClient as any,
      persister: clientPersister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days cache
    });
  }
}
