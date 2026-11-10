// Modern Data Abstraction & Dual-Mode Engine
export { dataClient, getDataClient, createDataClient } from './src/factory';
export * from './src/contracts/IDataClient';
export * from './src/contracts/IStorageAdapter';
export { InMemoryStorageAdapter } from './src/storage/InMemoryStorageAdapter';
export { IndexedDBStorageAdapter } from './src/storage/IndexedDBStorageAdapter';
export { MutationQueueProcessor } from './src/storage/MutationQueueProcessor';
export * from './src/storage';
export { MockDataClient } from './src/mock/MockDataClient';
export { SupabaseDataClient } from './src/live/SupabaseDataClient';
export * from './src/mock/fixtures/clinicalFixtures';

// Backward Compatibility Layer for Legacy Code
export { default } from './totoafyaClient.js';
export { default as db, totoafya } from './totoafyaClient.js';
export { supabaseDb, supabase } from './supabaseClient.js';
export * from './offlineSync.js';
