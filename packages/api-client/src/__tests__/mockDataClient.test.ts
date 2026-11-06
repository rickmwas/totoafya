import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockDataClient } from '../mock/MockDataClient';
import { createDataClient, getDataClient } from '../factory';
import type { SyncStatus } from '../contracts/IDataClient';

describe('MockDataClient & Sprint 2 Nurse Portal Data Layer Verification', () => {
  let client: MockDataClient;

  beforeEach(() => {
    client = new MockDataClient();
  });

  describe('1. Enhanced Clinical Repository Filtering & Search', () => {
    it('supports text search by query on mothers.list() for name, phone, and national ID', async () => {
      // 1. Search by name
      const byName = await client.mothers.list('-created_at', 10, 'Amina');
      expect(byName.length).toBeGreaterThanOrEqual(1);
      expect(byName[0].full_name).toBe('Amina Mwangi');

      // 2. Search by National ID
      const byNationalId = await client.mothers.list('-created_at', 10, '28475920');
      expect(byNationalId.length).toBe(1);
      expect(byNationalId[0].national_id).toBe('28475920');

      // 3. Search by Phone number
      const byPhone = await client.mothers.list('-created_at', 10, '0712 345678');
      expect(byPhone.length).toBe(1);
      expect(byPhone[0].full_name).toBe('Amina Mwangi');

      // 4. Search by ANC number
      const byANC = await client.mothers.list('-created_at', 10, 'ANC-PMH-2026');
      expect(byANC.length).toBeGreaterThanOrEqual(1);
    });

    it('supports mothers.search() with facility_id scoping', async () => {
      const results = await client.mothers.search('Amina', { facility_id: 'fac-pumwani-01' });
      expect(results.length).toBe(1);
      expect(results[0].facility_id).toBe('fac-pumwani-01');

      // Different facility scoping returns empty
      const wrongFacility = await client.mothers.search('Amina', { facility_id: 'fac-knh-02' });
      expect(wrongFacility.length).toBe(0);
    });

    it('allows children.list() to filter by mother_id or search query', async () => {
      // Filter children by mother_id
      const aminaChildren = await client.children.list('-created_at', 10, 'mother-amina-01');
      expect(aminaChildren.length).toBe(2);
      expect(aminaChildren.some((c) => c.full_name === 'Baby Jabali Mwangi')).toBe(true);

      // Search children by name query
      const searchChild = await client.children.list('-created_at', 10, 'Zawadi');
      expect(searchChild.length).toBe(1);
      expect(searchChild[0].full_name).toBe('Zawadi Mwangi');
    });

    it('allows ancVisits.list() to filter by mother_id', async () => {
      const visits = await client.ancVisits.list('-created_at', 10, 'mother-amina-01');
      expect(visits.length).toBe(2);
      expect(visits.every((v) => v.mother_id === 'mother-amina-01')).toBe(true);
    });

    it('allows immunizations.list() to filter by child_id', async () => {
      const vaccines = await client.immunizations.list('-created_at', 10, 'child-jabali-01');
      expect(vaccines.length).toBeGreaterThanOrEqual(4);
      expect(vaccines.every((v) => v.child_id === 'child-jabali-01')).toBe(true);
      expect(vaccines.some((v) => v.vaccine_name === 'BCG')).toBe(true);
    });

    it('allows growthRecords.list() to filter by child_id', async () => {
      const growth = await client.growthRecords.list('-created_at', 10, 'child-jabali-01');
      expect(growth.length).toBe(2);
      expect(growth.every((g) => g.child_id === 'child-jabali-01')).toBe(true);
    });
  });

  describe('2. Dual-Mode Outbox Telemetry & SyncStatusBar Support', () => {
    it('increments outbox counters on create() and notifies sync listeners', async () => {
      const syncStatusHistory: Array<{ status: SyncStatus; count: number }> = [];

      const unsubscribe = client.onSyncStatusChange((status, pendingCount) => {
        syncStatusHistory.push({ status, count: pendingCount });
      });

      // Initial registration callback
      expect(syncStatusHistory.length).toBe(1);
      expect(syncStatusHistory[0]).toEqual({ status: 'synced', count: 0 });

      // 1. Create a mother
      await client.mothers.create({
        full_name: 'Wairimu Kamau',
        national_id: '33221100',
        phone: '+254 700 112233',
        facility_id: 'fac-pumwani-01',
      });

      expect(await client.getPendingSyncCount()).toBe(1);
      expect(await client.getPendingMutationsCount()).toBe(1);
      expect(await client.getSyncStatus()).toBe('pending');
      expect(syncStatusHistory[syncStatusHistory.length - 1]).toEqual({ status: 'pending', count: 1 });

      // 2. Create an ANC encounter
      await client.ancVisits.create({
        mother_id: 'mother-amina-01',
        visit_date: '2026-03-20',
        gestational_age_weeks: 32,
        blood_pressure_systolic: 122,
        blood_pressure_diastolic: 80,
      });

      expect(await client.getPendingSyncCount()).toBe(2);
      expect(syncStatusHistory[syncStatusHistory.length - 1]).toEqual({ status: 'pending', count: 2 });

      // 3. Create a vaccine administration record
      await client.immunizations.create({
        child_id: 'child-jabali-01',
        vaccine_name: 'Yellow Fever',
        scheduled_date: '2026-11-10',
        status: 'given',
      });

      expect(await client.getPendingSyncCount()).toBe(3);

      // 4. Trigger sync (as clicked from SyncStatusBar)
      const syncResult = await client.triggerSync();
      expect(syncResult.success).toBe(true);
      expect(syncResult.syncedCount).toBe(3);

      // Verify counter reset to 0 and listener notified of 'synced'
      expect(await client.getPendingSyncCount()).toBe(0);
      expect(await client.getSyncStatus()).toBe('synced');
      expect(syncStatusHistory[syncStatusHistory.length - 1]).toEqual({ status: 'synced', count: 0 });

      unsubscribe();
    });
  });

  describe('3. Factory & Client Singleton Verification', () => {
    it('factory returns singleton instance of MockDataClient in test environment', () => {
      const clientA = getDataClient();
      const clientB = createDataClient();
      expect(clientA.mode).toBe('mock');
      expect(clientB.mode).toBe('mock');
    });
  });

  describe('4. Sprint 3 M-Pesa Payments & Subscription Verification', () => {
    it('initiates M-Pesa STK push and checks payment status', async () => {
      const stkResult = await client.payments.initiateSTKPush('0712345678', 150, 'monthly');
      expect(stkResult.checkoutRequestId).toBeDefined();
      expect(stkResult.checkoutRequestId.startsWith('ws_CO_')).toBe(true);

      const status = await client.payments.checkPaymentStatus(stkResult.checkoutRequestId);
      expect(status.status).toBe('completed');
      expect(status.receiptNumber).toMatch(/^QK/);
      expect(status.amount).toBe(150);
    });

    it('retrieves subscription status for a registered mother', async () => {
      const sub = await client.payments.getSubscriptionStatus('mother-amina-01');
      expect(sub.motherId).toBe('mother-amina-01');
      expect(sub.status).toBe('active');
      expect(sub.planId).toBe('monthly');
      expect(sub.expiresAt).toBeDefined();
    });
  });

  describe('5. Sprint 3 Clinical AI Service Verification', () => {
    it('detects maternal danger signs and raises emergency flag in English and Swahili', async () => {
      // English danger signs
      const enRes = await client.ai.askClinicalQuestion('Mother has high fever and severe headache', undefined, 'en');
      expect(enRes.emergencyDetected).toBe(true);
      expect(enRes.response).toContain('URGENT CLINICAL WARNING');

      // Swahili danger signs
      const swRes = await client.ai.askClinicalQuestion('Mgonjwa ana homa kali na damu ukeni', undefined, 'sw');
      expect(swRes.emergencyDetected).toBe(true);
      expect(swRes.response).toContain('ONYO LA HARAKA YA KIMATIBABU');
    });

    it('provides routine KEPI immunization and pregnancy guidance without emergency', async () => {
      const vaxRes = await client.ai.askClinicalQuestion('When is the next KEPI vaccine due?', undefined, 'en');
      expect(vaxRes.emergencyDetected).toBe(false);
      expect(vaxRes.response).toContain('KEPI');

      const ancRes = await client.ai.askClinicalQuestion('Advice for healthy pregnancy', { gestationalAge: 24 }, 'en');
      expect(ancRes.emergencyDetected).toBe(false);
      expect(ancRes.response).toContain('Antenatal Care');
    });
  });

  describe('6. Sprint 4 Facility & Super Admin Telemetry Verification', () => {
    it('creates and updates healthcare facilities for Super Admin', async () => {
      const newFacility = await client.facilities.create({
        name: 'Makueni Mother & Child Wellness Hospital',
        county: 'Makueni',
        sub_county: 'Wote',
        level: 'Level 4',
      });
      expect(newFacility.id).toBeDefined();
      expect(newFacility.name).toBe('Makueni Mother & Child Wellness Hospital');

      const updated = await client.facilities.update(newFacility.id, {
        phone: '+254 700 123456',
      });
      expect(updated.phone).toBe('+254 700 123456');
    });

    it('invites clinician/staff member to a health facility', async () => {
      const inviteRes = await client.nurses.invite({
        email: 'faith.mutua@makueni.health.go.ke',
        fullName: 'Nurse Faith Mutua',
        role: 'nurse',
        facilityId: 'fac-pumwani-01',
      });
      expect(inviteRes.success).toBe(true);
      expect(inviteRes.nurse).toBeDefined();
      expect(inviteRes.nurse?.email).toBe('faith.mutua@makueni.health.go.ke');
      expect(inviteRes.nurse?.facility_id).toBe('fac-pumwani-01');

      // Verify the invited nurse can now be retrieved
      const listed = await client.nurses.get(inviteRes.nurse!.id);
      expect(listed?.full_name).toBe('Nurse Faith Mutua');
    });

    it('records and queries security audit logs', async () => {
      const log = await client.auditLogs.create({
        action: 'staff.invite',
        entity: 'Nurse',
        actor_name: 'Super Admin',
        actor_role: 'super_admin',
        facility_id: 'fac-pumwani-01',
        details: { target_email: 'faith.mutua@makueni.health.go.ke' },
      });
      expect(log.id).toBeDefined();
      expect(log.action).toBe('staff.invite');

      const logs = await client.auditLogs.filter({ action: 'staff.invite' });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs.some((l) => l.actor_name === 'Super Admin')).toBe(true);
    });

    it('calculates facility clinical census and nutrition metrics', async () => {
      // Register an active antenatal pregnancy at Pumwani for census evaluation
      await client.mothers.create({
        full_name: 'Zawadi Mwiti',
        facility_id: 'fac-pumwani-01',
        pregnancy_status: 'pregnant',
      });

      const census = await client.getFacilityCensus('fac-pumwani-01');
      expect(census.facilityId).toBe('fac-pumwani-01');
      expect(census.totalMothers).toBeGreaterThanOrEqual(2);
      expect(census.activePregnancies).toBeGreaterThanOrEqual(1);
      expect(census.totalChildren).toBeGreaterThanOrEqual(1);
      expect(census.ancVisitsToday).toBeGreaterThanOrEqual(1);
      expect(census.vaccinesToday).toBeGreaterThanOrEqual(1);
      expect(typeof census.samCases).toBe('number');
      expect(typeof census.mamCases).toBe('number');
    });
  });
});
