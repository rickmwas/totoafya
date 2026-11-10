import { describe, it, expect } from 'vitest';
import {
  calculateEDDFromLMP,
  calculateGestationalAge,
  estimateTrimesterAndEDD,
  evaluateDangerSigns,
  triageBloodPressure,
  parseISODate,
} from '../anc';
import {
  assessMUACNutrition,
  calculateWeightForAgeZScore,
  calculateHeightForAgeZScore,
  calculateWeightForHeightZScore,
  evaluateChildGrowth,
  classifyNutritionStatus,
} from '../growth';
import {
  calculateKEPISchedule,
  calculateCatchUpDate,
  classifyVaccineDueStatus,
  KEPI_7_VISIT_DEFINITIONS,
} from '../vaccines';

describe('ADVERSARIAL STRESS HARNESS — Clinical Business Logic', () => {
  // =========================================================================
  // 1. Naegele EDD & Gestational Math
  // =========================================================================
  describe('1. Naegele EDD & Gestational Math Adversarial Challenges', () => {
    it('CHALLENGE 1.1: Leap day LMP 2024-02-29 must yield exact EDD 2024-12-05', () => {
      const res = calculateEDDFromLMP('2024-02-29');
      expect(res.edd).toBe('2024-12-05');
      expect(res.source).toBe('lmp_naegele');
    });

    it('CHALLENGE 1.2: Leap year destination calculation (LMP leading to leap day EDD)', () => {
      // 2023-05-25 + 280 days:
      // May: 6 remaining, Jun: 30, Jul: 31, Aug: 31, Sep: 30, Oct: 31, Nov: 30, Dec: 31, Jan 2024: 31, Feb 2024: 29 -> 280 days
      const res = calculateEDDFromLMP('2023-05-25');
      expect(res.edd).toBe('2024-02-29');
    });

    it('CHALLENGE 1.3: Year and month boundary rollovers across diverse calendar positions', () => {
      // End of year rollover
      const r1 = calculateEDDFromLMP('2025-12-31');
      expect(r1.edd).toBe('2026-10-07');

      // Mid-year rollover
      const r2 = calculateEDDFromLMP('2026-11-15');
      expect(r2.edd).toBe('2027-08-22');

      // Leap year to non-leap year rollover (LMP late 2024)
      const r3 = calculateEDDFromLMP('2024-10-01');
      expect(r3.edd).toBe('2025-07-08');

      // Beginning of year
      const r4 = calculateEDDFromLMP('2026-01-01');
      expect(r4.edd).toBe('2026-10-08');
    });

    it('CHALLENGE 1.4: Gestational age clamping (0 to 44 weeks) and post-term detection (>41 weeks)', () => {
      const lmp = '2026-01-01';

      // Future reference date before LMP -> clamped to 0 weeks, not negative
      const futureLmp = calculateEDDFromLMP('2026-06-01', new Date('2026-01-01T00:00:00Z'));
      expect(futureLmp.gestationalWeeks).toBe(0);
      expect(futureLmp.gestationalDays).toBe(0);
      expect(futureLmp.isPostTerm).toBe(false);

      // Same day as LMP -> 0 weeks 0 days
      const sameDay = calculateEDDFromLMP(lmp, new Date('2026-01-01T00:00:00Z'));
      expect(sameDay.gestationalWeeks).toBe(0);
      expect(sameDay.gestationalDays).toBe(0);
      expect(sameDay.isPostTerm).toBe(false);

      // Exactly 40 weeks (280 days) -> EDD day
      const eddDay = calculateEDDFromLMP(lmp, new Date('2026-10-08T00:00:00Z'));
      expect(eddDay.gestationalWeeks).toBe(40);
      expect(eddDay.gestationalDays).toBe(0);
      expect(eddDay.isPostTerm).toBe(false);

      // Exactly 41 weeks 6 days (293 days) -> not post-term (>41w)
      const termLimit = calculateEDDFromLMP(lmp, new Date('2026-10-21T00:00:00Z'));
      expect(termLimit.gestationalWeeks).toBe(41);
      expect(termLimit.gestationalDays).toBe(6);
      expect(termLimit.isPostTerm).toBe(false);

      // Exactly 42 weeks 0 days (294 days) -> post-term flagged
      const postTerm = calculateEDDFromLMP(lmp, new Date('2026-10-22T00:00:00Z'));
      expect(postTerm.gestationalWeeks).toBe(42);
      expect(postTerm.isPostTerm).toBe(true);

      // 44 weeks 0 days -> boundary limit
      const maxTerm = calculateEDDFromLMP(lmp, new Date('2026-11-05T00:00:00Z'));
      expect(maxTerm.gestationalWeeks).toBe(44);
      expect(maxTerm.isPostTerm).toBe(true);

      // 48 weeks (extreme overdue) -> clamped to 44 weeks maximum
      const overTerm = calculateEDDFromLMP(lmp, new Date('2026-12-03T00:00:00Z'));
      expect(overTerm.gestationalWeeks).toBe(44);
      expect(overTerm.isPostTerm).toBe(true);
    });

    it('CHALLENGE 1.5: Malformed and adversarial date inputs reject or parse deterministically', () => {
      expect(() => calculateEDDFromLMP('')).toThrow('Empty date string');
      expect(() => calculateEDDFromLMP('not-a-date')).toThrow('Invalid date format');
      expect(() => calculateEDDFromLMP(new Date(NaN))).toThrow('Invalid Date object');
    });
  });

  // =========================================================================
  // 2. Guided Trimester Estimator
  // =========================================================================
  describe('2. Guided Trimester Estimator Adversarial Challenges', () => {
    const refDate = new Date('2026-06-01T00:00:00Z');

    it('CHALLENGE 2.1: Landmark strings map to exact anatomical gestational definitions', () => {
      const below = estimateTrimesterAndEDD({ landmark: 'below_navel', referenceDate: refDate });
      expect(below.gestationalWeeks).toBe(14);
      expect(below.trimester).toBe(2);
      expect(below.source).toBe('guided_estimate');
      expect(below.clinicalDisclaimer).toContain('Provisional estimate');

      const at = estimateTrimesterAndEDD({ landmark: 'at_navel', referenceDate: refDate });
      expect(at.gestationalWeeks).toBe(20);
      expect(at.trimester).toBe(2);

      const above = estimateTrimesterAndEDD({ landmark: 'above_navel', referenceDate: refDate });
      expect(above.gestationalWeeks).toBe(30);
      expect(above.trimester).toBe(3);
    });

    it('CHALLENGE 2.2: Extreme approximate month inputs (<1 or >9) are strictly clamped', () => {
      // Sub-1 values clamped to 1 month (4.33 -> round 4 weeks)
      const low1 = estimateTrimesterAndEDD({ approximateMonthsAgo: 0, referenceDate: refDate });
      expect(low1.gestationalWeeks).toBe(4);
      expect(low1.trimester).toBe(1);

      const negative = estimateTrimesterAndEDD({ approximateMonthsAgo: -10, referenceDate: refDate });
      expect(negative.gestationalWeeks).toBe(4);
      expect(negative.trimester).toBe(1);

      // Over-9 values clamped to 9 months (9 * 4.33 = 38.97 -> round 39 weeks)
      const high1 = estimateTrimesterAndEDD({ approximateMonthsAgo: 10, referenceDate: refDate });
      expect(high1.gestationalWeeks).toBe(39);
      expect(high1.trimester).toBe(3);

      const extremeHigh = estimateTrimesterAndEDD({ approximateMonthsAgo: 999, referenceDate: refDate });
      expect(extremeHigh.gestationalWeeks).toBe(39);
      expect(extremeHigh.trimester).toBe(3);
    });

    it('CHALLENGE 2.3: Unspecified or invalid landmark inputs safely fallback to 20 weeks default', () => {
      // Empty options
      const empty = estimateTrimesterAndEDD({ referenceDate: refDate });
      expect(empty.gestationalWeeks).toBe(20);
      expect(empty.trimester).toBe(2);

      // Unknown landmark string falls through gracefully to default 20 weeks
      const invalidLandmark = estimateTrimesterAndEDD({
        landmark: 'unknown_anatomical_position' as any,
        referenceDate: refDate,
      });
      expect(invalidLandmark.gestationalWeeks).toBe(20);
      expect(invalidLandmark.trimester).toBe(2);
    });

    it('CHALLENGE 2.4: Always includes clinical disclaimer for guided estimates', () => {
      const res = estimateTrimesterAndEDD({ landmark: 'at_navel' });
      expect(res.clinicalDisclaimer).toBeDefined();
      expect(res.clinicalDisclaimer?.length).toBeGreaterThan(20);
    });

    it('CHALLENGE 2.5: NaN approximateMonthsAgo gracefully falls back to default 20 weeks', () => {
      const res = estimateTrimesterAndEDD({ approximateMonthsAgo: NaN, referenceDate: refDate });
      expect(res.gestationalWeeks).toBe(20);
      expect(res.trimester).toBe(2);
      expect(res.edd).not.toContain('NaN');
      expect(res.edd).toBe('2026-10-19');
    });
  });

  // =========================================================================
  // 3. MUAC Malnutrition Classification
  // =========================================================================
  describe('3. MUAC Malnutrition Classification Adversarial Challenges', () => {
    it('CHALLENGE 3.1: Strict infant age boundary - ages < 6 months MUST throw clinical error', () => {
      // Exact boundary cases < 6 months
      expect(() => assessMUACNutrition(12.0, 5.9)).toThrow(
        'MUAC screening is clinically validated only for infants and children aged 6 months and older'
      );
      expect(() => assessMUACNutrition(11.0, 5.99)).toThrow('aged 6 months and older');
      expect(() => assessMUACNutrition(13.0, 5)).toThrow('aged 6 months and older');
      expect(() => assessMUACNutrition(12.5, 0)).toThrow('aged 6 months and older');
      expect(() => assessMUACNutrition(12.0, -1)).toThrow('aged 6 months and older');
      expect(() => assessMUACNutrition(12.0, NaN)).toThrow('Valid child age in months is required');
    });

    it('CHALLENGE 3.2: Exact boundary at 6.0 months MUST succeed', () => {
      expect(assessMUACNutrition(11.0, 6.0)).toBe('SAM');
      expect(assessMUACNutrition(12.0, 6.0)).toBe('MAM');
      expect(assessMUACNutrition(12.5, 6.0)).toBe('NORMAL');
    });

    it('CHALLENGE 3.3: Strict MUAC threshold classifications for eligible children (>= 6 months)', () => {
      // Red: SAM (< 11.5 cm)
      expect(assessMUACNutrition(5.0, 12)).toBe('SAM');
      expect(assessMUACNutrition(10.0, 18)).toBe('SAM');
      expect(assessMUACNutrition(11.4, 24)).toBe('SAM');
      expect(assessMUACNutrition(11.49, 12)).toBe('SAM');

      // Yellow: MAM (11.5 cm to 12.49 cm)
      expect(assessMUACNutrition(11.5, 12)).toBe('MAM');
      expect(assessMUACNutrition(11.8, 15)).toBe('MAM');
      expect(assessMUACNutrition(12.0, 18)).toBe('MAM');
      expect(assessMUACNutrition(12.4, 24)).toBe('MAM');
      expect(assessMUACNutrition(12.49, 12)).toBe('MAM');

      // Green: NORMAL (>= 12.5 cm)
      expect(assessMUACNutrition(12.5, 12)).toBe('NORMAL');
      expect(assessMUACNutrition(12.51, 12)).toBe('NORMAL');
      expect(assessMUACNutrition(13.5, 36)).toBe('NORMAL');
      expect(assessMUACNutrition(16.0, 48)).toBe('NORMAL');
    });

    it('CHALLENGE 3.4: Invalid or zero MUAC values throw errors', () => {
      expect(() => assessMUACNutrition(0, 12)).toThrow('Valid MUAC measurement');
      expect(() => assessMUACNutrition(-5, 12)).toThrow('Valid MUAC measurement');
      expect(() => assessMUACNutrition(NaN, 12)).toThrow('Valid MUAC measurement');
    });

    it('CHALLENGE 3.5: evaluateChildGrowth respects age constraint and synthesizes SAM/MAM properly', () => {
      // Under 6 months: MUAC is omitted, no error thrown by wrapper
      const infant = evaluateChildGrowth({
        ageMonths: 4,
        gender: 'boy',
        weightKg: 7.0,
        muacCm: 11.0, // Under 6m, should not trigger SAM based on MUAC
      });
      expect(infant.classifications.muacStatus).toBeUndefined();
      expect(infant.nutritionStatus).toBe('NORMAL'); // 7.0kg at 4m is normal

      // 6 months and older: MUAC SAM triggers overall SAM
      const samChild = evaluateChildGrowth({
        ageMonths: 8,
        gender: 'girl',
        weightKg: 8.0, // Normal weight
        muacCm: 11.2, // SAM MUAC
      });
      expect(samChild.classifications.muacStatus).toBe('SAM');
      expect(samChild.nutritionStatus).toBe('SAM');
      expect(samChild.clinicalRecommendationEn).toContain('Severe Acute Malnutrition');
    });
  });

  // =========================================================================
  // 4. Blood Pressure Triage & Plausibility
  // =========================================================================
  describe('4. Blood Pressure Triage & Plausibility Adversarial Challenges', () => {
    it('CHALLENGE 4.1: Inverted readings (Systolic <= Diastolic) must be rejected as INVALID', () => {
      // Equal readings
      const equal1 = triageBloodPressure(120, 120);
      expect(equal1.isValid).toBe(false);
      expect(equal1.category).toBe('INVALID_READING');
      expect(equal1.validationError).toContain('strictly greater than diastolic');

      const equal2 = triageBloodPressure(80, 80);
      expect(equal2.isValid).toBe(false);

      // Inverted readings
      const inv1 = triageBloodPressure(80, 120);
      expect(inv1.isValid).toBe(false);
      expect(inv1.category).toBe('INVALID_READING');

      const inv2 = triageBloodPressure(70, 110);
      expect(inv2.isValid).toBe(false);
    });

    it('CHALLENGE 4.2: Out-of-bounds readings reject physiological extremes', () => {
      // Systolic > 300
      const sys400 = triageBloodPressure(400, 80);
      expect(sys400.isValid).toBe(false);
      expect(sys400.category).toBe('INVALID_READING');
      expect(sys400.validationError).toContain('outside plausible physiological bounds');

      // Systolic < 50
      const sys40 = triageBloodPressure(40, 35);
      expect(sys40.isValid).toBe(false);
      expect(sys40.category).toBe('INVALID_READING');

      // Diastolic < 30
      const dia10 = triageBloodPressure(120, 10);
      expect(dia10.isValid).toBe(false);
      expect(dia10.category).toBe('INVALID_READING');

      // Diastolic > 200
      const dia210 = triageBloodPressure(250, 210);
      expect(dia210.isValid).toBe(false);
      expect(dia210.category).toBe('INVALID_READING');

      // NaN or Non-numbers
      expect(triageBloodPressure(NaN, 80).isValid).toBe(false);
      expect(triageBloodPressure(120, NaN).isValid).toBe(false);
      expect(triageBloodPressure('120' as any, 80).isValid).toBe(false);
    });

    it('CHALLENGE 4.3: Pre-eclampsia boundary check - 139/89 vs 140/90', () => {
      // 139/89 -> STAGE_1_HYPERTENSION (Not pre-eclampsia)
      const nonPreeclamp = triageBloodPressure(139, 89);
      expect(nonPreeclamp.isValid).toBe(true);
      expect(nonPreeclamp.category).toBe('STAGE_1_HYPERTENSION');
      expect(nonPreeclamp.isEmergency).toBe(false);
      expect(nonPreeclamp.alertRequired).toBe(false);

      // 140/85 -> Systolic hits 140 -> PRE_ECLAMPSIA_SUSPECTED
      const pre1 = triageBloodPressure(140, 85);
      expect(pre1.isValid).toBe(true);
      expect(pre1.category).toBe('PRE_ECLAMPSIA_SUSPECTED');
      expect(pre1.isEmergency).toBe(true);
      expect(pre1.alertRequired).toBe(true);

      // 135/90 -> Diastolic hits 90 -> PRE_ECLAMPSIA_SUSPECTED
      const pre2 = triageBloodPressure(135, 90);
      expect(pre2.isValid).toBe(true);
      expect(pre2.category).toBe('PRE_ECLAMPSIA_SUSPECTED');
      expect(pre2.isEmergency).toBe(true);
      expect(pre2.alertRequired).toBe(true);

      // 140/90 -> Both hit threshold -> PRE_ECLAMPSIA_SUSPECTED
      const pre3 = triageBloodPressure(140, 90);
      expect(pre3.isValid).toBe(true);
      expect(pre3.category).toBe('PRE_ECLAMPSIA_SUSPECTED');
      expect(pre3.isEmergency).toBe(true);
      expect(pre3.alertRequired).toBe(true);
    });

    it('CHALLENGE 4.4: Severe Hypertensive Emergency (>=160/110 mmHg)', () => {
      // 160/100 -> Systolic hits 160
      const sev1 = triageBloodPressure(160, 100);
      expect(sev1.category).toBe('SEVERE_HYPERTENSION_EMERGENCY');
      expect(sev1.isEmergency).toBe(true);

      // 150/110 -> Diastolic hits 110
      const sev2 = triageBloodPressure(150, 110);
      expect(sev2.category).toBe('SEVERE_HYPERTENSION_EMERGENCY');
      expect(sev2.isEmergency).toBe(true);

      // 160/110 -> Both hit threshold
      const sev3 = triageBloodPressure(160, 110);
      expect(sev3.category).toBe('SEVERE_HYPERTENSION_EMERGENCY');
      expect(sev3.isEmergency).toBe(true);
      expect(sev3.clinicalAlert).toContain('Severe hypertension');
    });
  });

  // =========================================================================
  // 5. Danger Signs Interception
  // =========================================================================
  describe('5. Danger Signs Interception Adversarial Challenges', () => {
    it('CHALLENGE 5.1: Swahili sentence text matches critical red flags and fails closed', () => {
      // Exact test case: "Mama anatokwa na damu nyingi sana"
      const r1 = evaluateDangerSigns('Mama anatokwa na damu nyingi sana');
      expect(r1.isEmergency).toBe(true);
      expect(r1.action).toBe('emergency_triage');
      expect(r1.redFlags.some(f => f.includes('Vaginal Bleeding') || f.includes('Damu'))).toBe(true);

      // Kifafa / fits
      const r2 = evaluateDangerSigns('Ana kifafa cha mimba na degedege kali sana');
      expect(r2.isEmergency).toBe(true);
      expect(r2.action).toBe('emergency_triage');
      expect(r2.redFlags.some(f => f.includes('Convulsions') || f.includes('Kifafa'))).toBe(true);

      // Reduced fetal movement
      const r3 = evaluateDangerSigns('Mtoto haisikiki kabisa tangu jana');
      expect(r3.isEmergency).toBe(true);
      expect(r3.redFlags.some(f => f.includes('Fetal Movement') || f.includes('Haisikiki'))).toBe(true);

      // Leaking fluid
      const r4 = evaluateDangerSigns('Maji kuvunjika ghafla asubuhi hii');
      expect(r4.isEmergency).toBe(true);
      expect(r4.redFlags.some(f => f.includes('Leaking Fluid') || f.includes('Maji'))).toBe(true);
    });

    it('CHALLENGE 5.2: English sentence text matches critical red flags and fails closed', () => {
      // Exact test case: "blurred vision and high fever"
      const r1 = evaluateDangerSigns('blurred vision and high fever');
      expect(r1.isEmergency).toBe(true);
      expect(r1.action).toBe('emergency_triage');
      expect(r1.redFlags.some(f => f.includes('Blurred Vision'))).toBe(true);
      expect(r1.redFlags.some(f => f.includes('High Fever'))).toBe(true);

      // Baby stops moving
      const r2 = evaluateDangerSigns('The baby stops moving completely');
      expect(r2.isEmergency).toBe(true);
      expect(r2.redFlags.some(f => f.includes('Fetal Movement'))).toBe(true);

      // Severe chest pain
      const r3 = evaluateDangerSigns('experiencing severe chest pain and difficulty breathing');
      expect(r3.isEmergency).toBe(true);
      expect(r3.redFlags.length).toBeGreaterThanOrEqual(2);
    });

    it('CHALLENGE 5.3: Mixed Swahili & English in single sentence', () => {
      const mixed1 = evaluateDangerSigns('I have severe headache na macho kutoona vizuri');
      expect(mixed1.isEmergency).toBe(true);
      expect(mixed1.action).toBe('emergency_triage');
      expect(mixed1.redFlags.some(f => f.includes('Headache'))).toBe(true);
      expect(mixed1.redFlags.some(f => f.includes('Blurred Vision'))).toBe(true);

      // Using infinitive 'kuzirai' matches the current regex
      const mixed2 = evaluateDangerSigns('Mama kuzirai and having vaginal bleeding');
      expect(mixed2.isEmergency).toBe(true);
      expect(mixed2.action).toBe('emergency_triage');
      expect(mixed2.redFlags.some(f => f.includes('Loss of Consciousness'))).toBe(true);
      expect(mixed2.redFlags.some(f => f.includes('Bleeding'))).toBe(true);
    });

    it('BUG DISCOVERY 5.6: Swahili agglutinative verb conjugations (inflected forms vs infinitive ku-)', () => {
      // In Swahili, mothers in emergency state report inflected verbs:
      // "amezirai" (she has fainted), "amepoteza fahamu" (she has lost consciousness),
      // "yamevunjika" (water has broken), "anapumua kwa shida" (breathing with difficulty),
      // "amevimba uso" (face is swollen).
      //
      // With the expanded regex patterns accommodating natural verbal prefixes,
      // all these clinical emergency phrases must evaluate to isEmergency: true and action: 'emergency_triage'.

      const ameziraiRes = evaluateDangerSigns('Mama amezirai');
      expect(ameziraiRes.isEmergency).toBe(true);
      expect(ameziraiRes.action).toBe('emergency_triage');
      expect(ameziraiRes.redFlags.some(f => f.includes('Loss of Consciousness'))).toBe(true);

      const amepotezaRes = evaluateDangerSigns('Mama amepoteza fahamu');
      expect(amepotezaRes.isEmergency).toBe(true);
      expect(amepotezaRes.action).toBe('emergency_triage');
      expect(amepotezaRes.redFlags.some(f => f.includes('Loss of Consciousness'))).toBe(true);

      const majiYamevunjikaRes = evaluateDangerSigns('Maji yamevunjika');
      expect(majiYamevunjikaRes.isEmergency).toBe(true);
      expect(majiYamevunjikaRes.action).toBe('emergency_triage');
      expect(majiYamevunjikaRes.redFlags.some(f => f.includes('Leaking Fluid'))).toBe(true);

      const anapumuaRes = evaluateDangerSigns('Mama anapumua kwa shida');
      expect(anapumuaRes.isEmergency).toBe(true);
      expect(anapumuaRes.action).toBe('emergency_triage');
      expect(anapumuaRes.redFlags.some(f => f.includes('Difficulty Breathing'))).toBe(true);

      const amevimbaRes = evaluateDangerSigns('Amevimba uso');
      expect(amevimbaRes.isEmergency).toBe(true);
      expect(amevimbaRes.action).toBe('emergency_triage');
      expect(amevimbaRes.redFlags.some(f => f.includes('Facial/Hand Swelling'))).toBe(true);
    });

    it('CHALLENGE 5.4: Benign non-emergency messages pass as routine care without false alarm', () => {
      const benign1 = evaluateDangerSigns('I am eating well and feeling energetic today');
      expect(benign1.isEmergency).toBe(false);
      expect(benign1.action).toBe('routine_care');
      expect(benign1.redFlags).toHaveLength(0);

      const benign2 = evaluateDangerSigns('Mtoto anacheza vizuri sana tumboni');
      expect(benign2.isEmergency).toBe(false);
      expect(benign2.action).toBe('routine_care');
      expect(benign2.redFlags).toHaveLength(0);
    });

    it('CHALLENGE 5.5: Interception is 100% deterministic, synchronous, zero-LLM', () => {
      const start = Date.now();
      for (let i = 0; i < 500; i++) {
        evaluateDangerSigns('Mama anatokwa na damu nyingi sana');
      }
      const duration = Date.now() - start;
      // 500 evaluations must complete in < 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  // =========================================================================
  // 6. KEPI Vaccine Cascade
  // =========================================================================
  describe('6. KEPI Vaccine Cascade Adversarial Challenges', () => {
    it('CHALLENGE 6.1: Generates exactly 7 visits with exactly 19 antigens deterministically', () => {
      const schedule = calculateKEPISchedule('2026-03-01', 'adversarial-child-1');

      expect(schedule.visits).toHaveLength(7);
      expect(schedule.totalDoses).toBe(19);

      // Verify all visit numbers 1 to 7
      schedule.visits.forEach((v, idx) => {
        expect(v.visitNumber).toBe((idx + 1) as any);
        expect(v.scheduledDate).toBeDefined();
        expect(v.vaccines.length).toBeGreaterThan(0);
      });

      // Antigen breakdown count
      const visitDoseCounts = schedule.visits.map(v => v.vaccines.length);
      expect(visitDoseCounts).toEqual([2, 4, 4, 4, 1, 2, 2]);
      expect(visitDoseCounts.reduce((a, b) => a + b, 0)).toBe(19);
    });

    it('CHALLENGE 6.2: Complete antigen roster matches Kenya MoH KEPI specifications', () => {
      const schedule = calculateKEPISchedule('2026-01-01');

      // V1: Birth (0w) -> BCG, OPV 0
      expect(schedule.visits[0].targetAgeWeeks).toBe(0);
      expect(schedule.visits[0].vaccines.map(v => v.antigen)).toEqual(['BCG', 'OPV 0']);

      // V2: 6 Weeks -> OPV 1, Pentavalent 1, PCV 1, Rotavirus 1
      expect(schedule.visits[1].targetAgeWeeks).toBe(6);
      expect(schedule.visits[1].vaccines.map(v => v.antigen)).toEqual([
        'OPV 1',
        'Pentavalent 1 (DTP-HepB-Hib 1)',
        'PCV 1',
        'Rotavirus 1',
      ]);

      // V3: 10 Weeks -> OPV 2, Pentavalent 2, PCV 2, Rotavirus 2
      expect(schedule.visits[2].targetAgeWeeks).toBe(10);
      expect(schedule.visits[2].vaccines.map(v => v.antigen)).toEqual([
        'OPV 2',
        'Pentavalent 2 (DTP-HepB-Hib 2)',
        'PCV 2',
        'Rotavirus 2',
      ]);

      // V4: 14 Weeks -> OPV 3, Pentavalent 3, PCV 3, IPV 1
      expect(schedule.visits[3].targetAgeWeeks).toBe(14);
      expect(schedule.visits[3].vaccines.map(v => v.antigen)).toEqual([
        'OPV 3',
        'Pentavalent 3 (DTP-HepB-Hib 3)',
        'PCV 3',
        'IPV 1',
      ]);

      // V5: 6 Months (26w) -> Vitamin A Capsule 1
      expect(schedule.visits[4].targetAgeWeeks).toBe(26);
      expect(schedule.visits[4].vaccines[0].antigen).toContain('Vitamin A Capsule 1');

      // V6: 9 Months (39w) -> MR 1, Yellow Fever
      expect(schedule.visits[5].targetAgeWeeks).toBe(39);
      expect(schedule.visits[5].vaccines.map(v => v.antigen)).toEqual([
        'Measles-Rubella 1 (MR 1)',
        'Yellow Fever',
      ]);

      // V7: 18 Months (78w) -> MR 2 Booster, Vitamin A Capsule 3
      expect(schedule.visits[6].targetAgeWeeks).toBe(78);
      expect(schedule.visits[6].vaccines.map(v => v.antigen)).toEqual([
        'Measles-Rubella 2 (MR 2 Booster)',
        'Vitamin A Capsule 3 (200,000 IU)',
      ]);
    });

    it('CHALLENGE 6.3: Leap day DOB 2024-02-29 schedule dates are exact and consistent', () => {
      const schedule = calculateKEPISchedule('2024-02-29');

      // V1: Birth -> 2024-02-29
      expect(schedule.visits[0].scheduledDate).toBe('2024-02-29');

      // V2: 6 weeks (42 days) -> 2024-04-11
      // Feb 2024 has 29 days. 42 days from Feb 29: March has 31 days -> 42 - 31 = 11 April!
      expect(schedule.visits[1].scheduledDate).toBe('2024-04-11');

      // V3: 10 weeks (70 days) -> 2024-05-09
      expect(schedule.visits[2].scheduledDate).toBe('2024-05-09');

      // V4: 14 weeks (98 days) -> 2024-06-06
      expect(schedule.visits[3].scheduledDate).toBe('2024-06-06');
    });

    it('CHALLENGE 6.4: Catch-up calculation maintains strict minimum 4-week interval (28 days)', () => {
      // 4-week default interval
      const d1 = calculateCatchUpDate('2026-03-01');
      expect(d1).toBe('2026-03-29'); // 2026-03-01 + 28 days

      // Spanning leap year February 2024
      const d2 = calculateCatchUpDate('2024-02-01');
      expect(d2).toBe('2024-02-29'); // 28 days in leap year

      // Spanning year-end rollover
      const d3 = calculateCatchUpDate('2026-12-15');
      expect(d3).toBe('2027-01-12'); // 2026-12-15 + 28 days
    });

    it('CHALLENGE 6.5: Vaccine due status classification enforces non-punitive Savannah Ochre catch-up badge', () => {
      const refDate = new Date('2026-06-01T00:00:00Z');

      // > 14 days in future -> upcoming
      expect(classifyVaccineDueStatus('2026-06-20', refDate)).toBe('upcoming');

      // Within +/- 14 days window -> due
      expect(classifyVaccineDueStatus('2026-06-05', refDate)).toBe('due');
      expect(classifyVaccineDueStatus('2026-05-20', refDate)).toBe('due');

      // > 14 days overdue -> catch_up_due (Dignity guarantee)
      expect(classifyVaccineDueStatus('2026-05-01', refDate)).toBe('catch_up_due');
      expect(classifyVaccineDueStatus('2026-01-01', refDate)).toBe('catch_up_due');
    });
  });
});
