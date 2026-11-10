// Modern Data Abstraction & Dual-Mode Engine
export { dataClient, getDataClient, createDataClient } from './factory';
export * from './contracts/IDataClient';
export * from './contracts/IStorageAdapter';
export * from './storage';
export { MockDataClient } from './mock/MockDataClient';
export { SupabaseDataClient } from './live/SupabaseDataClient';
export * from './mock/fixtures/clinicalFixtures';
