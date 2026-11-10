/**
 * @totoafya/business-logic - WHO Child Growth Standards & MUAC Nutrition Assessment
 * 
 * Clinical references:
 * - World Health Organization (WHO) Child Growth Standards (Z-scores: -3 SD to +3 SD)
 * - Kenya National Guidelines for Integrated Management of Acute Malnutrition (IMAM)
 * - MoH Kenya Child Health Handbook
 */

export type ChildGender = 'boy' | 'girl' | 'male' | 'female';

export interface GrowthCutoffs {
  sd3Neg: number; // -3 SD (Severe Malnutrition / Severe Stunting / Severe Wasting)
  sd2Neg: number; // -2 SD (Moderate Malnutrition / Stunting / Wasting)
  median: number; // 0 SD (WHO International Median)
  sd2Pos: number; // +2 SD (Overweight / Tall)
  sd3Pos: number; // +3 SD (Obese)
}

export interface ChildGrowthAssessment {
  ageMonths: number;
  gender: 'boy' | 'girl';
  weightKg?: number;
  heightCm?: number;
  muacCm?: number;
  weightForAgeZ?: number;
  heightForAgeZ?: number;
  weightForHeightZ?: number;
  nutritionStatus: 'SAM' | 'MAM' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';
  classifications: {
    weightForAge?: 'severely_underweight' | 'underweight' | 'normal' | 'overweight' | 'obese';
    heightForAge?: 'severely_stunted' | 'stunted' | 'normal' | 'tall';
    weightForHeight?: 'severely_wasted' | 'wasted' | 'normal' | 'overweight' | 'obese';
    muacStatus?: 'SAM' | 'MAM' | 'NORMAL';
  };
  clinicalRecommendationEn: string;
  clinicalRecommendationSw: string;
}

/**
 * Standard WHO Child Growth Standards (Weight-for-Age in kg)
 * Boys & Girls from 0 to 60 months.
 */
export const WHO_WEIGHT_FOR_AGE_BOYS: Record<number, GrowthCutoffs> = {
  0: { sd3Neg: 2.1, sd2Neg: 2.5, median: 3.3, sd2Pos: 4.4, sd3Pos: 5.0 },
  1: { sd3Neg: 2.9, sd2Neg: 3.4, median: 4.5, sd2Pos: 5.8, sd3Pos: 6.6 },
  2: { sd3Neg: 3.8, sd2Neg: 4.3, median: 5.6, sd2Pos: 7.1, sd3Pos: 8.0 },
  3: { sd3Neg: 4.4, sd2Neg: 5.0, median: 6.4, sd2Pos: 8.0, sd3Pos: 9.0 },
  4: { sd3Neg: 4.9, sd2Neg: 5.6, median: 7.0, sd2Pos: 8.7, sd3Pos: 9.7 },
  5: { sd3Neg: 5.3, sd2Neg: 6.0, median: 7.5, sd2Pos: 9.3, sd3Pos: 10.4 },
  6: { sd3Neg: 5.7, sd2Neg: 6.4, median: 7.9, sd2Pos: 9.8, sd3Pos: 10.9 },
  7: { sd3Neg: 5.9, sd2Neg: 6.7, median: 8.3, sd2Pos: 10.3, sd3Pos: 11.4 },
  8: { sd3Neg: 6.2, sd2Neg: 6.9, median: 8.6, sd2Pos: 10.7, sd3Pos: 11.9 },
  9: { sd3Neg: 6.4, sd2Neg: 7.1, median: 8.9, sd2Pos: 11.0, sd3Pos: 12.3 },
  10: { sd3Neg: 6.6, sd2Neg: 7.4, median: 9.2, sd2Pos: 11.4, sd3Pos: 12.7 },
  11: { sd3Neg: 6.8, sd2Neg: 7.6, median: 9.4, sd2Pos: 11.7, sd3Pos: 13.0 },
  12: { sd3Neg: 6.9, sd2Neg: 7.7, median: 9.6, sd2Pos: 12.0, sd3Pos: 13.3 },
  15: { sd3Neg: 7.4, sd2Neg: 8.3, median: 10.3, sd2Pos: 12.8, sd3Pos: 14.3 },
  18: { sd3Neg: 7.8, sd2Neg: 8.8, median: 10.9, sd2Pos: 13.7, sd3Pos: 15.3 },
  21: { sd3Neg: 8.2, sd2Neg: 9.2, median: 11.5, sd2Pos: 14.5, sd3Pos: 16.2 },
  24: { sd3Neg: 8.6, sd2Neg: 9.7, median: 12.2, sd2Pos: 15.3, sd3Pos: 17.1 },
  30: { sd3Neg: 9.4, sd2Neg: 10.5, median: 13.3, sd2Pos: 16.9, sd3Pos: 19.0 },
  36: { sd3Neg: 10.0, sd2Neg: 11.3, median: 14.3, sd2Pos: 18.3, sd3Pos: 20.7 },
  42: { sd3Neg: 10.7, sd2Neg: 12.0, median: 15.3, sd2Pos: 19.7, sd3Pos: 22.4 },
  48: { sd3Neg: 11.3, sd2Neg: 12.7, median: 16.3, sd2Pos: 21.2, sd3Pos: 24.2 },
  54: { sd3Neg: 11.9, sd2Neg: 13.4, median: 17.3, sd2Pos: 22.7, sd3Pos: 26.2 },
  60: { sd3Neg: 12.4, sd2Neg: 14.1, median: 18.3, sd2Pos: 24.2, sd3Pos: 27.9 },
};

