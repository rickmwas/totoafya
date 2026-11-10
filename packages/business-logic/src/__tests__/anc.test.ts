import { describe, it, expect } from 'vitest';
import {
  calculateEDDFromLMP,
  calculateGestationalAge,
  calculateGestationalAgeInWeeks,
  calculateEdd,
  estimateTrimesterAndEDD,
  evaluateDangerSigns,
  triageBloodPressure,
  evaluateKickCountSession,
  parseISODate,
  formatISODate,
  DANGER_SIGNS_EN,
  DANGER_SIGNS_SW,
} from '../anc';

describe('ANC & Maternal Clinical Business Logic', () => {
  describe('Date parsing & formatting utilities', () => {
    it('parses valid Date instances and ISO strings', () => {
      const d1 = parseISODate('2026-03-15');
      expect(d1.getUTCFullYear()).toBe(2026);
      expect(d1.getUTCMonth()).toBe(2);
      expect(d1.getUTCDate()).toBe(15);

      const d2 = parseISODate(new Date('2026-05-20T00:00:00Z'));
      expect(d2.getUTCFullYear()).toBe(2026);
      expect(d2.getUTCMonth()).toBe(4);
      expect(d2.getUTCDate()).toBe(20);

      const d3 = parseISODate('May 20, 2026');
      expect(d3.getUTCFullYear()).toBe(2026);
    });

    it('throws errors on invalid date inputs', () => {
      expect(() => parseISODate(new Date(NaN))).toThrow('Invalid Date object provided');
      expect(() => parseISODate('')).toThrow('Empty date string provided');
      expect(() => parseISODate('not-a-valid-date')).toThrow('Invalid date format provided');
      expect(() => parseISODate(12345 as any)).toThrow('Invalid date format provided');
      // Day rollover (e.g. Feb 31) falls through to standard Date parser
      const parsed = parseISODate('2025-02-31');
      expect(parsed.getUTCMonth()).toBe(2); // March
    });

    it('formats dates into ISO YYYY-MM-DD correctly', () => {
      const d = new Date(Date.UTC(2026, 0, 5));
      expect(formatISODate(d)).toBe('2026-01-05');
    });
  });

  describe("Naegele's Rule EDD Calculation", () => {
    it('calculates EDD for non-leap year (LMP + 280 days)', () => {
      // 2025 is not a leap year. 2025-01-01 + 280 days = 2025-10-08
      const res = calculateEDDFromLMP('2025-01-01', new Date('2025-04-01T00:00:00Z'));
      expect(res.edd).toBe('2025-10-08');
      expect(res.source).toBe('lmp_naegele');
      expect(res.trimester).toBe(1); // 90 days = 12 weeks 6 days -> Trimester 1
      expect(res.gestationalWeeks).toBe(12);
      expect(res.gestationalDays).toBe(6);
    });

    it('calculates EDD correctly spanning leap year (2024)', () => {
      // 2024 is a leap year (Feb 29). 2024-01-01 + 280 days = 2024-10-07
      const res = calculateEDDFromLMP('2024-01-01');
      expect(res.edd).toBe('2024-10-07');
    });

    it('handles year rollover for mid-year LMP', () => {
      // LMP: 2026-07-15 -> EDD: 2027-04-21
      const res = calculateEDDFromLMP('2026-07-15');
      expect(res.edd).toBe('2027-04-21');
    });

    it('assigns correct trimesters across gestational timeline', () => {
      const lmp = '2026-01-01';

      // Week 10 -> Trimester 1
      const t1 = calculateEDDFromLMP(lmp, new Date('2026-03-12T00:00:00Z'));
      expect(t1.trimester).toBe(1);

      // Week 20 -> Trimester 2
      const t2 = calculateEDDFromLMP(lmp, new Date('2026-05-21T00:00:00Z'));
      expect(t2.trimester).toBe(2);

      // Week 32 -> Trimester 3
      const t3 = calculateEDDFromLMP(lmp, new Date('2026-08-13T00:00:00Z'));
      expect(t3.trimester).toBe(3);
      expect(t3.isPostTerm).toBe(false);

      // Week 42 -> Trimester 3, post-term flagged
      const postTerm = calculateEDDFromLMP(lmp, new Date('2026-10-22T00:00:00Z'));
      expect(postTerm.trimester).toBe(3);
      expect(postTerm.isPostTerm).toBe(true);

      // Gestational week bounded to max 44
      const late = calculateEDDFromLMP(lmp, new Date('2026-12-01T00:00:00Z'));
      expect(late.gestationalWeeks).toBe(44);
    });

    it('handles future LMP dates safely', () => {
      const res = calculateEDDFromLMP('2026-10-01', new Date('2026-01-01T00:00:00Z'));
      expect(res.gestationalWeeks).toBe(0);
      expect(res.gestationalDays).toBe(0);
      expect(res.trimester).toBe(1);
    });
  });

  describe('Backwards Compatibility Functions', () => {
    it('calculateGestationalAge calculates weeks between dates', () => {
      const lmp = new Date('2026-01-01T00:00:00Z');
      const ref = new Date('2026-03-12T00:00:00Z'); // 70 days = 10 weeks
      expect(calculateGestationalAge(ref, lmp)).toBe(10);
      expect(calculateGestationalAge(new Date('2025-01-01'), lmp)).toBe(0);
      // Handles invalid dates safely returning 0
      expect(calculateGestationalAge(new Date(NaN), lmp)).toBe(0);
    });

    it('calculateGestationalAgeInWeeks works with string LMP', () => {
      const ref = new Date('2026-03-01T00:00:00Z');
      expect(calculateGestationalAgeInWeeks('2026-02-01', ref)).toBe(4);
      expect(calculateGestationalAgeInWeeks('invalid-date')).toBe(0);
      expect(calculateGestationalAgeInWeeks('2026-04-01', ref)).toBe(0);
    });

    it('calculateEdd returns ISO string or empty string on error', () => {
      expect(calculateEdd('2026-01-01')).toBe('2026-10-08');
      expect(calculateEdd('invalid-lmp')).toBe('');
    });
  });

  describe('Guided Trimester Estimator', () => {
    const ref = new Date('2026-06-01T00:00:00Z');

    it('estimates weeks and EDD from "below_navel" (<20w) landmark', () => {
      const res = estimateTrimesterAndEDD({ landmark: 'below_navel', referenceDate: ref });
      expect(res.gestationalWeeks).toBe(14);
      expect(res.trimester).toBe(2);
      expect(res.source).toBe('guided_estimate');
      expect(res.clinicalDisclaimer).toContain('Provisional estimate based on fundal height');
      // 40 - 14 = 26 weeks remaining. 2026-06-01 + 26*7 = 182 days = 2026-11-30
      expect(res.edd).toBe('2026-11-30');
    });

    it('estimates weeks and EDD from "at_navel" (~20w) landmark', () => {
      const res = estimateTrimesterAndEDD({ landmark: 'at_navel', referenceDate: ref });
      expect(res.gestationalWeeks).toBe(20);
      expect(res.trimester).toBe(2);
      // 40 - 20 = 20 weeks remaining = 140 days = 2026-10-19
      expect(res.edd).toBe('2026-10-19');
    });

    it('estimates weeks and EDD from "above_navel" (>20w) landmark', () => {
      const res = estimateTrimesterAndEDD({ landmark: 'above_navel', referenceDate: ref });
      expect(res.gestationalWeeks).toBe(30);
      expect(res.trimester).toBe(3);
      // 40 - 30 = 10 weeks remaining = 70 days = 2026-08-10
      expect(res.edd).toBe('2026-08-10');
    });

    it('estimates gestational age from approximate months ago', () => {
      const m2 = estimateTrimesterAndEDD({ approximateMonthsAgo: 2, referenceDate: ref });
      expect(m2.gestationalWeeks).toBe(9);
      expect(m2.trimester).toBe(1);

      const m6 = estimateTrimesterAndEDD({ approximateMonthsAgo: 6, referenceDate: ref });
      expect(m6.gestationalWeeks).toBe(26);
      expect(m6.trimester).toBe(2);

      const m8 = estimateTrimesterAndEDD({ approximateMonthsAgo: 8, referenceDate: ref });
      expect(m8.gestationalWeeks).toBe(35);
      expect(m8.trimester).toBe(3);
    });

    it('clamps approximate months between 1 and 9 months', () => {
      const low = estimateTrimesterAndEDD({ approximateMonthsAgo: 0, referenceDate: ref });
      expect(low.gestationalWeeks).toBe(4);

      const high = estimateTrimesterAndEDD({ approximateMonthsAgo: 12, referenceDate: ref });
      expect(high.gestationalWeeks).toBe(39);
    });

    it('falls back to default 20 weeks if no landmark or months provided', () => {
      const def = estimateTrimesterAndEDD({ referenceDate: ref });
      expect(def.gestationalWeeks).toBe(20);
      expect(def.trimester).toBe(2);

      // Tests default referenceDate when none is provided
      const defNoRef = estimateTrimesterAndEDD({ landmark: 'at_navel' });
      expect(defNoRef.gestationalWeeks).toBe(20);
      expect(defNoRef.source).toBe('guided_estimate');
    });
  });

  describe('Danger Signs Emergency Sniffer (Swahili & English)', () => {
    it('detects English emergency danger signs', () => {
      const r1 = evaluateDangerSigns('I have severe headache and blurred vision since morning');
      expect(r1.isEmergency).toBe(true);
      expect(r1.action).toBe('emergency_triage');
      expect(r1.redFlags).toContain('Severe Headache (Kuumwa na Kichwa Sana)');
      expect(r1.redFlags).toContain('Blurred Vision (Kutoona Vizuri)');

      const r2 = evaluateDangerSigns(['vaginal bleeding', 'convulsions']);
      expect(r2.isEmergency).toBe(true);
      expect(r2.redFlags).toHaveLength(2);

      const r3 = evaluateDangerSigns('baby stops moving');
      expect(r3.isEmergency).toBe(true);
      expect(r3.redFlags[0]).toContain('Reduced/Absent Fetal Movement');

      const r4 = evaluateDangerSigns('severe chest pain and shortness of breath');
      expect(r4.isEmergency).toBe(true);
      expect(r4.redFlags).toHaveLength(2);
    });

    it('detects Swahili emergency danger signs', () => {
      const s1 = evaluateDangerSigns('Nina kutokwa na damu nyingi');
      expect(s1.isEmergency).toBe(true);
      expect(s1.redFlags[0]).toContain('Vaginal Bleeding');

      const s2 = evaluateDangerSigns('Mama ana kifafa cha mimba na degedege');
      expect(s2.isEmergency).toBe(true);
      expect(s2.redFlags[0]).toContain('Convulsions / Fits');

      const s3 = evaluateDangerSigns('Mtoto haisikiki na kuacha kucheza');
      expect(s3.isEmergency).toBe(true);
      expect(s3.redFlags[0]).toContain('Reduced/Absent Fetal Movement');

      const s4 = evaluateDangerSigns('Maji kuvunjika kabla ya wakati');
      expect(s4.isEmergency).toBe(true);
      expect(s4.redFlags[0]).toContain('Leaking Fluid');

      const s5 = evaluateDangerSigns('Kuvimba uso na mikono');
      expect(s5.isEmergency).toBe(true);
      expect(s5.redFlags[0]).toContain('Facial/Hand Swelling');

      const s6 = evaluateDangerSigns('Mama amezirai na kupoteza fahamu');
      expect(s6.isEmergency).toBe(true);
      expect(s6.redFlags[0]).toContain('Loss of Consciousness');
    });

    it('returns routine care when no danger signs detected', () => {
      const normal = evaluateDangerSigns('I feel a bit tired today but feeling happy');
      expect(normal.isEmergency).toBe(false);
      expect(normal.action).toBe('routine_care');
      expect(normal.redFlags).toHaveLength(0);
      expect(normal.recommendationEn).toContain('Continue routine antenatal care');
    });

    it('exposes standard danger signs lists', () => {
      expect(DANGER_SIGNS_EN.length).toBeGreaterThanOrEqual(8);
      expect(DANGER_SIGNS_SW.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Blood Pressure Triage & Plausibility Validation', () => {
    it('validates plausibility constraints and rejects invalid inputs', () => {
      // Non-numeric or NaN
      const nanRes = triageBloodPressure(NaN, 80);
      expect(nanRes.isValid).toBe(false);
      expect(nanRes.category).toBe('INVALID_READING');

      // Systolic <= Diastolic
      const inverted = triageBloodPressure(80, 120);
      expect(inverted.isValid).toBe(false);
      expect(inverted.validationError).toContain('strictly greater than diastolic');

      const equal = triageBloodPressure(100, 100);
      expect(equal.isValid).toBe(false);

      // Out of bounds
      const lowSys = triageBloodPressure(40, 35);
      expect(lowSys.isValid).toBe(false);
      expect(lowSys.validationError).toContain('bounds (50-300 mmHg)');

      const highSys = triageBloodPressure(310, 90);
      expect(highSys.isValid).toBe(false);

      const lowDia = triageBloodPressure(110, 20);
      expect(lowDia.isValid).toBe(false);
      expect(lowDia.validationError).toContain('bounds (30-200 mmHg)');

      const highDia = triageBloodPressure(250, 210);
      expect(highDia.isValid).toBe(false);
    });

    it('flags SEVERE_HYPERTENSION_EMERGENCY when Systolic >= 160 or Diastolic >= 110', () => {
      const r1 = triageBloodPressure(165, 105);
      expect(r1.isValid).toBe(true);
      expect(r1.category).toBe('SEVERE_HYPERTENSION_EMERGENCY');
      expect(r1.isEmergency).toBe(true);
      expect(r1.alertRequired).toBe(true);
      expect(r1.clinicalAlert).toContain('Severe hypertension');

      const r2 = triageBloodPressure(155, 112);
      expect(r2.category).toBe('SEVERE_HYPERTENSION_EMERGENCY');
      expect(r2.isEmergency).toBe(true);
    });

    it('flags PRE_ECLAMPSIA_SUSPECTED when Systolic >= 140 or Diastolic >= 90', () => {
      const r1 = triageBloodPressure(140, 85);
      expect(r1.isValid).toBe(true);
      expect(r1.category).toBe('PRE_ECLAMPSIA_SUSPECTED');
      expect(r1.isEmergency).toBe(true);
      expect(r1.alertRequired).toBe(true);

      const r2 = triageBloodPressure(130, 92);
      expect(r2.isValid).toBe(true);
      expect(r2.category).toBe('PRE_ECLAMPSIA_SUSPECTED');
      expect(r2.isEmergency).toBe(true);
    });

    it('classifies STAGE_1_HYPERTENSION (130-139 / 85-89)', () => {
      const r1 = triageBloodPressure(135, 82);
      expect(r1.category).toBe('STAGE_1_HYPERTENSION');
      expect(r1.isEmergency).toBe(false);
      expect(r1.alertRequired).toBe(false);

      const r2 = triageBloodPressure(125, 86);
      expect(r2.category).toBe('STAGE_1_HYPERTENSION');
    });

    it('classifies ELEVATED (120-129 / <80)', () => {
      const r = triageBloodPressure(125, 75);
      expect(r.category).toBe('ELEVATED');
      expect(r.isEmergency).toBe(false);
      expect(r.alertRequired).toBe(false);
    });

    it('classifies NORMAL (<120 / <80)', () => {
      const r = triageBloodPressure(110, 70);
      expect(r.category).toBe('NORMAL');
      expect(r.isEmergency).toBe(false);
      expect(r.alertRequired).toBe(false);
    });
  });

  describe('Fetal Kick Count Evaluation (10-kick / 2h protocol)', () => {
    const baseTime = 1773000000000; // Reference timestamp in ms

    it('evaluates in-progress session with fewer than target kicks within window', () => {
      const kicks = [baseTime + 5 * 60000, baseTime + 12 * 60000, baseTime + 25 * 60000];
      const result = evaluateKickCountSession({
        kickTimestamps: kicks,
        sessionStartTime: baseTime,
        currentTime: baseTime + 30 * 60000,
        windowMinutes: 120,
        targetKicks: 10,
      });

      expect(result.count).toBe(3);
      expect(result.isComplete).toBe(false);
      expect(result.elapsedMinutes).toBe(30);
      expect(result.alertTriggered).toBe(false);
      expect(result.action).toBe('continue_monitoring');
      expect(result.messageEn).toContain('3 of 10 kicks recorded');
    });

    it('evaluates complete session reaching 10 kicks within window (reassurance)', () => {
      const kicks: number[] = [];
      for (let i = 1; i <= 10; i++) {
        kicks.push(baseTime + i * 4 * 60000); // 10 kicks over 40 minutes
      }

      const result = evaluateKickCountSession({
        kickTimestamps: kicks,
        sessionStartTime: baseTime,
        windowMinutes: 120,
        targetKicks: 10,
      });

      expect(result.count).toBe(10);
      expect(result.isComplete).toBe(true);
      expect(result.elapsedMinutes).toBe(40);
      expect(result.alertTriggered).toBe(false);
      expect(result.action).toBe('reassurance');
      expect(result.messageEn).toContain('Reassurance: 10 kicks reached');
      expect(result.messageSw).toContain('Uthibitisho: Mateke 10 yamefikiwa');
    });

    it('triggers emergency alert if 120 minutes elapse with fewer than 10 kicks', () => {
      const kicks = [baseTime + 10 * 60000, baseTime + 40 * 60000, baseTime + 70 * 60000];
      const result = evaluateKickCountSession({
        kickTimestamps: kicks,
        sessionStartTime: baseTime,
        currentTime: baseTime + 125 * 60000, // 125 minutes elapsed
        windowMinutes: 120,
        targetKicks: 10,
      });

      expect(result.count).toBe(3);
      expect(result.isComplete).toBe(false);
      expect(result.elapsedMinutes).toBe(125);
      expect(result.alertTriggered).toBe(true);
      expect(result.action).toBe('emergency_triage');
      expect(result.messageEn).toContain('Movement alert: Only 3 of 10 kicks');
      expect(result.messageSw).toContain('Tahadhari ya mtoto');
    });

    it('handles empty kick session and parses Date/ISO string timestamps', () => {
      const emptyResult = evaluateKickCountSession({
        kickTimestamps: [],
        windowMinutes: 120,
      });
      expect(emptyResult.count).toBe(0);
      expect(emptyResult.isComplete).toBe(false);
      expect(emptyResult.action).toBe('continue_monitoring');

      const dateKicks = [
        new Date('2026-03-10T10:00:00Z'),
        new Date('2026-03-10T10:15:00Z').toISOString(),
      ];
      const parsedResult = evaluateKickCountSession({
        kickTimestamps: dateKicks,
        sessionStartTime: new Date('2026-03-10T09:50:00Z'),
        currentTime: new Date('2026-03-10T10:20:00Z'),
      });
      expect(parsedResult.count).toBe(2);
      expect(parsedResult.elapsedMinutes).toBe(30);
    });
  });
});

