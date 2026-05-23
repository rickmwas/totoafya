import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const clientPersister = {
  persistClient: (client: any) => {
    storage.set('react-query-cache', JSON.stringify(client));
  },
  restoreClient: () => {
    const cache = storage.getString('react-query-cache');
    return cache ? JSON.parse(cache) : undefined;
  },
  removeClient: () => {
    storage.delete('react-query-cache');
  },
};

export function setupOfflinePersistence(queryClient: QueryClient) {
  persistQueryClient({
    queryClient: queryClient as any,
    persister: clientPersister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days cache
  });
}
