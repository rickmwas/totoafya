/**
 * TotoAfya Digital — Storage Adapter & Mutation Outbox Test Suite
 * Task Directive TD-1.3: Data Models & Storage Adapter Contracts
 * 
 * Verifies:
 * 1. StorageAdapter interface conformance via InMemoryStorageAdapter.
 * 2. Idempotent client-generated UUIDv4 mutation queueing.
 * 3. Concurrency tracking with base_version.
 * 4. Dead-letter queue transition after 5 retries (Head-of-Line Blocking prevention).
 * 5. Clinician Precedence conflict resolution with caregiver notification codes.
 * 6. Runtime type guards for entities, clinical measurements, and outbox mutations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorageAdapter } from '../storage/InMemoryStorageAdapter';
import { resolveClinicianPrecedenceConflict } from '../contracts/IStorageAdapter';
import type {
  MutationRecord,
  StorageAdapter,
  Mother,
  Child,
  ANCVisit,
  GrowthRecord,
  ImmunizationRecord,
  MilestoneRecord,
  AIAlert,
  BloodPressureReading,
  MUACMeasurement,
} from '@totoafya/types';
import {
  isMother,
  isChild,
  isANCVisit,
  isGrowthRecord,
  isImmunizationRecord,
  isMilestoneRecord,
  isAIAlert,
  isMutationRecord,
  isBloodPressureReading,
  isMUACMeasurement,
  isUserRole,
} from '@totoafya/types';

describe('StorageAdapter Contract & Mutation Outbox Verification', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new InMemoryStorageAdapter();
  });

  describe('1. Outbox Mutation Enqueueing & Idempotency', () => {
    it('enqueues a clinical mutation with auto-generated UUIDv4 idempotency key', async () => {
      const mutation = await adapter.enqueueMutation({
        entity: 'Mother',
        action: 'create',
        payload: {
          full_name: 'Halima Mwangi',
          national_id: '39485721',
          pregnancy_status: 'pregnant',
        },
        base_version: 1,
        user_id: 'user-auth-halima-01',
        operator_id: 'user-auth-halima-01',
        facility_id: 'fac-pumwani-01',
        timestamp: '2026-11-09T10:00:00.000Z',
      });

      expect(mutation.id).toBeDefined();
      expect(typeof mutation.id).toBe('string');
      expect(mutation.id.length).toBeGreaterThanOrEqual(16);
      expect(mutation.sync_status).toBe('pending');
      expect(mutation.retry_count).toBe(0);
      expect(mutation.base_version).toBe(1);
      expect(mutation.entity).toBe('Mother');
      expect(mutation.action).toBe('create');
    });

    it('preserves client-provided UUIDv4 idempotency key if supplied', async () => {
      const clientKey = 'b9c7b960-496e-445a-94ef-64b1ea9b9776';
      const mutation = await adapter.enqueueMutation({
        id: clientKey,
        entity: 'ANCVisit',
        action: 'create',
        payload: {
          visit_number: 1,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
        },
        base_version: 1,
        user_id: 'user-auth-amina-01',
        operator_id: 'nurse-jane-01',
        facility_id: 'fac-pumwani-01',
        timestamp: '2026-11-09T11:00:00.000Z',
      });

      expect(mutation.id).toBe(clientKey);
    });

    it('retrieves only pending and in_flight mutations in chronological order', async () => {
      await adapter.enqueueMutation({
        id: 'mut-early',
        entity: 'GrowthRecord',
        action: 'create',
        payload: { weight_kg: 4.2 },
        base_version: 1,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T09:00:00.000Z',
      });

      await adapter.enqueueMutation({
        id: 'mut-late',
        entity: 'Immunization',
        action: 'create',
        payload: { vaccine_name: 'BCG' },
        base_version: 1,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T10:00:00.000Z',
      });

      const pending = await adapter.getPendingMutations();
      expect(pending).toHaveLength(2);
      expect(pending[0].id).toBe('mut-early');
      expect(pending[1].id).toBe('mut-late');
    });
  });

  describe('2. Retry Tracking & Dead-Letter Queue Isolation', () => {
    it('increments retry_count and marks status as failed on initial retry attempts', async () => {
      const mut = await adapter.enqueueMutation({
        id: 'retry-test-01',
        entity: 'Child',
        action: 'create',
        payload: { full_name: 'Baby Zawadi' },
        base_version: 1,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T10:00:00.000Z',
      });

      const updated = await adapter.incrementRetryCount(mut.id, 'Network timeout connecting to PostgREST');
      expect(updated).not.toBeNull();
      expect(updated?.retry_count).toBe(1);
      expect(updated?.sync_status).toBe('failed');
      expect(updated?.last_error).toBe('Network timeout connecting to PostgREST');
    });

    it('transitions to dead_letter quarantine status upon reaching 5 retries', async () => {
      const mut = await adapter.enqueueMutation({
        id: 'dead-letter-test',
        entity: 'ANCVisit',
        action: 'update',
        payload: { notes: 'Severe headache' },
        base_version: 2,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T10:00:00.000Z',
      });

      // 4 retry attempts
      for (let i = 1; i <= 4; i++) {
        const res = await adapter.incrementRetryCount(mut.id, `Simulated network error attempt ${i}`);
        expect(res?.retry_count).toBe(i);
        expect(res?.sync_status).toBe('failed');
      }

      // 5th retry attempt -> transitions to dead_letter
      const finalRes = await adapter.incrementRetryCount(mut.id, 'Fatal schema mismatch');
      expect(finalRes?.retry_count).toBe(5);
      expect(finalRes?.sync_status).toBe('dead_letter');

      // Verify dead_letter queue retrieval
      const deadLetterList = await adapter.getDeadLetterMutations();
      expect(deadLetterList).toHaveLength(1);
      expect(deadLetterList[0].id).toBe('dead-letter-test');

      // Verify pending queue does NOT include dead_letter items (prevention of Head-of-Line Blocking)
      const pendingList = await adapter.getPendingMutations();
      expect(pendingList.some((m) => m.id === 'dead-letter-test')).toBe(false);
    });

    it('removes mutation cleanly after successful sync', async () => {
      const mut = await adapter.enqueueMutation({
        id: 'mut-to-remove',
        entity: 'Milestone',
        action: 'create',
        payload: { milestone_name: 'Smiles responsively' },
        base_version: 1,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T10:00:00.000Z',
      });

      await adapter.removeMutation(mut.id);
      const pending = await adapter.getPendingMutations();
      expect(pending.some((m) => m.id === mut.id)).toBe(false);
    });
  });

  describe('3. Key-Value Caching Operations', () => {
    it('sets, gets, and removes cached items', async () => {
      await adapter.setItem('cached_mother_profile', { id: 'm-01', name: 'Amina' });
      const fetched = await adapter.getItem<{ id: string; name: string }>('cached_mother_profile');
      expect(fetched).toEqual({ id: 'm-01', name: 'Amina' });

      await adapter.removeItem('cached_mother_profile');
      const removed = await adapter.getItem('cached_mother_profile');
      expect(removed).toBeNull();
    });

    it('clears cache and queue', async () => {
      await adapter.setItem('key1', 'val1');
      await adapter.clear();
      expect(await adapter.getItem('key1')).toBeNull();

      await adapter.enqueueMutation({
        id: 'm1',
        entity: 'Mother',
        action: 'create',
        payload: {},
        base_version: 1,
        user_id: 'u1',
        operator_id: 'u1',
        facility_id: 'f1',
        timestamp: '2026-11-09T10:00:00.000Z',
      });
      await adapter.clearQueue();
      expect(await adapter.getPendingMutations()).toHaveLength(0);
    });
  });

  describe('4. Clinician Precedence Conflict Resolution Policy', () => {
    it('prioritizes server clinical entry over caregiver offline modification', () => {
      const serverRecord = {
        id: 'anc-01',
        blood_pressure_systolic: 145,
        blood_pressure_diastolic: 95,
        updated_by_role: 'nurse',
        updated_at: '2026-11-09T12:00:00.000Z',
      };

      const clientMutation: MutationRecord = {
        id: 'client-mut-01',
        entity: 'ANCVisit',
        action: 'update',
        payload: { blood_pressure_systolic: 120, blood_pressure_diastolic: 80 },
        base_version: 1,
        user_id: 'user-caregiver-01',
        operator_id: 'user-caregiver-01',
        facility_id: 'fac-pumwani-01',
        timestamp: '2026-11-09T12:05:00.000Z',
        sync_status: 'pending',
        retry_count: 0,
      };

      const resolution = resolveClinicianPrecedenceConflict(serverRecord, clientMutation);
      expect(resolution.resolution).toBe('accept_server');
      expect(resolution.userNotificationRequired).toBe(true);
      expect(resolution.notificationCode).toBe('overwritten_by_clinician');
      expect(resolution.details).toContain('authoritatively by healthcare provider');
    });

    it('resolves non-clinician conflicts via chronological timestamp reconciliation', () => {
      const serverRecord = {
        id: 'mother-01',
        phone: '+254 700 999888',
        operator_role: 'mother',
        updated_at: '2026-11-09T14:00:00.000Z',
      };

      const clientMutationOlder: MutationRecord = {
        id: 'client-mut-old',
        entity: 'Mother',
        action: 'update',
        payload: { phone: '+254 700 111222' },
        base_version: 1,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T13:00:00.000Z', // older than server
        sync_status: 'pending',
        retry_count: 0,
      };

      const resolution = resolveClinicianPrecedenceConflict(serverRecord, clientMutationOlder);
      expect(resolution.resolution).toBe('accept_server');
      expect(resolution.notificationCode).toBe('data_reconciled');
    });

    it('forces client mutation when client write is newer than non-clinician server record', () => {
      const serverRecord = {
        id: 'mother-01',
        phone: '+254 700 999888',
        operator_role: 'mother',
        updated_at: '2026-11-09T14:00:00.000Z',
      };

      const clientMutationNewer: MutationRecord = {
        id: 'client-mut-new',
        entity: 'Mother',
        action: 'update',
        payload: { phone: '+254 700 333444' },
        base_version: 1,
        user_id: 'user-01',
        operator_id: 'user-01',
        facility_id: 'fac-01',
        timestamp: '2026-11-09T15:00:00.000Z', // newer than server
        sync_status: 'pending',
        retry_count: 0,
      };

      const resolution = resolveClinicianPrecedenceConflict(serverRecord, clientMutationNewer);
      expect(resolution.resolution).toBe('force_client');
      expect(resolution.userNotificationRequired).toBe(false);
      expect(resolution.notificationCode).toBe('data_reconciled');
    });
  });

  describe('5. Strict Runtime Type Guards Verification', () => {
    it('validates Mother entity structure with isMother guard', () => {
      const validMother: Mother = {
        id: 'm-01',
        full_name: 'Zainab Mwangi',
        pregnancy_status: 'pregnant',
        lmp: '2026-03-01',
        edd: '2026-12-06',
        risk_level: 'low',
      };
      expect(isMother(validMother)).toBe(true);
      expect(isMother({ id: 'm-02' })).toBe(false);
      expect(isMother(null)).toBe(false);
      expect(isMother('string')).toBe(false);
    });

    it('validates Child entity structure with isChild guard', () => {
      const validChild: Child = {
        id: 'c-01',
        full_name: 'Baby Jabali',
        date_of_birth: '2026-06-01',
        gender: 'male',
        health_status: 'healthy',
      };
      expect(isChild(validChild)).toBe(true);
      expect(isChild({ id: 'c-02', full_name: 'No DOB' })).toBe(false);
      expect(isChild({ id: 'c-03', full_name: 'Bad Gender', date_of_birth: '2026-01-01', gender: 'other' })).toBe(false);
    });

    it('validates ANCVisit entity structure with isANCVisit guard', () => {
      const validANC: ANCVisit = {
        id: 'anc-01',
        visit_date: '2026-05-10',
        visit_number: 1,
        blood_pressure_systolic: 118,
        blood_pressure_diastolic: 76,
      };
      expect(isANCVisit(validANC)).toBe(true);
      expect(isANCVisit({ id: 'anc-02' })).toBe(false);
    });

    it('validates GrowthRecord entity structure with isGrowthRecord guard', () => {
      const validGrowth: GrowthRecord = {
        id: 'gr-01',
        recorded_date: '2026-07-01',
        weight_kg: 5.6,
        height_cm: 58.0,
        muac_cm: 13.0,
      };
      expect(isGrowthRecord(validGrowth)).toBe(true);
      expect(isGrowthRecord({ id: 'gr-02' })).toBe(false);
    });

    it('validates ImmunizationRecord with isImmunizationRecord guard', () => {
      const validVax: ImmunizationRecord = {
        id: 'vax-01',
        vaccine_name: 'BCG',
        scheduled_date: '2026-06-01',
        status: 'given',
      };
      expect(isImmunizationRecord(validVax)).toBe(true);
      expect(isImmunizationRecord({ id: 'vax-02', vaccine_name: 'BCG' })).toBe(false);
    });

    it('validates MilestoneRecord with isMilestoneRecord guard', () => {
      const validMilestone: MilestoneRecord = {
        id: 'ms-01',
        milestone_name: 'Holds head steady',
        category: 'motor',
      };
      expect(isMilestoneRecord(validMilestone)).toBe(true);
      expect(isMilestoneRecord({ id: 'ms-02' })).toBe(false);
    });

    it('validates AIAlert with isAIAlert guard', () => {
      const validAlert: AIAlert = {
        id: 'alt-01',
        title: 'Missed Vaccination',
        message: 'Pentavalent 1 is due for Baby Jabali',
        severity: 'warning',
      };
      expect(isAIAlert(validAlert)).toBe(true);
      expect(isAIAlert({ id: 'alt-02', title: 'Only title' })).toBe(false);
    });

    it('validates MutationRecord with isMutationRecord guard', () => {
      const validMut: MutationRecord = {
        id: 'mut-uuid-01',
        entity: 'Mother',
        action: 'create',
        payload: { full_name: 'Test' },
        base_version: 1,
        user_id: 'u-01',
        operator_id: 'u-01',
        facility_id: 'f-01',
        timestamp: '2026-11-09T10:00:00.000Z',
        sync_status: 'pending',
        retry_count: 0,
      };
      expect(isMutationRecord(validMut)).toBe(true);
      expect(isMutationRecord({ ...validMut, entity: 'InvalidEntity' })).toBe(false);
      expect(isMutationRecord({ ...validMut, action: 'invalidAction' })).toBe(false);
      expect(isMutationRecord({ ...validMut, sync_status: 'invalidStatus' })).toBe(false);
    });

    it('validates BloodPressureReading with isBloodPressureReading guard', () => {
      const validBP: BloodPressureReading = {
        systolic: 145,
        diastolic: 92,
        measuredAt: '2026-11-09T10:00:00.000Z',
        triageCategory: 'stage2_hypertension',
        isPreEclampsiaRisk: true,
        isCriticalEmergency: false,
      };
      expect(isBloodPressureReading(validBP)).toBe(true);
      expect(isBloodPressureReading({ systolic: 120 })).toBe(false);
    });

    it('validates MUACMeasurement with isMUACMeasurement guard', () => {
      const validMUAC: MUACMeasurement = {
        muacCm: 11.2,
        childAgeMonths: 9,
        classification: 'SAM',
        colorBand: 'red',
        isEligible: true,
        measuredAt: '2026-11-09T10:00:00.000Z',
      };
      expect(isMUACMeasurement(validMUAC)).toBe(true);
      expect(isMUACMeasurement({ muacCm: 11.2, classification: 'INVALID' })).toBe(false);
    });

    it('validates UserRole with isUserRole guard', () => {
      expect(isUserRole('mother')).toBe(true);
      expect(isUserRole('nurse')).toBe(true);
      expect(isUserRole('facility_admin')).toBe(true);
      expect(isUserRole('chv')).toBe(true);
      expect(isUserRole('super_admin')).toBe(false);
      expect(isUserRole('random_role')).toBe(false);
    });
  });
});