export const WHO_WEIGHT_FOR_AGE_GIRLS: Record<number, GrowthCutoffs> = {
  0: { sd3Neg: 2.0, sd2Neg: 2.4, median: 3.2, sd2Pos: 4.2, sd3Pos: 4.8 },
  1: { sd3Neg: 2.7, sd2Neg: 3.2, median: 4.2, sd2Pos: 5.5, sd3Pos: 6.2 },
  2: { sd3Neg: 3.4, sd2Neg: 3.9, median: 5.1, sd2Pos: 6.6, sd3Pos: 7.5 },
  3: { sd3Neg: 4.0, sd2Neg: 4.5, median: 5.8, sd2Pos: 7.5, sd3Pos: 8.5 },
  4: { sd3Neg: 4.4, sd2Neg: 5.0, median: 6.4, sd2Pos: 8.2, sd3Pos: 9.3 },
  5: { sd3Neg: 4.8, sd2Neg: 5.4, median: 6.9, sd2Pos: 8.8, sd3Pos: 10.0 },
  6: { sd3Neg: 5.1, sd2Neg: 5.7, median: 7.3, sd2Pos: 9.3, sd3Pos: 10.6 },
  7: { sd3Neg: 5.3, sd2Neg: 6.0, median: 7.6, sd2Pos: 9.8, sd3Pos: 11.1 },
  8: { sd3Neg: 5.6, sd2Neg: 6.3, median: 7.9, sd2Pos: 10.2, sd3Pos: 11.6 },
  9: { sd3Neg: 5.8, sd2Neg: 6.5, median: 8.2, sd2Pos: 10.5, sd3Pos: 12.0 },
  10: { sd3Neg: 5.9, sd2Neg: 6.7, median: 8.5, sd2Pos: 10.9, sd3Pos: 12.4 },
  11: { sd3Neg: 6.1, sd2Neg: 6.9, median: 8.7, sd2Pos: 11.2, sd3Pos: 12.8 },
  12: { sd3Neg: 6.3, sd2Neg: 7.0, median: 8.9, sd2Pos: 11.5, sd3Pos: 13.2 },
  15: { sd3Neg: 6.7, sd2Neg: 7.6, median: 9.6, sd2Pos: 12.4, sd3Pos: 14.2 },
  18: { sd3Neg: 7.2, sd2Neg: 8.1, median: 10.2, sd2Pos: 13.2, sd3Pos: 15.2 },
  21: { sd3Neg: 7.6, sd2Neg: 8.6, median: 10.9, sd2Pos: 14.0, sd3Pos: 16.2 },
  24: { sd3Neg: 8.1, sd2Neg: 9.0, median: 11.5, sd2Pos: 14.8, sd3Pos: 17.2 },
  30: { sd3Neg: 8.8, sd2Neg: 9.9, median: 12.6, sd2Pos: 16.4, sd3Pos: 19.1 },
  36: { sd3Neg: 9.4, sd2Neg: 10.8, median: 13.9, sd2Pos: 18.1, sd3Pos: 21.2 },
  42: { sd3Neg: 10.1, sd2Neg: 11.6, median: 15.0, sd2Pos: 19.8, sd3Pos: 23.3 },
  48: { sd3Neg: 10.8, sd2Neg: 12.3, median: 16.1, sd2Pos: 21.5, sd3Pos: 25.4 },
  54: { sd3Neg: 11.4, sd2Neg: 13.0, median: 17.2, sd2Pos: 23.2, sd3Pos: 27.6 },
  60: { sd3Neg: 12.1, sd2Neg: 13.7, median: 18.2, sd2Pos: 24.9, sd3Pos: 29.5 },
};

