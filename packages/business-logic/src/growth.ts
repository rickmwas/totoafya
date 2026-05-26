export const WHO_WEIGHT_MEDIAN: Record<number, number> = {
  0: 3.3,
  1: 4.5,
  2: 5.6,
  3: 6.4,
  4: 7.0,
  5: 7.5,
  6: 7.9,
  7: 8.3,
  8: 8.6,
  9: 8.9,
  10: 9.2,
  11: 9.4,
  12: 9.6,
  18: 10.9,
  24: 12.2,
  36: 14.3,
  48: 16.3,
  60: 18.3,
};

export function getClosestWhoWeight(ageMonths: number): number {
  const ages = Object.keys(WHO_WEIGHT_MEDIAN).map(Number).sort((a, b) => a - b);
  let closest = ages[0];
  let minDiff = Math.abs(ageMonths - closest);
  
  for (const age of ages) {
    const diff = Math.abs(ageMonths - age);
    if (diff < minDiff) {
      minDiff = diff;
      closest = age;
    }
  }
  return WHO_WEIGHT_MEDIAN[closest];
}

export function classifyNutritionStatus(
  weightKg?: number | null,
  ageMonths?: number | null,
  muacCm?: number | null
): 'normal' | 'mam' | 'sam' | 'overweight' {
  // 1. Check MUAC (Mid-Upper Arm Circumference) first if available
  // Under WHO guidelines for children 6-59 months:
  // SAM: MUAC < 11.5cm
  // MAM: MUAC >= 11.5cm and < 12.5cm
  // Normal: MUAC >= 12.5cm
  if (muacCm !== undefined && muacCm !== null && muacCm > 0) {
    if (muacCm < 11.5) return 'sam';
    if (muacCm < 12.5) return 'mam';
  }

  // 2. Fallback to Weight-for-Age comparison
  if (weightKg !== undefined && weightKg !== null && ageMonths !== undefined && ageMonths !== null && ageMonths >= 0) {
    const median = getClosestWhoWeight(ageMonths);
    const ratio = weightKg / median;

    if (ratio < 0.70) return 'sam';
    if (ratio < 0.80) return 'mam';
    if (ratio > 1.25) return 'overweight';
  }

  return 'normal';
}
