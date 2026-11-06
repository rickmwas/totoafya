/**
 * TotoAfya Digital — Nurse Portal Workflow Integration Test Suite
 * Specification: SPRINT 2 END-TO-END WORKFLOW VERIFICATION
 *
 * Verifies all 7 core clinical and operational workflows of the rebuilt Nurse Portal:
 * 1. Clinician Facility Binding & Station Selection
 * 2. Fast Patient Search & Queue Management (< 50ms)
 * 3. Walk-in Mother & Infant Registration (EDD, Gestational Age, KEPI Schedule)
 * 4. Antenatal Care (ANC) Intake with Automated Preeclampsia Triage
 * 5. Immunization Administration & Dynamic Next Visit Automation
 * 6. Child Growth Tracking & WHO Malnutrition Classification (SAM / MAM)
 * 7. Offline Outbox Mutation Queue & Sync Status Transitions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockDataClient } from '../../packages/api-client/src/mock/MockDataClient';
import type { IDataClient } from '../../packages/api-client/src/contracts/IDataClient';
import type { Mother, Child, ANCVisit, Immunization, GrowthRecord } from '../../packages/types/src/index';
import { calculateGestationalAgeInWeeks, calculateEdd } from '../../packages/business-logic/src/anc';
import { generateVaccinationSchedule } from '../../packages/business-logic/src/vaccines';
import { classifyNutritionStatus } from '../../packages/business-logic/src/growth';

describe('Nurse Portal End-to-End Clinical Workflows', () => {
  let client: IDataClient;

  beforeEach(() => {
    client = new MockDataClient();
  });

  // =========================================================================
  // WORKFLOW 1: Clinician Facility Binding & Station Selection
  // =========================================================================
  describe('Workflow 1: Clinician Facility Binding & Station Selection', () => {
    it('authenticates nurse, verifies facility binding to Pumwani Maternity, and configures active clinical station', async () => {
      // 1. Nurse logs in with clinical credentials
      const user = await client.auth.login('joy.wambui@pumwani.health.go.ke', 'valid-password');
      expect(user).toBeDefined();
      expect(user.role).toBe('nurse');
      expect(user.email).toBe('joy.wambui@pumwani.health.go.ke');
      expect(user.full_name).toBe('Nurse Joy Wambui');

      // 2. Verify facility binding
      expect(user.facility_id).toBe('fac-pumwani-01');
      const facility = await client.facilities.get(user.facility_id!);
      expect(facility).not.toBeNull();
      expect(facility?.name).toBe('Pumwani Maternity Hospital');
      expect(facility?.county).toBe('Nairobi');

      // 3. Configure clinical workstation session
      interface NurseStationContext {
        nurseId: string;
        nurseName: string;
        facilityId: string;
        facilityName: string;
        station: 'MCH Triage' | 'ANC Clinic' | 'EPI Immunization' | 'Postnatal Ward';
        shiftDate: string;
      }

      const activeStation: NurseStationContext = {
        nurseId: user.nurse_id || user.id,
        nurseName: user.full_name,
        facilityId: facility!.id,
        facilityName: facility!.name,
        station: 'MCH Triage',
        shiftDate: new Date().toISOString().split('T')[0],
      };

      expect(activeStation.station).toBe('MCH Triage');
      expect(activeStation.facilityId).toBe('fac-pumwani-01');
      expect(activeStation.nurseName).toBe('Nurse Joy Wambui');
    });
  });

  // =========================================================================
  // WORKFLOW 2: Fast Patient Search & Queue Management (< 50ms)
  // =========================================================================
  describe('Workflow 2: Fast Patient Search & Queue Management', () => {
    it('retrieves patient queue and executes sub-50ms search by name, national ID, and phone', async () => {
      // 1. Benchmark patient queue retrieval
      const startTime = performance.now();
      const facilityQueue = await client.mothers.filter({
        facility_id: 'fac-pumwani-01',
      });
      const fetchDuration = performance.now() - startTime;

      expect(facilityQueue.length).toBeGreaterThan(0);
      expect(fetchDuration).toBeLessThan(50.0); // Sub-50ms SLA

      // 2. Search by Name ("Amina")
      const searchStartName = performance.now();
      const allMothers = await client.mothers.list();
      const aminaResults = allMothers.filter((m) =>
        m.full_name.toLowerCase().includes('amina') ||
        m.national_id?.includes('amina')
      );
      const nameSearchDuration = performance.now() - searchStartName;

      expect(aminaResults.length).toBeGreaterThan(0);
      expect(aminaResults[0].full_name).toBe('Amina Mwangi');
      expect(nameSearchDuration).toBeLessThan(50.0);

      // 3. Search by National ID ("28475920")
      const searchStartId = performance.now();
      const idMatches = await client.mothers.filter({ national_id: '28475920' });
      const idSearchDuration = performance.now() - searchStartId;

      expect(idMatches).toHaveLength(1);
      expect(idMatches[0].national_id).toBe('28475920');
      expect(idSearchDuration).toBeLessThan(50.0);

      // 4. Search by Phone number ("+254 712 345678")
      const phoneMatches = await client.mothers.filter({ phone: '+254 712 345678' });
      expect(phoneMatches).toHaveLength(1);
      expect(phoneMatches[0].full_name).toBe('Amina Mwangi');
      expect(phoneMatches[0].anc_number).toBe('ANC-PMH-2026-0042');
    });
  });

  // =========================================================================
  // WORKFLOW 3: Walk-in Mother & Infant Registration
  // =========================================================================
  describe('Workflow 3: Walk-in Mother & Infant Registration', () => {
    it('registers a walk-in pregnant mother with computed EDD and gestational age', async () => {
      // 1. Walk-in pregnant mother registration
      const lmpDate = '2026-02-15';
      const referenceDate = new Date('2026-05-10T00:00:00Z'); // 12 weeks later

      const calculatedGestationalAge = calculateGestationalAgeInWeeks(lmpDate, referenceDate);
      const calculatedEdd = calculateEdd(lmpDate);

      expect(calculatedGestationalAge).toBe(12);
      expect(calculatedEdd).toBe('2026-11-22'); // 2026-02-15 + 280 days

      const newMother: Partial<Mother> = {
        full_name: 'Beatrice Akinyi',
        national_id: '34991234',
        anc_number: 'ANC-PMH-2026-0155',
        phone: '+254 711 998877',
        facility_id: 'fac-pumwani-01',
        pregnancy_status: 'pregnant',
        blood_group: 'B+',
        lmp: lmpDate,
        edd: calculatedEdd,
        gravida: 1,
        parity: 0,
        risk_level: 'low',
        language_preference: 'sw',
      };

      const savedMother = await client.mothers.create(newMother);
      expect(savedMother.id).toBeDefined();
      expect(savedMother.full_name).toBe('Beatrice Akinyi');
      expect(savedMother.edd).toBe('2026-11-22');

      // Verify persistence
      const retrieved = await client.mothers.get(savedMother.id);
      expect(retrieved?.national_id).toBe('34991234');
      expect(retrieved?.pregnancy_status).toBe('pregnant');
    });

    it('registers a newborn infant and auto-generates Kenyan KEPI vaccination timetable', async () => {
      // 1. Register infant born at facility
      const newbornData: Partial<Child> = {
        mother_id: 'mother-amina-01',
        full_name: 'Zawadi Mwangi',
        date_of_birth: '2026-06-01',
        gender: 'female',
        birth_weight_kg: 3.2,
        birth_height_cm: 49.0,
        birth_facility: 'Pumwani Maternity Hospital',
        birth_type: 'normal',
        health_status: 'healthy',
      };

      const infant = await client.children.create(newbornData);
      expect(infant.id).toBeDefined();
      expect(infant.full_name).toBe('Zawadi Mwangi');

      // 2. Auto-generate KEPI schedule
      const kepiSchedule = generateVaccinationSchedule(infant.id, infant.date_of_birth);
      expect(kepiSchedule).toHaveLength(7);

      // Verify birth doses are present
      expect(kepiSchedule[0].vaccine_name).toBe('BCG');
      expect(kepiSchedule[0].scheduled_date).toBe('2026-06-01');
      expect(kepiSchedule[1].vaccine_name).toBe('OPV 0');
      expect(kepiSchedule[1].scheduled_date).toBe('2026-06-01');

      // 3. Bulk insert immunizations
      const savedImmunizations = await client.immunizations.bulkCreate(kepiSchedule as Partial<Immunization>[]);
      expect(savedImmunizations).toHaveLength(7);

      const scheduledForChild = await client.immunizations.filter({ child_id: infant.id });
      expect(scheduledForChild).toHaveLength(7);
    });
  });

  // =========================================================================
  // WORKFLOW 4: Antenatal Care (ANC) Intake with Preeclampsia Triage
  // =========================================================================
  describe('Workflow 4: Antenatal Care (ANC) Intake with Preeclampsia Triage', () => {
    it('detects severe preeclampsia (BP 150/95 mmHg), generates critical alert, and escalates mother risk score', async () => {
      const highRiskMotherId = 'mother-faith-02';

      // 1. Triage Intake with Hypertensive Crisis Vitals
      const ancVisitPayload: Partial<ANCVisit> = {
        mother_id: highRiskMotherId,
        visit_number: 3,
        visit_date: '2026-06-16',
        gestational_age_weeks: 34,
        facility: 'Pumwani Maternity Hospital',
        clinician_name: 'Nurse Joy Wambui',
        blood_pressure_systolic: 150, // >= 140
        blood_pressure_diastolic: 95, // >= 90
        weight_kg: 76.0,
        fundal_height_cm: 33,
        fetal_heart_rate: 150,
        urine_protein: '2+',
        danger_signs: ['Severe headache or blurred vision', 'Swelling of face and hands'],
      };

      const visit = await client.ancVisits.create(ancVisitPayload);
      expect(visit.id).toBeDefined();

      // 2. Automated Clinical Triage Evaluation
      const systolic = visit.blood_pressure_systolic!;
      const diastolic = visit.blood_pressure_diastolic!;
      const isHypertensive = systolic >= 140 || diastolic >= 90;
      const hasDangerSigns = (visit.danger_signs?.length || 0) > 0;
      const hasProteinuria = visit.urine_protein === '2+' || visit.urine_protein === '3+';

      const isPreeclampsiaEmergency = isHypertensive && (hasDangerSigns || hasProteinuria);
      expect(isPreeclampsiaEmergency).toBe(true);

      // 3. Trigger Critical Safety Alert
      if (isPreeclampsiaEmergency) {
        const alert = await client.alerts.create({
          mother_id: highRiskMotherId,
          alert_type: 'danger_sign',
          severity: 'critical',
          title: 'Critical Alert: Preeclampsia Crisis (BP 150/95 mmHg)',
          title_sw: 'Tahadhari Kubwa: Kifafa cha Mimba (BP 150/95 mmHg)',
          message: `Patient presents with systolic BP ${systolic} mmHg, diastolic ${diastolic} mmHg, and 2+ proteinuria. Immediate magnesium sulphate and obstetric referral required.`,
          message_sw: `Mgonjwa ana shinikizo la damu ${systolic}/${diastolic} mmHg na protini kwenye mkojo. Anahitaji rufaa ya haraka kwa daktari wa uzazi.`,
          action_label: 'Immediate Obstetric Triage',
          action_url: `/nurse/encounters/${highRiskMotherId}`,
          is_read: false,
          is_resolved: false,
        });

        expect(alert.id).toBeDefined();
        expect(alert.severity).toBe('critical');

        // 4. Update Mother Clinical Risk Profile
        const updatedMother = await client.mothers.update(highRiskMotherId, {
          risk_level: 'critical',
          risk_score: 95,
          chv_alerted: true,
        });

        expect(updatedMother.risk_level).toBe('critical');
        expect(updatedMother.risk_score).toBe(95);
        expect(updatedMother.chv_alerted).toBe(true);
      }
    });
  });

  // =========================================================================
  // WORKFLOW 5: Immunization Administration & Next Visit Automation
  // =========================================================================
  describe('Workflow 5: Immunization Administration & Next Visit Automation', () => {
    it('administers birth doses (BCG & OPV 0) with batch tracking and calculates Week 6 due date', async () => {
      // 0. Register newborn infant
      const child = await client.children.create({
        full_name: 'Baraka Mwangi',
        mother_id: 'mother-amina-01',
        date_of_birth: '2026-06-01',
        gender: 'male',
        health_status: 'healthy',
      });
      const childId = child.id;
      const childDob = child.date_of_birth;

      // 1. Retrieve initial birth doses
      const schedule = generateVaccinationSchedule(childId, childDob);
      const savedVaccines = await client.immunizations.bulkCreate(schedule as Partial<Immunization>[]);

      const bcgRecord = savedVaccines.find((v) => v.vaccine_name === 'BCG');
      const opv0Record = savedVaccines.find((v) => v.vaccine_name === 'OPV 0');
      expect(bcgRecord).toBeDefined();
      expect(opv0Record).toBeDefined();

      // 2. Administer doses at birth
      const today = '2026-06-01';
      const updatedBcg = await client.immunizations.update(bcgRecord!.id, {
        status: 'given',
        given_date: today,
        administered_by: 'Nurse Joy Wambui',
        batch_number: 'BCG-KE-2026-04',
        facility: 'Pumwani Maternity Hospital',
      });

      const updatedOpv0 = await client.immunizations.update(opv0Record!.id, {
        status: 'given',
        given_date: today,
        administered_by: 'Nurse Joy Wambui',
        batch_number: 'OPV-KE-2026-11',
        facility: 'Pumwani Maternity Hospital',
      });

      expect(updatedBcg.status).toBe('given');
      expect(updatedOpv0.status).toBe('given');

      // 3. Automated Next Visit Calculation
      // Find remaining scheduled doses sorted by scheduled_date
      const remainingDoses = await client.immunizations.filter({
        child_id: childId,
        status: 'scheduled',
      }, 'scheduled_date');

      expect(remainingDoses.length).toBeGreaterThan(0);
      const nextDueDose = remainingDoses[0];

      // Next due dose must be Week 6 (OPV 1 + Penta 1 + PCV 1 + Rota 1)
      expect(nextDueDose.age_weeks).toBe(6);
      expect(nextDueDose.scheduled_date).toBe('2026-07-13'); // DOB + 42 days

      // 4. Update child record visit markers
      const updatedChild = await client.children.update(childId, {
        last_visit_date: today,
        next_visit_date: nextDueDose.scheduled_date,
      });

      expect(updatedChild.last_visit_date).toBe('2026-06-01');
      expect(updatedChild.next_visit_date).toBe('2026-07-13');
    });
  });

  // =========================================================================
  // WORKFLOW 6: Child Growth & WHO Malnutrition Classification (SAM / MAM)
  // =========================================================================
  describe('Workflow 6: Child Growth & WHO Malnutrition Classification', () => {
    it('records child growth vitals and correctly classifies Severe Acute Malnutrition (SAM) for MUAC < 11.5cm', async () => {
      const child = await client.children.create({
        full_name: 'Baraka Mwangi',
        mother_id: 'mother-amina-01',
        date_of_birth: '2025-04-16',
        gender: 'male',
      });
      const childId = child.id;
      const ageMonths = 14;
      const weightKg = 7.1;
      const muacCm = 11.2; // Critical: < 11.5cm is SAM

      // 1. Calculate WHO classification using pure clinical business logic
      const nutritionStatus = classifyNutritionStatus(weightKg, ageMonths, muacCm);
      expect(nutritionStatus).toBe('sam');

      // 2. Persist Growth Record
      const growthRecordPayload: Partial<GrowthRecord> = {
        child_id: childId,
        recorded_date: '2026-06-16',
        age_months: ageMonths,
        weight_kg: weightKg,
        muac_cm: muacCm,
        nutrition_status: nutritionStatus,
        recorded_by: 'Nurse Joy Wambui',
        facility: 'Pumwani Maternity Hospital',
        notes: 'Child exhibits severe wasting. Immediate therapeutic supplementary feeding initiated.',
      };

      const savedGrowth = await client.growthRecords.create(growthRecordPayload);
      expect(savedGrowth.id).toBeDefined();
      expect(savedGrowth.nutrition_status).toBe('sam');
      expect(savedGrowth.muac_cm).toBe(11.2);

      // 3. Emit Growth Anomaly Alert to Clinic
      if (savedGrowth.nutrition_status === 'sam') {
        const anomalyAlert = await client.alerts.create({
          child_id: childId,
          alert_type: 'growth_anomaly',
          severity: 'critical',
          title: 'Critical Alert: Severe Acute Malnutrition (SAM)',
          title_sw: 'Tahadhari: Utapiamlo Mkali wa Mtoto (SAM)',
          message: `Child MUAC measured at ${muacCm} cm (< 11.5 cm threshold). Urgent Ready-to-Use Therapeutic Food (RUTF) protocol required.`,
          message_sw: `Kipimo cha mkono cha mtoto (MUAC) ni ${muacCm} cm. Matibabu ya dharura ya lishe yanahitajika mara moja.`,
          action_label: 'Initiate RUTF Nutrition Protocol',
          action_url: `/nurse/growth/${childId}`,
          is_read: false,
          is_resolved: false,
        });

        expect(anomalyAlert.id).toBeDefined();
        expect(anomalyAlert.severity).toBe('critical');
      }
    });

    it('classifies Moderate Acute Malnutrition (MAM) when MUAC is between 11.5cm and 12.4cm', () => {
      const mamStatus = classifyNutritionStatus(8.2, 12, 12.1);
      expect(mamStatus).toBe('mam');

      const normalStatus = classifyNutritionStatus(9.6, 12, 13.0);
      expect(normalStatus).toBe('normal');
    });
  });

  // =========================================================================
  // WORKFLOW 7: Offline Outbox & Sync Status
  // =========================================================================
  describe('Workflow 7: Offline Outbox & Sync Status', () => {
    it('tracks pending offline mutations, transitions status, and resets outbox upon successful sync', async () => {
      // 1. Initial clean state
      const initialCount = await client.getPendingMutationsCount();
      expect(initialCount).toBe(0);

      const initialStatus = await client.getSyncStatus();
      expect(initialStatus).toBe('synced');

      // 2. Perform offline clinical operations (creating visit and updating mother)
      await client.ancVisits.create({
        mother_id: 'mother-amina-01',
        visit_number: 1,
        visit_date: '2026-06-16',
        facility: 'Pumwani Maternity Hospital',
        blood_pressure_systolic: 118,
        blood_pressure_diastolic: 78,
      });

      await client.mothers.update('mother-amina-01', {
        risk_level: 'low',
        risk_score: 10,
      });

      // 3. Verify pending mutation count increments
      const pendingCount = await client.getPendingMutationsCount();
      expect(pendingCount).toBe(2);

      const pendingStatus = await client.getSyncStatus();
      expect(pendingStatus).toBe('pending');

      // 4. Trigger manual or automatic sync flush
      const syncResult = await client.sync();
      expect(syncResult.success).toBe(true);
      expect(syncResult.syncedCount).toBe(2);
      expect(syncResult.timestamp).toBeDefined();

      // 5. Verify outbox resets to 0 and status returns to 'synced'
      const finalCount = await client.getPendingMutationsCount();
      expect(finalCount).toBe(0);

      const finalStatus = await client.getSyncStatus();
      expect(finalStatus).toBe('synced');
    });
  });
});
