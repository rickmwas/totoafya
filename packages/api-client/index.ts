// Modern Data Abstraction & Dual-Mode Engine
export { dataClient, getDataClient, createDataClient } from './src/factory';
export * from './src/contracts/IDataClient';
export { MockDataClient } from './src/mock/MockDataClient';
export { SupabaseDataClient } from './src/live/SupabaseDataClient';
export * from './src/mock/fixtures/clinicalFixtures';

// Backward Compatibility Layer for Legacy Code
export { default } from './totoafyaClient.js';
export { default as db, totoafya } from './totoafyaClient.js';
export { supabaseDb, supabase } from './supabaseClient.js';
export * from './offlineSync.js';
