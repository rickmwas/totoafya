import { describe, it, expect } from 'vitest';
import { classifyNutritionStatus, getClosestWhoWeight } from '../growth';

describe('Growth & Nutrition Business Logic', () => {
  it('classifies SAM when MUAC < 11.5cm', () => {
    const status = classifyNutritionStatus(8.0, 12, 11.0);
    expect(status).toBe('sam');
  });

  it('classifies MAM when 11.5cm <= MUAC < 12.5cm', () => {
    const status = classifyNutritionStatus(8.5, 12, 12.0);
    expect(status).toBe('mam');
  });

  it('classifies normal when MUAC >= 12.5cm', () => {
    const status = classifyNutritionStatus(9.5, 12, 13.5);
    expect(status).toBe('normal');
  });

  it('falls back to weight-for-age ratio when MUAC is missing', () => {
    // 12 months median weight is 9.6kg. Weight of 6.0kg ratio = 0.625 (< 0.70 SAM)
    expect(classifyNutritionStatus(6.0, 12, null)).toBe('sam');

    // Weight of 7.2kg ratio = 0.75 (< 0.80 MAM)
    expect(classifyNutritionStatus(7.2, 12, null)).toBe('mam');

    // Weight of 9.6kg ratio = 1.0 (Normal)
    expect(classifyNutritionStatus(9.6, 12, null)).toBe('normal');
  });

  it('fetches closest WHO weight median for child age', () => {
    expect(getClosestWhoWeight(0)).toBe(3.3);
    expect(getClosestWhoWeight(12)).toBe(9.6);
  });
});
