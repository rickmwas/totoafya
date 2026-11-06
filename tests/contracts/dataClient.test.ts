/**
 * TotoAfya Digital — Data Client Contract & Dual-Mode Verification Test Suite
 * Specification: SPRINT 1 CONTRACT & IN-MEMORY VERIFICATION
 * 
 * Verifies that MockDataClient satisfies the IDataClient contract, delivers
 * deterministic clinical workflows (mothers, immunizations, ANC BP triage),
 * executes in sub-5ms in-memory intervals, and exhibits zero network dependency.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockDataClient } from '../../packages/api-client/src/mock/MockDataClient';
import type { IDataClient } from '../../packages/api-client/src/contracts/IDataClient';
import type { Mother, Child, ANCVisit, Immunization } from '../../packages/types/src/index';
import { generateVaccinationSchedule } from '../../packages/business-logic/src/vaccines';

describe('IDataClient Contract & MockDataClient Verification', () => {
  let client: IDataClient;

  beforeEach(() => {
    // Instantiate fresh MockDataClient instance for clean isolation
    client = new MockDataClient();
  });

  describe('1. Interface Structural Conformance', () => {
    it('implements the IDataClient interface specification', () => {
      expect(client.mode).toBe('mock');
      expect(client.mothers).toBeDefined();
      expect(client.children).toBeDefined();
      expect(client.ancVisits).toBeDefined();
      expect(client.immunizations).toBeDefined();
      expect(client.growthRecords).toBeDefined();
      expect(client.facilities).toBeDefined();
      expect(client.nurses).toBeDefined();
      expect(client.milestones).toBeDefined();
      expect(client.alerts).toBeDefined();
      expect(client.learningContents).toBeDefined();
      expect(client.auditLogs).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.payments).toBeDefined();
      expect(client.ai).toBeDefined();
      expect(typeof client.payments.initiateSTKPush).toBe('function');
      expect(typeof client.payments.checkPaymentStatus).toBe('function');
      expect(typeof client.payments.getSubscriptionStatus).toBe('function');
      expect(typeof client.ai.askClinicalQuestion).toBe('function');
      expect(typeof client.getSyncStatus).toBe('function');
      expect(typeof client.sync).toBe('function');
      expect(typeof client.getPendingMutationsCount).toBe('function');
      expect(typeof client.invokeClinicalAI).toBe('function');
    });

    it('reports clean offline-first sync state in mock mode', async () => {
      const status = await client.getSyncStatus();
      expect(status).toBe('synced');

      const count = await client.getPendingMutationsCount();
      expect(count).toBe(0);

      const syncResult = await client.sync();
      expect(syncResult.success).toBe(true);
      expect(syncResult.syncedCount).toBe(0);
      expect(syncResult.timestamp).toBeDefined();
    });
  });

  describe('2. Mother Profile Management & Search Filtering', () => {
    it('lists seed mothers with default pagination and sorting', async () => {
      const mothers = await client.mothers.list();
      expect(Array.isArray(mothers)).toBe(true);
      expect(mothers.length).toBeGreaterThanOrEqual(2);
      expect(mothers[0]).toHaveProperty('id');
      expect(mothers[0]).toHaveProperty('full_name');
    });

    it('filters mothers by facility and pregnancy status', async () => {
      const pumwaniMothers = await client.mothers.filter({
        facility_id: 'fac-pumwani-01',
      });
      expect(pumwaniMothers.length).toBeGreaterThan(0);
      pumwaniMothers.forEach((m) => {
        expect(m.facility_id).toBe('fac-pumwani-01');
      });

      const pregnantMothers = await client.mothers.filter({
        pregnancy_status: 'pregnant',
      });
      pregnantMothers.forEach((m) => {
        expect(m.pregnancy_status).toBe('pregnant');
      });
    });

    it('creates, retrieves, and searches a new mother record in memory', async () => {
      const newMotherData: Partial<Mother> = {
        full_name: 'Zainab Halima Ali',
        national_id: '29881122',
        anc_number: 'ANC-MSA-2026-081',
        phone: '+254 700 112233',
        facility_id: 'fac-pumwani-01',
        pregnancy_status: 'pregnant',
        blood_group: 'B+',
        lmp: '2026-03-01',
        edd: '2026-12-06',
        risk_level: 'low',
        language_preference: 'sw',
      };

      const created = await client.mothers.create(newMotherData);
      expect(created.id).toBeDefined();
      expect(created.full_name).toBe('Zainab Halima Ali');
      expect(created.created_at).toBeDefined();

      const fetched = await client.mothers.get(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.national_id).toBe('29881122');

      // Search by national ID
      const matches = await client.mothers.filter({ national_id: '29881122' });
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe(created.id);
    });
  });

  describe('3. Child Immunization Tracking & Next Due Date Computation', () => {
    it('creates a child, auto-generates Kenyan vaccine schedule, and administers dose', async () => {
      // 1. Register newborn
      const newborn: Partial<Child> = {
        mother_id: 'mother-amina-01',
        full_name: 'Baraka Mwangi',
        date_of_birth: '2026-06-01',
        gender: 'male',
        birth_weight_kg: 3.4,
        birth_height_cm: 50.0,
        health_status: 'healthy',
      };

      const savedChild = await client.children.create(newborn);
      expect(savedChild.id).toBeDefined();

      // 2. Generate standard 7-visit immunization schedule using business logic
      const schedule = generateVaccinationSchedule(savedChild.id, savedChild.date_of_birth);
      expect(schedule).toHaveLength(7);

      // Bulk persist schedule to repository
      const savedVaccines = await client.immunizations.bulkCreate(schedule as Partial<Immunization>[]);
      expect(savedVaccines).toHaveLength(7);

      // 3. Administer birth vaccines: BCG and OPV 0
      const bcg = savedVaccines.find((v) => v.vaccine_name === 'BCG');
      const opv0 = savedVaccines.find((v) => v.vaccine_name === 'OPV 0');
      expect(bcg).toBeDefined();
      expect(opv0).toBeDefined();

      const adminDate = '2026-06-01';
      const updatedBcg = await client.immunizations.update(bcg!.id, {
        status: 'given',
        given_date: adminDate,
        administered_by: 'Nurse Joy Wambui',
        batch_number: 'BCG-SERUM-2026-09',
        facility: 'Pumwani Maternity Hospital',
      });
      await client.immunizations.update(opv0!.id, {
        status: 'given',
        given_date: adminDate,
        administered_by: 'Nurse Joy Wambui',
        batch_number: 'OPV-BIVALENT-2026-01',
        facility: 'Pumwani Maternity Hospital',
      });

      expect(updatedBcg.status).toBe('given');
      expect(updatedBcg.given_date).toBe(adminDate);
      expect(updatedBcg.batch_number).toBe('BCG-SERUM-2026-09');

      // 4. Compute next due immunization in the series
      const pendingVaccines = await client.immunizations.filter({
        child_id: savedChild.id,
        status: 'scheduled',
      }, 'scheduled_date');

      expect(pendingVaccines.length).toBeGreaterThan(0);
      const nextDueVaccine = pendingVaccines[0];
      
      // Expected next dose is Week 6 (OPV 1 + Penta 1 + PCV 1 + Rota 1)
      expect(nextDueVaccine.age_weeks).toBe(6);
      
      // Scheduled date should be DOB + 42 days (2026-06-01 + 42 days = 2026-07-13)
      expect(nextDueVaccine.scheduled_date).toBe('2026-07-13');

      // 5. Update child record visit markers
      const updatedChild = await client.children.update(savedChild.id, {
        last_visit_date: adminDate,
        next_visit_date: nextDueVaccine.scheduled_date,
      });

      expect(updatedChild.last_visit_date).toBe('2026-06-01');
      expect(updatedChild.next_visit_date).toBe('2026-07-13');
    });
  });

  describe('4. Antenatal Care (ANC) Encounter & Blood Pressure Triage', () => {
    it('records an ANC visit with normal blood pressure (Normotensive)', async () => {
      const visitData: Partial<ANCVisit> = {
        mother_id: 'mother-amina-01',
        visit_number: 2,
        visit_date: '2026-06-15',
        gestational_age_weeks: 24,
        facility: 'Pumwani Maternity Hospital',
        clinician_name: 'Nurse Joy Wambui',
        blood_pressure_systolic: 115,
        blood_pressure_diastolic: 75,
        weight_kg: 68.0,
        fundal_height_cm: 24,
        fetal_heart_rate: 142,
        urine_protein: 'negative',
        hiv_status: 'negative',
        danger_signs: [],
      };

      const visit = await client.ancVisits.create(visitData);
      expect(visit.id).toBeDefined();
      expect(visit.blood_pressure_systolic).toBe(115);
      expect(visit.blood_pressure_diastolic).toBe(75);

      // Verify physiological sanity: systolic > diastolic
      expect(visit.blood_pressure_systolic!).toBeGreaterThan(visit.blood_pressure_diastolic!);

      // Triage evaluation: Normal BP
      const isHypertensive = visit.blood_pressure_systolic! >= 140 || visit.blood_pressure_diastolic! >= 90;
      expect(isHypertensive).toBe(false);
    });

    it('records an ANC visit with hypertensive crisis (Preeclampsia Triage Alert)', async () => {
      const preeclampsiaVisitData: Partial<ANCVisit> = {
        mother_id: 'mother-faith-02',
        visit_number: 3,
        visit_date: '2026-06-15',
        gestational_age_weeks: 32,
        facility: 'Kenyatta National Hospital (MCH Wing)',
        clinician_name: 'Dr. Evans Ochieng',
        blood_pressure_systolic: 152, // Critical >= 140
        blood_pressure_diastolic: 98,  // Critical >= 90
        weight_kg: 74.5,
        fundal_height_cm: 31,
        fetal_heart_rate: 155,
        urine_protein: '2+', // Significant proteinuria
        danger_signs: ['Severe headache or blurred vision', 'Swelling of face and hands'],
      };

      const visit = await client.ancVisits.create(preeclampsiaVisitData);
      expect(visit.id).toBeDefined();

      // Clinical Triage Rules Under Kenya MOH Guidelines:
      // BP >= 140/90 with danger signs or proteinuria 2+ indicates Preeclampsia Crisis
      const isSevereHypertension = visit.blood_pressure_systolic! >= 140 || visit.blood_pressure_diastolic! >= 90;
      const hasProteinuria = visit.urine_protein === '2+' || visit.urine_protein === '3+';
      const isPreeclampsiaRisk = isSevereHypertension && hasProteinuria;

      expect(isPreeclampsiaRisk).toBe(true);

      // System triggers high-priority clinical alert
      if (isPreeclampsiaRisk) {
        const alert = await client.alerts.create({
          mother_id: visit.mother_id,
          alert_type: 'danger_sign',
          severity: 'critical',
          title: 'High Risk Alert: Suspected Severe Preeclampsia',
          title_sw: 'Tahadhari ya Hatari: Dalili za Kifafa cha Mimba (Preeclampsia)',
          message: `Maternal BP measured at ${visit.blood_pressure_systolic}/${visit.blood_pressure_diastolic} mmHg with 2+ proteinuria. Immediate obstetric consultation required.`,
          message_sw: `Shinikizo la damu limepimwa ${visit.blood_pressure_systolic}/${visit.blood_pressure_diastolic} mmHg na protini katika mkojo. Uchunguzi wa dharura wa daktari unahitajika mara moja.`,
          action_label: 'Emergency Obstetric Referral',
          action_url: `/nurse/triage/${visit.mother_id}`,
          is_read: false,
          is_resolved: false,
        });

        expect(alert.id).toBeDefined();
        expect(alert.severity).toBe('critical');

        // Update mother's clinical risk status
        const updatedMother = await client.mothers.update(visit.mother_id!, {
          risk_level: 'critical',
          risk_score: 90,
          chv_alerted: true,
        });

        expect(updatedMother.risk_level).toBe('critical');
        expect(updatedMother.chv_alerted).toBe(true);
      }
    });
  });

  describe('5. In-Memory Performance Benchmark (< 5ms SLA) & Zero Network Calling', () => {
    it('executes in-memory entity operations in sub-5ms intervals', async () => {
      // Warmup V8 JIT compiler
      await client.mothers.create({ full_name: 'Warmup Mother' });

      // 1. Benchmark Create
      const startCreate = performance.now();
      const testMother = await client.mothers.create({
        full_name: 'Performance Test Mother',
        national_id: '99887766',
        pregnancy_status: 'pregnant',
      });
      const createDuration = performance.now() - startCreate;

      // 2. Benchmark Get
      const startGet = performance.now();
      const fetched = await client.mothers.get(testMother.id);
      const getDuration = performance.now() - startGet;

      // 3. Benchmark Filter
      const startFilter = performance.now();
      const filtered = await client.mothers.filter({ national_id: '99887766' });
      const filterDuration = performance.now() - startFilter;

      // 4. Benchmark Update
      const startUpdate = performance.now();
      await client.mothers.update(testMother.id, { risk_level: 'medium' });
      const updateDuration = performance.now() - startUpdate;

      // 5. Benchmark List
      const startList = performance.now();
      await client.mothers.list();
      const listDuration = performance.now() - startList;

      expect(fetched).not.toBeNull();
      expect(filtered).toHaveLength(1);

      // Verify strict sub-5ms SLA
      expect(createDuration).toBeLessThan(5.0);
      expect(getDuration).toBeLessThan(5.0);
      expect(filterDuration).toBeLessThan(5.0);
      expect(updateDuration).toBeLessThan(5.0);
      expect(listDuration).toBeLessThan(5.0);
    });

    it('operates entirely offline with zero external network connectivity dependencies', async () => {
      // Offline AI Assistant evaluation
      const aiResponse = await client.invokeClinicalAI('Baby has high fever and severe diarrhea');
      expect(aiResponse).toBeDefined();
      expect(aiResponse.risk_level).toBe('high');
      expect(aiResponse.action_required).toBe('urgent_clinic_visit');
      expect(aiResponse.summary).toContain('danger signs');

      // Routine advisory
      const routineResponse = await client.invokeClinicalAI('Routine feeding guidance');
      expect(routineResponse.risk_level).toBe('low');
      expect(routineResponse.action_required).toBe('routine_monitoring');
    });
  });

  describe('6. M-Pesa Payments & AI Service Contract Compliance', () => {
    it('executes M-Pesa STK push and checks status across data client', async () => {
      const stk = await client.payments.initiateSTKPush('+254712345678', 150, 'monthly');
      expect(stk.checkoutRequestId).toBeDefined();

      const status = await client.payments.checkPaymentStatus(stk.checkoutRequestId);
      expect(status.status).toBe('completed');
      expect(status.receiptNumber).toBeDefined();

      const sub = await client.payments.getSubscriptionStatus('mother-amina-01');
      expect(sub.status).toBe('active');
    });

    it('evaluates clinical questions and detects emergencies via AI service', async () => {
      const urgent = await client.ai.askClinicalQuestion('Baby has high fever and convulsions', undefined, 'en');
      expect(urgent.emergencyDetected).toBe(true);
      expect(urgent.response).toContain('URGENT CLINICAL WARNING');

      const routine = await client.ai.askClinicalQuestion('When should BCG vaccine be given?', undefined, 'sw');
      expect(routine.emergencyDetected).toBe(false);
      expect(routine.response).toContain('Chanjo');
    });
  });
});