/**
 * Standard WHO Child Growth Standards (Length/Height-for-Age in cm)
 */
export const WHO_HEIGHT_FOR_AGE_BOYS: Record<number, GrowthCutoffs> = {
  0: { sd3Neg: 44.2, sd2Neg: 46.1, median: 49.9, sd2Pos: 53.7, sd3Pos: 55.6 },
  6: { sd3Neg: 61.2, sd2Neg: 63.3, median: 67.6, sd2Pos: 71.9, sd3Pos: 74.0 },
  12: { sd3Neg: 68.6, sd2Neg: 71.0, median: 75.7, sd2Pos: 80.5, sd3Pos: 82.9 },
  18: { sd3Neg: 74.5, sd2Neg: 77.2, median: 82.3, sd2Pos: 87.4, sd3Pos: 90.0 },
  24: { sd3Neg: 78.7, sd2Neg: 81.7, median: 87.8, sd2Pos: 93.9, sd3Pos: 97.0 },
  36: { sd3Neg: 88.7, sd2Neg: 92.4, median: 99.8, sd2Pos: 107.2, sd3Pos: 110.8 },
  48: { sd3Neg: 94.9, sd2Neg: 99.1, median: 107.4, sd2Pos: 115.7, sd3Pos: 119.8 },
  60: { sd3Neg: 98.7, sd2Neg: 103.3, median: 110.0, sd2Pos: 117.7, sd3Pos: 121.5 },
};

export const WHO_HEIGHT_FOR_AGE_GIRLS: Record<number, GrowthCutoffs> = {
  0: { sd3Neg: 43.6, sd2Neg: 45.4, median: 49.1, sd2Pos: 52.9, sd3Pos: 54.7 },
  6: { sd3Neg: 58.9, sd2Neg: 61.2, median: 65.7, sd2Pos: 70.3, sd3Pos: 72.5 },
  12: { sd3Neg: 66.3, sd2Neg: 68.9, median: 74.0, sd2Pos: 79.2, sd3Pos: 81.7 },
  18: { sd3Neg: 72.8, sd2Neg: 75.6, median: 80.7, sd2Pos: 85.8, sd3Pos: 88.4 },
  24: { sd3Neg: 76.7, sd2Neg: 80.0, median: 86.4, sd2Pos: 92.9, sd3Pos: 96.1 },
  36: { sd3Neg: 87.4, sd2Neg: 91.2, median: 98.6, sd2Pos: 106.2, sd3Pos: 109.9 },
  48: { sd3Neg: 94.1, sd2Neg: 98.4, median: 106.2, sd2Pos: 114.5, sd3Pos: 118.7 },
  60: { sd3Neg: 97.6, sd2Neg: 102.5, median: 109.4, sd2Pos: 117.3, sd3Pos: 121.2 },
};

/**
 * Standard WHO Child Growth Standards (Weight-for-Height/Length in kg)
 * Sample reference points from 50cm to 110cm.
 */
export const WHO_WEIGHT_FOR_HEIGHT: Record<number, GrowthCutoffs> = {
  50: { sd3Neg: 2.2, sd2Neg: 2.5, median: 3.3, sd2Pos: 4.2, sd3Pos: 4.7 },
  60: { sd3Neg: 4.3, sd2Neg: 4.8, median: 5.9, sd2Pos: 7.2, sd3Pos: 8.0 },
  70: { sd3Neg: 6.4, sd2Neg: 7.0, median: 8.5, sd2Pos: 10.3, sd3Pos: 11.4 },
  80: { sd3Neg: 8.3, sd2Neg: 9.1, median: 10.8, sd2Pos: 12.9, sd3Pos: 14.2 },
  90: { sd3Neg: 10.2, sd2Neg: 11.1, median: 13.0, sd2Pos: 15.5, sd3Pos: 17.1 },
  100: { sd3Neg: 12.1, sd2Neg: 13.2, median: 15.5, sd2Pos: 18.5, sd3Pos: 20.4 },
  110: { sd3Neg: 14.3, sd2Neg: 15.6, median: 18.3, sd2Pos: 22.0, sd3Pos: 24.5 },
};

