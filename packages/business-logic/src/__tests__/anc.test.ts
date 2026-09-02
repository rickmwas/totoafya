import { describe, it, expect } from 'vitest';
import { calculateGestationalAgeInWeeks, calculateEdd } from '../anc';

describe('ANC Business Logic', () => {
  it('calculates gestational age correctly from LMP string', () => {
    // Simulated LMP 28 days ago (4 weeks)
    const refDate = new Date('2026-03-01T00:00:00Z');
    const lmpDate = '2026-02-01';
    
    const weeks = calculateGestationalAgeInWeeks(lmpDate, refDate);
    expect(weeks).toBe(4);
  });

  it('returns 0 for future or invalid LMP dates', () => {
    expect(calculateGestationalAgeInWeeks('invalid-date')).toBe(0);
  });

  it('calculates EDD using Naegele rule (LMP + 280 days)', () => {
    const lmpDate = '2026-01-01';
    const edd = calculateEdd(lmpDate);
    // 2026-01-01 + 280 days = 2026-10-08
    expect(edd).toBe('2026-10-08');
  });
});
