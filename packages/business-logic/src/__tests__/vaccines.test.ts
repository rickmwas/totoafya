import { describe, it, expect } from 'vitest';
import { generateVaccinationSchedule, calculateDaysDifference } from '../vaccines';

describe('Vaccination Schedule Business Logic', () => {
  it('generates full Kenyan 7-visit immunization schedule for newborn', () => {
    const dob = '2026-01-01';
    const schedule = generateVaccinationSchedule('child-123', dob);

    expect(schedule).toHaveLength(7);
    expect(schedule[0].vaccine_name).toBe('BCG');
    expect(schedule[0].scheduled_date).toBe('2026-01-01');
    expect(schedule[1].scheduled_date).toBe('2026-01-01'); // OPV 0
    expect(schedule[2].age_weeks).toBe(6); // Week 6 visit
  });

  it('throws error when invalid DOB string is passed', () => {
    expect(() => generateVaccinationSchedule('child-123', 'invalid-date')).toThrow('Invalid birth date provided');
  });

  it('calculates days difference correctly between dates', () => {
    const targetDate = '2026-03-10';
    const refDate = new Date('2026-03-01T00:00:00Z');
    const diff = calculateDaysDifference(targetDate, refDate);
    expect(diff).toBe(9);
  });
});
