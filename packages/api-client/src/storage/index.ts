/**
 * TotoAfya Digital — Outbox & Storage Adapters
 */

export { InMemoryStorageAdapter } from './InMemoryStorageAdapter';
export {
  IndexedDBStorageAdapter,
  OUTBOX_DB_NAME,
  OUTBOX_DB_VERSION,
  STORE_MUTATIONS,
  STORE_KV_CACHE,
  MAX_RETRY_COUNT,
} from './IndexedDBStorageAdapter';
export type { IndexedDBStorageAdapterOptions } from './IndexedDBStorageAdapter';
export {
  MutationQueueProcessor,
} from './MutationQueueProcessor';
export type {
  QueueSyncStatus,
  QueueStatusEvent,
  QueueStatusListener,
  ProcessQueueResult,
  MutationSyncHandler,
  MutationQueueProcessorOptions,
} from './MutationQueueProcessor';
