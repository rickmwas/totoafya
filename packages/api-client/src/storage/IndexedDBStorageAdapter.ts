/**
 * TotoAfya Digital — IndexedDB Storage Adapter
 * Task Directive TD-3.4: Transactional Mutation Outbox & Offline Reconciliation
 * 
 * Provides:
 * 1. Persistent IndexedDB storage backing the StorageAdapter interface.
 * 2. Database 'totoafya_outbox_db' (version 1) with object stores 'mutations' and 'kv_cache'.
 * 3. Client-side UUIDv4 idempotency key generation.
 * 4. Optimistic concurrency control via base_version tracking.
 * 5. Dead-letter queue isolation: transitions to 'dead_letter' after 5 retries,
 *    preventing Head-of-Line Blocking in getPendingMutations().
 * 6. Graceful degradation: seamlessly delegates to InMemoryStorageAdapter when
 *    IndexedDB is unavailable or throws (e.g. Node.js/Vitest, private browsing).
 */

import type {
  StorageAdapter,
  MutationRecord,
  MutationSyncStatus,
} from '@totoafya/types';
import { InMemoryStorageAdapter } from './InMemoryStorageAdapter';

export const OUTBOX_DB_NAME = 'totoafya_outbox_db';
export const OUTBOX_DB_VERSION = 1;
export const STORE_MUTATIONS = 'mutations';
export const STORE_KV_CACHE = 'kv_cache';
export const MAX_RETRY_COUNT = 5;

function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

export interface IndexedDBStorageAdapterOptions {
  dbName?: string;
  dbVersion?: number;
  indexedDB?: IDBFactory;
  fallbackAdapter?: InMemoryStorageAdapter;
}

export class IndexedDBStorageAdapter implements StorageAdapter {
  private dbName: string;
  private dbVersion: number;
  private customIndexedDB?: IDBFactory;
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private fallbackAdapter: InMemoryStorageAdapter | null = null;
  private usingFallback = false;

  constructor(options?: IndexedDBStorageAdapterOptions) {
    this.dbName = options?.dbName ?? OUTBOX_DB_NAME;
    this.dbVersion = options?.dbVersion ?? OUTBOX_DB_VERSION;
    this.customIndexedDB = options?.indexedDB;
    if (options?.fallbackAdapter) {
      this.fallbackAdapter = options.fallbackAdapter;
      this.usingFallback = true;
    }
  }

  /**
   * Diagnostic flag indicating whether the adapter has fallen back to in-memory storage.
   */
  public isUsingFallback(): boolean {
    return this.usingFallback;
  }

  /**
   * Returns the underlying fallback adapter when active.
   */
  public getFallbackAdapter(): InMemoryStorageAdapter | null {
    return this.fallbackAdapter;
  }

  private activateFallback(): InMemoryStorageAdapter {
    if (!this.fallbackAdapter) {
      this.fallbackAdapter = new InMemoryStorageAdapter();
    }
    this.usingFallback = true;
    return this.fallbackAdapter;
  }

  private getFactory(): IDBFactory | null {
    if (this.customIndexedDB) {
      return this.customIndexedDB;
    }
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        return window.indexedDB;
      }
      if (typeof globalThis !== 'undefined' && globalThis.indexedDB) {
        return globalThis.indexedDB;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async getDb(): Promise<IDBDatabase | null> {
    if (this.usingFallback && this.fallbackAdapter) {
      return null;
    }
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      const factory = this.getFactory();
      if (!factory) {
        this.activateFallback();
        resolve(null);
        return;
      }

      try {
        const request = factory.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_MUTATIONS)) {
            const mutationStore = db.createObjectStore(STORE_MUTATIONS, { keyPath: 'id' });
            mutationStore.createIndex('sync_status', 'sync_status', { unique: false });
            mutationStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_KV_CACHE)) {
            db.createObjectStore(STORE_KV_CACHE, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          this.activateFallback();
          resolve(null);
        };

        request.onblocked = () => {
          this.activateFallback();
          resolve(null);
        };
      } catch {
        this.activateFallback();
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  private async performTransaction<T>(
    storeName: typeof STORE_MUTATIONS | typeof STORE_KV_CACHE,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T> | T
  ): Promise<T> {
    const db = await this.getDb();
    if (!db) {
      throw new Error('IndexedDB not available');
    }

    return new Promise<T>((resolve, reject) => {
      try {
        const tx = db.transaction([storeName], mode);
        const store = tx.objectStore(storeName);

        let opResult: Promise<T> | T;
        try {
          opResult = operation(store);
        } catch (err) {
          tx.abort();
          reject(err);
          return;
        }

        if (opResult instanceof Promise) {
          opResult
            .then((res) => {
              tx.oncomplete = () => resolve(res);
            })
            .catch((err) => {
              try {
                tx.abort();
              } catch {
                // ignore secondary abort errors
              }
              reject(err);
            });
        } else {
          tx.oncomplete = () => resolve(opResult);
        }

        tx.onerror = () => reject(tx.error || new Error('Transaction error'));
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      } catch (err) {
        reject(err);
      }
    });
  }

  async enqueueMutation(
    mutation: Omit<MutationRecord, 'sync_status' | 'retry_count'> &
      Partial<Pick<MutationRecord, 'sync_status' | 'retry_count'>>
  ): Promise<MutationRecord> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.enqueueMutation(mutation);
    }