// Backwards-compatible weight median table
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

export function normalizeGender(gender: ChildGender): 'boy' | 'girl' {
  const g = gender.toLowerCase();
  if (g === 'boy' || g === 'male' || g === 'm') return 'boy';
  return 'girl';
}

function interpolateCutoffs(table: Record<number, GrowthCutoffs>, key: number): GrowthCutoffs {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (key <= keys[0]) return table[keys[0]];
  if (key >= keys[keys.length - 1]) return table[keys[keys.length - 1]];

  // Find surrounding keys
  let lower = keys[0];
  let upper = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (key >= keys[i] && key <= keys[i + 1]) {
      lower = keys[i];
      upper = keys[i + 1];
      break;
    }
  }

  if (lower === upper) return table[lower];

  const factor = (key - lower) / (upper - lower);
  const lowC = table[lower];
  const highC = table[upper];

  return {
    sd3Neg: Number((lowC.sd3Neg + factor * (highC.sd3Neg - lowC.sd3Neg)).toFixed(2)),
    sd2Neg: Number((lowC.sd2Neg + factor * (highC.sd2Neg - lowC.sd2Neg)).toFixed(2)),
    median: Number((lowC.median + factor * (highC.median - lowC.median)).toFixed(2)),
    sd2Pos: Number((lowC.sd2Pos + factor * (highC.sd2Pos - lowC.sd2Pos)).toFixed(2)),
    sd3Pos: Number((lowC.sd3Pos + factor * (highC.sd3Pos - lowC.sd3Pos)).toFixed(2)),
  };
}

/**
 * Calculates continuous WHO Z-score from standard cutoffs.
 * Uses piecewise SD scaling between Median and +/- 2/3 SD cutoffs.
 */
export function calculateZScoreFromCutoffs(value: number, cutoffs: GrowthCutoffs): number {
  const { sd3Neg, sd2Neg, median, sd2Pos, sd3Pos } = cutoffs;

  if (value === median) return 0;

  if (value < median) {
    // Negative Z-score
    if (value <= sd3Neg) {
      // Beyond -3 SD
      const sd = (sd2Neg - sd3Neg);
      return Number((-3 - (sd3Neg - value) / (sd || 1)).toFixed(2));
    }
    if (value <= sd2Neg) {
      // Between -3 SD and -2 SD
      const frac = (value - sd3Neg) / (sd2Neg - sd3Neg);
      return Number((-3 + frac).toFixed(2));
    }
    // Between -2 SD and Median (0)
    const frac = (value - sd2Neg) / (median - sd2Neg);
    return Number((-2 + 2 * frac).toFixed(2));
  } else {
    // Positive Z-score
    if (value >= sd3Pos) {
      // Beyond +3 SD
      const sd = (sd3Pos - sd2Pos);
      return Number((3 + (value - sd3Pos) / (sd || 1)).toFixed(2));
    }
    if (value >= sd2Pos) {
      // Between +2 SD and +3 SD
      const frac = (value - sd2Pos) / (sd3Pos - sd2Pos);
      return Number((2 + frac).toFixed(2));
    }
    // Between Median (0) and +2 SD
    const frac = (value - median) / (sd2Pos - median);
    return Number((2 * frac).toFixed(2));
  }
}

/**
 * Calculates Weight-for-Age Z-score according to WHO Child Growth Standards.
 */
export function calculateWeightForAgeZScore(
  weightKg: number,
  ageMonths: number,
  gender: ChildGender
): number {
  const normalizedG = normalizeGender(gender);
  const table = normalizedG === 'boy' ? WHO_WEIGHT_FOR_AGE_BOYS : WHO_WEIGHT_FOR_AGE_GIRLS;
  const cutoffs = interpolateCutoffs(table, Math.max(0, Math.min(60, ageMonths)));
  return calculateZScoreFromCutoffs(weightKg, cutoffs);
}

/**
 * Calculates Height/Length-for-Age Z-score according to WHO Child Growth Standards.
 */
export function calculateHeightForAgeZScore(
  heightCm: number,
  ageMonths: number,
  gender: ChildGender
): number {
  const normalizedG = normalizeGender(gender);
  const table = normalizedG === 'boy' ? WHO_HEIGHT_FOR_AGE_BOYS : WHO_HEIGHT_FOR_AGE_GIRLS;
  const cutoffs = interpolateCutoffs(table, Math.max(0, Math.min(60, ageMonths)));
  return calculateZScoreFromCutoffs(heightCm, cutoffs);
}

