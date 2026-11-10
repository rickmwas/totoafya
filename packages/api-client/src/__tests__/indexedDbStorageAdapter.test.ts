/**
 * TotoAfya Digital — IndexedDBStorageAdapter & MutationQueueProcessor Test Suite
 * Task Directive TD-3.4: Transactional Mutation Outbox & Offline Reconciliation
 * 
 * Verifies:
 * 1. Automatic In-Memory fallback activation in Node/Vitest test environment.
 * 2. Enqueueing clinical mutations with client-generated UUIDv4 idempotency keys and base_version.
 * 3. Concurrency tracking and timestamp ordering.
 * 4. Dead-letter queue transition after 5 retries (prevention of Head-of-Line Blocking).
 * 5. Non-blocking queue processing with MutationQueueProcessor.
 * 6. Real-time status event broadcasting ('synced', 'syncing', 'pending', 'dead_letter').
 * 7. Key-Value snapshot caching for offline snapshots.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  IndexedDBStorageAdapter,
  OUTBOX_DB_NAME,
  OUTBOX_DB_VERSION,
} from '../storage/IndexedDBStorageAdapter';
import {
  MutationQueueProcessor,
  type QueueSyncStatus,
  type QueueStatusEvent,
} from '../storage/MutationQueueProcessor';
import type { MutationRecord } from '@totoafya/types';

describe('IndexedDBStorageAdapter & MutationQueueProcessor Verification', () => {
  let adapter: IndexedDBStorageAdapter;

  beforeEach(() => {
    adapter = new IndexedDBStorageAdapter();
  });

  describe('1. In-Memory Fallback Activation in Node/Vitest', () => {
    it('seamlessly falls back to InMemoryStorageAdapter when window.indexedDB is unavailable', async () => {
      // In Node.js / Vitest default runner, window.indexedDB is undefined
      const mutation = await adapter.enqueueMutation({
        entity: 'Mother',
        action: 'create',
        payload: { full_name: 'Amina Kimani', phone: '+254712345678' },
        base_version: 1,
        user_id: 'user-amina-01',
        operator_id: 'user-amina-01',
        facility_id: 'fac-pumwani-01',
      });

      expect(adapter.isUsingFallback()).toBe(true);
      expect(adapter.getFallbackAdapter()).not.toBeNull();
      expect(mutation.id).toBeDefined();
      expect(mutation.sync_status).toBe('pending');
    });

    it('gracefully handles explicit fallback adapter injection', async () => {
      const explicitAdapter = new IndexedDBStorageAdapter();
      await explicitAdapter.setItem('cached_profile', { name: 'Zawadi' });
      const cached = await explicitAdapter.getItem<{ name: string }>('cached_profile');

      expect(cached).toEqual({ name: 'Zawadi' });
      expect(explicitAdapter.isUsingFallback()).toBe(true);
    });
  });

  describe('2. Mutation Enqueueing, UUIDv4 Idempotency & base_version Concurrency', () => {
    it('generates a valid UUIDv4 idempotency key when client does not supply one', async () => {
      const mutation = await adapter.enqueueMutation({
        entity: 'ANCVisit',
        action: 'create',
        payload: {
          visit_number: 2,
          blood_pressure_systolic: 118,
          blood_pressure_diastolic: 78,
        },
        base_version: 1,
        user_id: 'user-001',
        operator_id: 'nurse-jane',
        facility_id: 'fac-001',
        timestamp: '2026-11-10T08:00:00.000Z',
      });

      expect(mutation.id).toBeDefined();
      expect(typeof mutation.id).toBe('string');
      // UUIDv4 format check: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidv4Regex.test(mutation.id)).toBe(true);
      expect(mutation.base_version).toBe(1);
      expect(mutation.retry_count).toBe(0);
      expect(mutation.sync_status).toBe('pending');
    });

    it('preserves client-provided idempotency key and custom base_version', async () => {
      const customKey = 'c9d8e7f6-a5b4-4321-8765-fedcba987654';
      const mutation = await adapter.enqueueMutation({
        id: customKey,
        entity: 'GrowthRecord',
        action: 'update',
        payload: { weight_kg: 5.6, height_cm: 61.2 },
        base_version: 3,
        user_id: 'user-002',
        operator_id: 'chw-001',
        facility_id: 'fac-002',
      });

      expect(mutation.id).toBe(customKey);
      expect(mutation.base_version).toBe(3);
    });

    it('orders pending mutations chronologically by timestamp', async () => {
      await adapter.enqueueMutation({
        id: 'mut-second',
        entity: 'Child',
        action: 'create',
        payload: { full_name: 'Child Two' },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
        timestamp: '2026-11-10T10:00:00.000Z',
      });

      await adapter.enqueueMutation({
        id: 'mut-first',
        entity: 'Child',
        action: 'create',
        payload: { full_name: 'Child One' },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
        timestamp: '2026-11-10T09:00:00.000Z',
      });

      const pending = await adapter.getPendingMutations();
      expect(pending).toHaveLength(2);
      expect(pending[0].id).toBe('mut-first');
      expect(pending[1].id).toBe('mut-second');
    });
  });

  describe('3. Retry Tracking & Dead-Letter Quarantine Isolation', () => {
    it('increments retry count and sets status to failed for attempts 1 through 4', async () => {
      const mut = await adapter.enqueueMutation({
        id: 'retry-mut-1',
        entity: 'Immunization',
        action: 'create',
        payload: { vaccine: 'OPV 1' },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      for (let attempt = 1; attempt <= 4; attempt++) {
        const res = await adapter.incrementRetryCount(mut.id, `Network timeout attempt ${attempt}`);
        expect(res?.retry_count).toBe(attempt);
        expect(res?.sync_status).toBe('failed');
        expect(res?.last_error).toBe(`Network timeout attempt ${attempt}`);
      }

      // Still pending reconciliation (not quarantined yet)
      const pending = await adapter.getPendingMutations();
      expect(pending.some((m) => m.id === 'retry-mut-1')).toBe(true); // retryable failed mutations remain in pending queue until dead_letter
    });

    it('transitions to dead_letter quarantine after 5 retries and prevents Head-of-Line Blocking', async () => {
      const doomedMut = await adapter.enqueueMutation({
        id: 'doomed-mut-ho-l',
        entity: 'ANCVisit',
        action: 'update',
        payload: { systolic: 190 },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      const healthyMut = await adapter.enqueueMutation({
        id: 'healthy-mut',
        entity: 'GrowthRecord',
        action: 'create',
        payload: { weight_kg: 7.1 },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      // Fail doomed mutation 5 times
      for (let i = 1; i <= 4; i++) {
        await adapter.incrementRetryCount(doomedMut.id, `Simulated 500 error ${i}`);
      }
      const finalRes = await adapter.incrementRetryCount(doomedMut.id, 'Fatal 400 Bad Request');
      expect(finalRes?.retry_count).toBe(5);
      expect(finalRes?.sync_status).toBe('dead_letter');

      // Dead letter queue must contain doomedMut
      const deadLetters = await adapter.getDeadLetterMutations();
      expect(deadLetters.map((m) => m.id)).toContain('doomed-mut-ho-l');

      // Pending mutations must ONLY contain healthyMut (Head-of-Line Blocking eliminated!)
      const pending = await adapter.getPendingMutations();
      expect(pending.map((m) => m.id)).toContain('healthy-mut');
      expect(pending.map((m) => m.id)).not.toContain('doomed-mut-ho-l');
    });

    it('clears queue and removes mutations cleanly', async () => {
      const mut = await adapter.enqueueMutation({
        id: 'to-remove',
        entity: 'Milestone',
        action: 'create',
        payload: { title: 'Rolling over' },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      await adapter.removeMutation(mut.id);
      const pending = await adapter.getPendingMutations();
      expect(pending.some((m) => m.id === 'to-remove')).toBe(false);

      await adapter.enqueueMutation({
        id: 'item-1',
        entity: 'Child',
        action: 'create',
        payload: {},
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });
      await adapter.clearQueue();
      const afterClear = await adapter.getPendingMutations();
      expect(afterClear).toHaveLength(0);
    });
  });

  describe('4. Key-Value Persistence for Offline Snapshots', () => {
    it('sets, gets, removes, and clears key-value cache entries', async () => {
      await adapter.setItem('mother_profile_cached', { full_name: 'Faith Chebet', edd: '2027-02-14' });
      const item = await adapter.getItem<{ full_name: string; edd: string }>('mother_profile_cached');
      expect(item).toEqual({ full_name: 'Faith Chebet', edd: '2027-02-14' });

      await adapter.removeItem('mother_profile_cached');
      const missing = await adapter.getItem('mother_profile_cached');
      expect(missing).toBeNull();

      await adapter.setItem('key_a', 123);
      await adapter.setItem('key_b', 456);
      await adapter.clear();
      expect(await adapter.getItem('key_a')).toBeNull();
      expect(await adapter.getItem('key_b')).toBeNull();
    });
  });

  describe('5. Non-Blocking Queue Processing (MutationQueueProcessor)', () => {
    it('processes queue and marks mutations in_flight during dispatch', async () => {
      const mut1 = await adapter.enqueueMutation({
        id: 'mut-sync-1',
        entity: 'Mother',
        action: 'create',
        payload: { name: 'Achieng' },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      const processedIds: string[] = [];
      const processor = new MutationQueueProcessor({
        storage: adapter,
        syncMutation: async (m) => {
          processedIds.push(m.id);
          // When syncing, status in storage should be 'in_flight'
          const fallback = adapter.getFallbackAdapter();
          const inFlightRecord = fallback?.getRecord(m.id);
          expect(inFlightRecord?.sync_status).toBe('in_flight');
        },
      });

      const result = await processor.processQueue();
      expect(result.processed).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.status).toBe('synced');
      expect(processedIds).toEqual(['mut-sync-1']);

      // After successful sync, mutation is removed from outbox
      const pendingAfter = await adapter.getPendingMutations();
      expect(pendingAfter).toHaveLength(0);
    });

    it('continues processing subsequent mutations when an intermediate mutation fails (No Head-of-Line Blocking)', async () => {
      // Enqueue 3 mutations: first fails, second succeeds, third fails
      await adapter.enqueueMutation({
        id: 'mut-fail-1',
        entity: 'ANCVisit',
        action: 'create',
        payload: { errorCase: true },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      await adapter.enqueueMutation({
        id: 'mut-success-2',
        entity: 'GrowthRecord',
        action: 'create',
        payload: { weight_kg: 6.2 },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      await adapter.enqueueMutation({
        id: 'mut-fail-3',
        entity: 'Immunization',
        action: 'create',
        payload: { errorCase: true },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      const processor = new MutationQueueProcessor({
        storage: adapter,
        syncMutation: async (m) => {
          if (m.payload?.errorCase) {
            throw new Error(`Simulated remote HTTP 503 for ${m.id}`);
          }
        },
      });

      const result = await processor.processQueue();

      // All 3 were processed in a single pass without breaking on the first failure
      expect(result.processed).toBe(3);
      expect(result.succeeded).toBe(1); // mut-success-2
      expect(result.failed).toBe(2); // mut-fail-1 and mut-fail-3

      // Verify that mut-success-2 was removed
      const fallback = adapter.getFallbackAdapter();
      expect(fallback?.getRecord('mut-success-2')).toBeUndefined();

      // Verify that failing mutations had their retry count incremented
      const fail1 = fallback?.getRecord('mut-fail-1');
      expect(fail1?.retry_count).toBe(1);
      expect(fail1?.last_error).toContain('Simulated remote HTTP 503 for mut-fail-1');

      const fail3 = fallback?.getRecord('mut-fail-3');
      expect(fail3?.retry_count).toBe(1);
      expect(fail3?.last_error).toContain('Simulated remote HTTP 503 for mut-fail-3');
    });

    it('quarantines failing mutation to dead_letter after 5 processor attempts', async () => {
      await adapter.enqueueMutation({
        id: 'chronic-failure',
        entity: 'Mother',
        action: 'update',
        payload: { invalidSchema: true },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      const processor = new MutationQueueProcessor({
        storage: adapter,
        syncMutation: async () => {
          throw new Error('Fatal validation reject: unmapped schema field');
        },
      });

      // Run 5 natural synchronization passes without artificial status mutations
      for (let pass = 1; pass <= 4; pass++) {
        const res = await processor.processQueue();
        expect(res.failed).toBe(1);
        expect(res.status).toBe('pending');
      }

      const finalPass = await processor.processQueue();
      expect(finalPass.deadLettered).toBe(1);
      expect(finalPass.status).toBe('dead_letter');

      const deadLetters = await adapter.getDeadLetterMutations();
      expect(deadLetters.map((m) => m.id)).toContain('chronic-failure');
      expect(deadLetters[0].retry_count).toBe(5);
      expect(deadLetters[0].sync_status).toBe('dead_letter');
    });

    it('emits real-time status transitions to registered listeners', async () => {
      const events: Array<{ status: QueueSyncStatus; count: number }> = [];

      const processor = new MutationQueueProcessor({
        storage: adapter,
        syncMutation: async () => {
          // fast resolve
        },
      });

      const unsubscribe = processor.subscribe((status, count) => {
        events.push({ status, count });
      });

      expect(processor.getListenerCount()).toBe(1);

      await adapter.enqueueMutation({
        id: 'evt-mut-1',
        entity: 'Milestone',
        action: 'create',
        payload: { test: true },
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
      });

      await processor.processQueue();

      expect(events.length).toBeGreaterThanOrEqual(2);
      expect(events.some((e) => e.status === 'syncing')).toBe(true);
      expect(events.some((e) => e.status === 'synced')).toBe(true);

      unsubscribe();
      expect(processor.getListenerCount()).toBe(0);
    });

    it('returns empty result when queue has no pending items', async () => {
      const processor = new MutationQueueProcessor({ storage: adapter });
      const result = await processor.processQueue();
      expect(result.processed).toBe(0);
      expect(result.status).toBe('synced');
    });
  });
});
