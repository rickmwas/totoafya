import { describe, it, expect } from 'vitest';
import {
  calculateKEPISchedule,
  calculateCatchUpDate,
  classifyVaccineDueStatus,
  generateVaccinationSchedule,
  calculateDaysDifference,
  KEPI_7_VISIT_DEFINITIONS,
} from '../vaccines';

describe('Vaccination Schedule Business Logic (KEPI 7-Visit Cascade)', () => {
  describe('calculateKEPISchedule', () => {
    it('generates the complete 7-visit KEPI schedule for a newborn', () => {
      const dob = '2026-01-01';
      const schedule = calculateKEPISchedule(dob, 'child-001');

      expect(schedule.dob).toBe('2026-01-01');
      expect(schedule.childId).toBe('child-001');
      expect(schedule.visits).toHaveLength(7);

      // Visit 1: Birth
      const v1 = schedule.visits[0];
      expect(v1.visitNumber).toBe(1);
      expect(v1.targetAgeWeeks).toBe(0);
      expect(v1.scheduledDate).toBe('2026-01-01');
      expect(v1.vaccines.map(v => v.antigen)).toEqual(['BCG', 'OPV 0']);
      expect(v1.vaccines[0].route).toBe('Intradermal');
      expect(v1.vaccines[1].route).toBe('Oral');

      // Visit 2: 6 Weeks
      const v2 = schedule.visits[1];
      expect(v2.visitNumber).toBe(2);
      expect(v2.targetAgeWeeks).toBe(6);
      expect(v2.scheduledDate).toBe('2026-02-12'); // 2026-01-01 + 42 days
      expect(v2.vaccines.map(v => v.antigen)).toEqual([
        'OPV 1',
        'Pentavalent 1 (DTP-HepB-Hib 1)',
        'PCV 1',
        'Rotavirus 1',
      ]);

      // Visit 3: 10 Weeks
      const v3 = schedule.visits[2];
      expect(v3.visitNumber).toBe(3);
      expect(v3.targetAgeWeeks).toBe(10);
      expect(v3.scheduledDate).toBe('2026-03-12'); // 2026-01-01 + 70 days
      expect(v3.vaccines.map(v => v.antigen)).toEqual([
        'OPV 2',
        'Pentavalent 2 (DTP-HepB-Hib 2)',
        'PCV 2',
        'Rotavirus 2',
      ]);

      // Visit 4: 14 Weeks
      const v4 = schedule.visits[3];
      expect(v4.visitNumber).toBe(4);
      expect(v4.targetAgeWeeks).toBe(14);
      expect(v4.scheduledDate).toBe('2026-04-09'); // 2026-01-01 + 98 days
      expect(v4.vaccines.map(v => v.antigen)).toEqual([
        'OPV 3',
        'Pentavalent 3 (DTP-HepB-Hib 3)',
        'PCV 3',
        'IPV 1',
      ]);

      // Visit 5: 6 Months (26 Weeks)
      const v5 = schedule.visits[4];
      expect(v5.visitNumber).toBe(5);
      expect(v5.targetAgeWeeks).toBe(26);
      expect(v5.scheduledDate).toBe('2026-07-02'); // 2026-01-01 + 182 days
      expect(v5.vaccines[0].antigen).toContain('Vitamin A Capsule 1');

      // Visit 6: 9 Months (39 Weeks)
      const v6 = schedule.visits[5];
      expect(v6.visitNumber).toBe(6);
      expect(v6.targetAgeWeeks).toBe(39);
      expect(v6.scheduledDate).toBe('2026-10-01'); // 2026-01-01 + 273 days
      expect(v6.vaccines.map(v => v.antigen)).toEqual([
        'Measles-Rubella 1 (MR 1)',
        'Yellow Fever',
      ]);

      // Visit 7: 18 Months (78 Weeks)
      const v7 = schedule.visits[6];
      expect(v7.visitNumber).toBe(7);
      expect(v7.targetAgeWeeks).toBe(78);
      expect(v7.scheduledDate).toBe('2027-07-01'); // 2026-01-01 + 546 days
      expect(v7.vaccines.map(v => v.antigen)).toEqual([
        'Measles-Rubella 2 (MR 2 Booster)',
        'Vitamin A Capsule 3 (200,000 IU)',
      ]);

      expect(schedule.totalDoses).toBe(19);
    });

    it('accepts Date objects directly and non-ISO date strings', () => {
      const dob = new Date('2026-05-10T00:00:00Z');
      const schedule = calculateKEPISchedule(dob);
      expect(schedule.dob).toBe('2026-05-10');
      expect(schedule.visits[0].scheduledDate).toBe('2026-05-10');

      const nonIsoSchedule = calculateKEPISchedule('March 1, 2026');
      expect(nonIsoSchedule.dob).toBe('2026-03-01');
    });

    it('throws error when invalid DOB string or Date is passed', () => {
      expect(() => calculateKEPISchedule('invalid-date')).toThrow('Invalid birth date provided');
      expect(() => calculateKEPISchedule('')).toThrow('Invalid birth date provided');
      expect(() => calculateKEPISchedule(new Date(NaN))).toThrow('Invalid Date object provided');
      expect(() => calculateKEPISchedule(12345 as any)).toThrow('Invalid birth date provided');

      // Tests rollover date like Feb 31 falling through to standard Date parser
      const schedule = calculateKEPISchedule('2025-02-31');
      expect(schedule.dob).toBe('2025-03-03');
    });

    it('includes bilingual notes and descriptions for all 7 visits', () => {
      const schedule = calculateKEPISchedule('2026-01-01');
      for (const visit of schedule.visits) {
        expect(visit.visitLabelEn).toBeTruthy();
        expect(visit.visitLabelSw).toBeTruthy();
        expect(visit.targetAgeDescriptionEn).toBeTruthy();
        expect(visit.targetAgeDescriptionSw).toBeTruthy();
        expect(visit.clinicalNotesEn).toBeTruthy();
        expect(visit.clinicalNotesSw).toBeTruthy();
      }
    });
  });

  describe('Catch-Up Vaccine Interval Calculations (KEPI Policy)', () => {
    it('calculates the next eligible date maintaining minimum 4-week interval', () => {
      // Dose given on 2026-03-01. Next dose eligible 28 days later = 2026-03-29
      const nextDate = calculateCatchUpDate('2026-03-01');
      expect(nextDate).toBe('2026-03-29');
    });

    it('supports custom interval weeks', () => {
      // 8 weeks interval: 56 days
      const nextDate = calculateCatchUpDate('2026-03-01', 8);
      expect(nextDate).toBe('2026-04-26');
    });
  });

  describe('classifyVaccineDueStatus (Dignity Guarantee)', () => {
    const ref = new Date('2026-05-01T00:00:00Z');

    it('returns "upcoming" when scheduled date is > 14 days away', () => {
      expect(classifyVaccineDueStatus('2026-05-20', ref)).toBe('upcoming');
      // Uses default referenceDate
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(classifyVaccineDueStatus(futureDate)).toBe('upcoming');
    });

    it('returns "due" when within window (+/- 14 days)', () => {
      expect(classifyVaccineDueStatus('2026-05-05', ref)).toBe('due');
      expect(classifyVaccineDueStatus('2026-04-25', ref)).toBe('due');
    });

    it('returns "catch_up_due" when past window (> 14 days overdue)', () => {
      // Non-punitive Savannah Ochre "Catch-up Due"
      expect(classifyVaccineDueStatus('2026-04-01', ref)).toBe('catch_up_due');
    });
  });

  describe('Backwards Compatibility Functions', () => {
    it('generateVaccinationSchedule generates legacy schedule array', () => {
      const dob = '2026-01-01';
      const schedule = generateVaccinationSchedule('child-123', dob);

      expect(schedule).toHaveLength(7);
      expect(schedule[0].vaccine_name).toBe('BCG');
      expect(schedule[0].scheduled_date).toBe('2026-01-01');
      expect(schedule[1].scheduled_date).toBe('2026-01-01');
      expect(schedule[2].age_weeks).toBe(6);
      expect(schedule[0].child_id).toBe('child-123');
      expect(schedule[0].status).toBe('scheduled');
    });

    it('generateVaccinationSchedule throws on invalid date', () => {
      expect(() => generateVaccinationSchedule('child-123', 'invalid-date')).toThrow(
        'Invalid birth date provided'
      );
    });

    it('calculateDaysDifference calculates difference in days', () => {
      const targetDate = '2026-03-10';
      const refDate = new Date('2026-03-01T00:00:00Z');
      const diff = calculateDaysDifference(targetDate, refDate);
      expect(diff).toBe(9);

      // Default referenceDate
      const defaultDiff = calculateDaysDifference('2099-01-01');
      expect(defaultDiff).toBeGreaterThan(0);

      // Handled error returns 0
      expect(calculateDaysDifference('invalid-date')).toBe(0);
    });

    it('exports KEPI definitions structure', () => {
      expect(KEPI_7_VISIT_DEFINITIONS).toHaveLength(7);
    });
  });
});