    const id = mutation.id || generateUUIDv4();
    const record: MutationRecord = {
      id,
      entity: mutation.entity,
      action: mutation.action,
      payload: { ...mutation.payload },
      base_version: mutation.base_version ?? 1,
      user_id: mutation.user_id,
      operator_id: mutation.operator_id,
      facility_id: mutation.facility_id,
      timestamp: mutation.timestamp || new Date().toISOString(),
      sync_status: mutation.sync_status || 'pending',
      retry_count: mutation.retry_count ?? 0,
      last_error: mutation.last_error,
    };

    await this.performTransaction(STORE_MUTATIONS, 'readwrite', async (store) => {
      await requestToPromise(store.put(record));
    });

    return record;
  }

  async getPendingMutations(): Promise<MutationRecord[]> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.getPendingMutations();
    }

    const records = await this.performTransaction(STORE_MUTATIONS, 'readonly', async (store) => {
      const all = await requestToPromise<MutationRecord[]>(store.getAll());
      return all || [];
    });

    return records
      .filter(
        (m) =>
          m.sync_status === 'pending' ||
          m.sync_status === 'in_flight' ||
          (m.sync_status === 'failed' && m.retry_count < MAX_RETRY_COUNT)
      )
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async getDeadLetterMutations(): Promise<MutationRecord[]> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.getDeadLetterMutations();
    }

    const records = await this.performTransaction(STORE_MUTATIONS, 'readonly', async (store) => {
      const all = await requestToPromise<MutationRecord[]>(store.getAll());
      return all || [];
    });

    return records
      .filter((m) => m.sync_status === 'dead_letter')
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async updateMutationStatus(
    id: string,
    status: MutationSyncStatus,
    error?: string
  ): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.updateMutationStatus(id, status, error);
    }

    await this.performTransaction(STORE_MUTATIONS, 'readwrite', async (store) => {
      const item = await requestToPromise<MutationRecord | undefined>(store.get(id));
      if (!item) return;

      const updated: MutationRecord = {
        ...item,
        sync_status: status,
        ...(error !== undefined ? { last_error: error } : {}),
      };
      await requestToPromise(store.put(updated));
    });
  }

  async incrementRetryCount(id: string, error?: string): Promise<MutationRecord | null> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.incrementRetryCount(id, error);
    }

    return await this.performTransaction(STORE_MUTATIONS, 'readwrite', async (store) => {
      const item = await requestToPromise<MutationRecord | undefined>(store.get(id));
      if (!item) return null;

      const newRetryCount = item.retry_count + 1;
      const isDeadLetter = newRetryCount >= MAX_RETRY_COUNT;

      const updated: MutationRecord = {
        ...item,
        retry_count: newRetryCount,
        sync_status: isDeadLetter ? 'dead_letter' : 'failed',
        ...(error !== undefined ? { last_error: error } : {}),
      };

      await requestToPromise(store.put(updated));
      return updated;
    });
  }

  async removeMutation(id: string): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.removeMutation(id);
    }

    await this.performTransaction(STORE_MUTATIONS, 'readwrite', async (store) => {
      await requestToPromise(store.delete(id));
    });
  }

  async clearQueue(): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.clearQueue();
    }

    await this.performTransaction(STORE_MUTATIONS, 'readwrite', async (store) => {
      await requestToPromise(store.clear());
    });
  }

  async getItem<T = unknown>(key: string): Promise<T | null> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.getItem<T>(key);
    }

    const record = await this.performTransaction(STORE_KV_CACHE, 'readonly', async (store) => {
      return await requestToPromise<{ key: string; value: T } | undefined>(store.get(key));
    });

    if (!record || record.value === undefined) {
      return null;
    }
    return record.value;
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.setItem<T>(key, value);
    }

    await this.performTransaction(STORE_KV_CACHE, 'readwrite', async (store) => {
      await requestToPromise(store.put({ key, value }));
    });
  }

  async removeItem(key: string): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.removeItem(key);
    }

    await this.performTransaction(STORE_KV_CACHE, 'readwrite', async (store) => {
      await requestToPromise(store.delete(key));
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackAdapter!.clear();
    }

    await this.performTransaction(STORE_KV_CACHE, 'readwrite', async (store) => {
      await requestToPromise(store.clear());
    });
  }

  /**
   * Closes the active database connection (useful during teardown / testing).
   */
  async close(): Promise<void> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      if (db) {
        db.close();
      }
      this.dbPromise = null;
    }
  }
}
