import type { IDataClient } from './contracts/IDataClient';
import { MockDataClient } from './mock/MockDataClient';
import { SupabaseDataClient } from './live/SupabaseDataClient';

function getEnvValue(key: string): string | null {
  // 1. Browser runtime global
  if (typeof window !== 'undefined') {
    if ((window as any).__TOTOAFYA_DATA_MODE__ && key === 'VITE_DATA_MODE') {
      return (window as any).__TOTOAFYA_DATA_MODE__;
    }
    if ((window as any).__TOTOAFYA_ENV__ && (window as any).__TOTOAFYA_ENV__[key] !== undefined) {
      return (window as any).__TOTOAFYA_ENV__[key];
    }
  }

  // 2. Vite compiler replacements
  try {
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {}

  // 3. Node process.env / Expo EXPO_PUBLIC_
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
    if (process.env[`EXPO_PUBLIC_${key}`]) return process.env[`EXPO_PUBLIC_${key}`];
  }

  return null;
}

export function createDataClient(): IDataClient {
  const dataMode = (
    getEnvValue('VITE_DATA_MODE') ||
    getEnvValue('DATA_MODE') ||
    getEnvValue('VITE_DATABASE_PROVIDER') ||
    getEnvValue('DATABASE_PROVIDER') ||
    'mock'
  ).toLowerCase();

  const supabaseUrl = getEnvValue('VITE_SUPABASE_URL') || getEnvValue('SUPABASE_URL');
  const supabaseKey = getEnvValue('VITE_SUPABASE_ANON_KEY') || getEnvValue('SUPABASE_ANON_KEY');

  const isLiveRequested = dataMode === 'live' || dataMode === 'supabase';

  if (isLiveRequested && supabaseUrl && supabaseKey) {
    console.info('[DataClientFactory] Initializing SupabaseDataClient (Live mode with Outbox)');
    return new SupabaseDataClient(supabaseUrl, supabaseKey);
  }

  if (isLiveRequested && (!supabaseUrl || !supabaseKey)) {
    console.warn(
      '[DataClientFactory] Live mode requested but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Falling back to MockDataClient.'
    );
  }

  console.info('[DataClientFactory] Initializing MockDataClient (In-memory / Fixtures mode)');
  return new MockDataClient();
}

let cachedClient: IDataClient | null = null;

export function getDataClient(): IDataClient {
  if (!cachedClient) {
    cachedClient = createDataClient();
  }
  return cachedClient;
}

export const dataClient = getDataClient();
export default dataClient;