/**
 * Calculates Weight-for-Height/Length Z-score according to WHO Child Growth Standards.
 */
export function calculateWeightForHeightZScore(
  weightKg: number,
  heightCm: number,
  _gender?: ChildGender
): number {
  const cutoffs = interpolateCutoffs(WHO_WEIGHT_FOR_HEIGHT, Math.max(50, Math.min(110, heightCm)));
  return calculateZScoreFromCutoffs(weightKg, cutoffs);
}

/**
 * MUAC (Mid-Upper Arm Circumference) Malnutrition Classification:
 * 
 * Enforces strict Kenya MoH IMAM Guidelines:
 * - Restricted to children aged >= 6 months (6 to 59 months).
 * - Under 6 months, MUAC is clinically unvalidated -> throws descriptive clinical error.
 * 
 * Cutoffs:
 * - Red (< 11.5 cm): Severe Acute Malnutrition (SAM)
 * - Yellow (11.5 cm to 12.4 cm): Moderate Acute Malnutrition (MAM)
 * - Green (>= 12.5 cm): Normal Nutrition (NORMAL)
 */
export function assessMUACNutrition(muacCm: number, ageMonths: number): 'SAM' | 'MAM' | 'NORMAL' {
  if (typeof ageMonths !== 'number' || isNaN(ageMonths)) {
    throw new Error('Valid child age in months is required for MUAC evaluation.');
  }

  // Strict clinical boundary: MUAC is valid only for infants/children aged >= 6 months
  if (ageMonths < 6) {
    throw new Error(
      'MUAC screening is clinically validated only for infants and children aged 6 months and older per Kenya MoH IMAM guidelines.'
    );
  }

  if (typeof muacCm !== 'number' || isNaN(muacCm) || muacCm <= 0) {
    throw new Error('Valid MUAC measurement in centimeters is required.');
  }

  if (muacCm < 11.5) {
    return 'SAM';
  }
  if (muacCm < 12.5) {
    return 'MAM';
  }
  return 'NORMAL';
}

/**
 * Comprehensive child growth & nutrition evaluation combining Weight, Height, and MUAC.
 */
export function evaluateChildGrowth(params: {
  ageMonths: number;
  gender: ChildGender;
  weightKg?: number;
  heightCm?: number;
  muacCm?: number;
}): ChildGrowthAssessment {
  const { ageMonths, weightKg, heightCm, muacCm } = params;
  const gender = normalizeGender(params.gender);

  let weightForAgeZ: number | undefined;
  let heightForAgeZ: number | undefined;
  let weightForHeightZ: number | undefined;

  const classifications: ChildGrowthAssessment['classifications'] = {};

  if (typeof weightKg === 'number' && weightKg > 0) {
    weightForAgeZ = calculateWeightForAgeZScore(weightKg, ageMonths, gender);
    if (weightForAgeZ < -3) classifications.weightForAge = 'severely_underweight';
    else if (weightForAgeZ < -2) classifications.weightForAge = 'underweight';
    else if (weightForAgeZ <= 2) classifications.weightForAge = 'normal';
    else if (weightForAgeZ <= 3) classifications.weightForAge = 'overweight';
    else classifications.weightForAge = 'obese';
  }

  if (typeof heightCm === 'number' && heightCm > 0) {
    heightForAgeZ = calculateHeightForAgeZScore(heightCm, ageMonths, gender);
    if (heightForAgeZ < -3) classifications.heightForAge = 'severely_stunted';
    else if (heightForAgeZ < -2) classifications.heightForAge = 'stunted';
    else if (heightForAgeZ <= 2) classifications.heightForAge = 'normal';
    else classifications.heightForAge = 'tall';
  }

  if (typeof weightKg === 'number' && typeof heightCm === 'number' && weightKg > 0 && heightCm > 0) {
    weightForHeightZ = calculateWeightForHeightZScore(weightKg, heightCm, gender);
    if (weightForHeightZ < -3) classifications.weightForHeight = 'severely_wasted';
    else if (weightForHeightZ < -2) classifications.weightForHeight = 'wasted';
    else if (weightForHeightZ <= 2) classifications.weightForHeight = 'normal';
    else if (weightForHeightZ <= 3) classifications.weightForHeight = 'overweight';
    else classifications.weightForHeight = 'obese';
  }

  let muacStatus: 'SAM' | 'MAM' | 'NORMAL' | undefined;
  if (typeof muacCm === 'number' && muacCm > 0 && ageMonths >= 6) {
    muacStatus = assessMUACNutrition(muacCm, ageMonths);
    classifications.muacStatus = muacStatus;
  }

  // Overall nutrition status synthesis
  let nutritionStatus: ChildGrowthAssessment['nutritionStatus'] = 'NORMAL';
  let recommendationEn = 'Child growth and nutritional parameters are within normal developmental limits.';
  let recommendationSw = 'Makuzi ya mtoto na hali ya lishe yako katika viwango vya kawaida vinavyoridhisha.';

  if (muacStatus === 'SAM' || classifications.weightForHeight === 'severely_wasted' || classifications.weightForAge === 'severely_underweight') {
    nutritionStatus = 'SAM';
    recommendationEn = 'CRITICAL ALERT: Severe Acute Malnutrition (SAM) indicated. Urgent clinic referral required for therapeutic feeding (RUTF).';
    recommendationSw = 'HATARI YA LISHE: Utapiamlo mkali (SAM) umegunduliwa. Mtoto apelekwe kliniki mara moja kwa matibabu na chakula maalum (RUTF).';
  } else if (muacStatus === 'MAM' || classifications.weightForHeight === 'wasted' || classifications.weightForAge === 'underweight') {
    nutritionStatus = 'MAM';
    recommendationEn = 'MODERATE ALERT: Moderate Acute Malnutrition (MAM) indicated. Supplementary feeding counseling recommended at next clinic visit.';
    recommendationSw = 'TAHADHARI YA LISHE: Utapiamlo wa wastani (MAM) umegunduliwa. Mtoto anahitaji chakula chenye virutubisho na ushauri wa kliniki.';
  } else if (classifications.weightForAge === 'obese' || classifications.weightForHeight === 'obese') {
    nutritionStatus = 'OBESE';
    recommendationEn = 'Child weight is above standard curve (+3 SD). Consult pediatric nutritionist for balanced diet guidance.';
    recommendationSw = 'Uzito wa mtoto umezidi viwango vya kawaida (+3 SD). Pata ushauri wa lishe bora kutoka kwa mtaalamu.';
  } else if (classifications.weightForAge === 'overweight' || classifications.weightForHeight === 'overweight') {
    nutritionStatus = 'OVERWEIGHT';
    recommendationEn = 'Child weight is elevated (+2 SD). Maintain active play and healthy feeding habits.';
    recommendationSw = 'Uzito wa mtoto uko juu kidogo (+2 SD). Zingatia michezo na vyakula vyenye afya.';
  }

  return {
    ageMonths,
    gender,
    weightKg,
    heightCm,
    muacCm,
    weightForAgeZ,
    heightForAgeZ,
    weightForHeightZ,
    nutritionStatus,
    classifications,
    clinicalRecommendationEn: recommendationEn,
    clinicalRecommendationSw: recommendationSw,
  };
}

/**
 * Backwards-compatible getClosestWhoWeight
 */
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

/**
 * Backwards-compatible classifyNutritionStatus
 */
export function classifyNutritionStatus(
  weightKg?: number | null,
  ageMonths?: number | null,
  muacCm?: number | null
): 'normal' | 'mam' | 'sam' | 'overweight' {
  // 1. Check MUAC first if available AND age is eligible (>= 6 months or unspecified)
  if (muacCm !== undefined && muacCm !== null && muacCm > 0) {
    if (ageMonths === undefined || ageMonths === null || ageMonths >= 6) {
      if (muacCm < 11.5) return 'sam';
      if (muacCm < 12.5) return 'mam';
    }
  }

  // 2. Fallback to Weight-for-Age comparison
  if (
    weightKg !== undefined &&
    weightKg !== null &&
    ageMonths !== undefined &&
    ageMonths !== null &&
    ageMonths >= 0
  ) {
    const median = getClosestWhoWeight(ageMonths);
    const ratio = weightKg / median;

    if (ratio < 0.70) return 'sam';
    if (ratio < 0.80) return 'mam';
    if (ratio > 1.25) return 'overweight';
  }

  return 'normal';
}

// Re-export developmental milestones catalog & helpers
export * from './milestones';

