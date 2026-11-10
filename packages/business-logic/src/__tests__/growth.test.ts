import { describe, it, expect } from 'vitest';
import {
  assessMUACNutrition,
  calculateWeightForAgeZScore,
  calculateHeightForAgeZScore,
  calculateWeightForHeightZScore,
  evaluateChildGrowth,
  classifyNutritionStatus,
  getClosestWhoWeight,
  normalizeGender,
  calculateZScoreFromCutoffs,
  WHO_WEIGHT_FOR_AGE_BOYS,
  WHO_WEIGHT_FOR_AGE_GIRLS,
  WHO_HEIGHT_FOR_AGE_BOYS,
  CHILD_MILESTONES_CATALOG,
  getMilestonesByAgeBand,
  getMilestonesByCategory,
  getMilestonesForAgeMonths,
  resolveAgeBandFromMonths,
} from '../growth';

describe('Growth & Nutrition Business Logic', () => {
  describe('Gender Normalization & Cutoff Helpers', () => {
    it('normalizes gender inputs correctly', () => {
      expect(normalizeGender('boy')).toBe('boy');
      expect(normalizeGender('male')).toBe('boy');
      expect(normalizeGender('m' as any)).toBe('boy');
      expect(normalizeGender('girl')).toBe('girl');
      expect(normalizeGender('female')).toBe('girl');
      expect(normalizeGender('f' as any)).toBe('girl');
    });

    it('calculates continuous Z-scores across all SD bands', () => {
      const cutoffs = { sd3Neg: 2.0, sd2Neg: 3.0, median: 5.0, sd2Pos: 7.0, sd3Pos: 8.0 };

      // Median -> 0
      expect(calculateZScoreFromCutoffs(5.0, cutoffs)).toBe(0);

      // Between median and -2 SD (e.g. 4.0 is halfway -> -1 SD)
      expect(calculateZScoreFromCutoffs(4.0, cutoffs)).toBe(-1);

      // Exactly -2 SD
      expect(calculateZScoreFromCutoffs(3.0, cutoffs)).toBe(-2);

      // Between -2 SD and -3 SD (2.5 -> -2.5)
      expect(calculateZScoreFromCutoffs(2.5, cutoffs)).toBe(-2.5);

      // Exactly -3 SD
      expect(calculateZScoreFromCutoffs(2.0, cutoffs)).toBe(-3);

      // Beyond -3 SD (1.0 -> -4)
      expect(calculateZScoreFromCutoffs(1.0, cutoffs)).toBe(-4);

      // Between median and +2 SD (6.0 -> +1)
      expect(calculateZScoreFromCutoffs(6.0, cutoffs)).toBe(1);

      // Exactly +2 SD
      expect(calculateZScoreFromCutoffs(7.0, cutoffs)).toBe(2);

      // Between +2 SD and +3 SD (7.5 -> +2.5)
      expect(calculateZScoreFromCutoffs(7.5, cutoffs)).toBe(2.5);

      // Exactly +3 SD
      expect(calculateZScoreFromCutoffs(8.0, cutoffs)).toBe(3);

      // Beyond +3 SD (9.0 -> +4)
      expect(calculateZScoreFromCutoffs(9.0, cutoffs)).toBe(4);
    });
  });

  describe('WHO Child Growth Standards Z-Scores', () => {
    it('calculates Weight-for-Age Z-scores for boys', () => {
      // 0 months boy: median 3.3kg
      expect(calculateWeightForAgeZScore(3.3, 0, 'boy')).toBe(0);

      // 12 months boy: median 9.6kg, -2SD 7.7kg, -3SD 6.9kg
      expect(calculateWeightForAgeZScore(9.6, 12, 'boy')).toBe(0);
      expect(calculateWeightForAgeZScore(7.7, 12, 'boy')).toBe(-2);
      expect(calculateWeightForAgeZScore(6.9, 12, 'boy')).toBe(-3);
    });

    it('calculates Weight-for-Age Z-scores for girls', () => {
      // 0 months girl: median 3.2kg
      expect(calculateWeightForAgeZScore(3.2, 0, 'girl')).toBe(0);

      // 12 months girl: median 8.9kg, -2SD 7.0kg
      expect(calculateWeightForAgeZScore(8.9, 12, 'girl')).toBe(0);
      expect(calculateWeightForAgeZScore(7.0, 12, 'girl')).toBe(-2);
    });

    it('interpolates intermediate months smoothly (e.g. month 3.5)', () => {
      const z = calculateWeightForAgeZScore(6.7, 3.5, 'boy');
      expect(z).toBeGreaterThan(-1);
      expect(z).toBeLessThan(1);

      // Key at boundary or beyond table bounds (e.g. 60m or >60m)
      const z60 = calculateWeightForAgeZScore(18.3, 60, 'boy');
      expect(z60).toBe(0);

      const zBeyond = calculateWeightForAgeZScore(18.3, 72, 'boy');
      expect(zBeyond).toBe(0);
    });

    it('calculates Height-for-Age Z-scores', () => {
      // 12 months boy: median 75.7cm, -2SD 71.0cm, -3SD 68.6cm
      expect(calculateHeightForAgeZScore(75.7, 12, 'boy')).toBe(0);
      expect(calculateHeightForAgeZScore(71.0, 12, 'boy')).toBe(-2);
      expect(calculateHeightForAgeZScore(68.6, 12, 'boy')).toBe(-3);

      // 12 months girl: median 74.0cm
      expect(calculateHeightForAgeZScore(74.0, 12, 'girl')).toBe(0);
    });

    it('calculates Weight-for-Height Z-scores', () => {
      // 70cm child: median 8.5kg
      expect(calculateWeightForHeightZScore(8.5, 70, 'boy')).toBe(0);
      expect(calculateWeightForHeightZScore(7.0, 70, 'girl')).toBe(-2);
    });
  });

  describe('MUAC Malnutrition Classification (Kenya MoH IMAM Guidelines)', () => {
    it('classifies SAM (Red Alert) when MUAC < 11.5 cm for child >= 6 months', () => {
      expect(assessMUACNutrition(10.5, 12)).toBe('SAM');
      expect(assessMUACNutrition(11.4, 6)).toBe('SAM');
    });

    it('classifies MAM (Yellow Alert) when 11.5 cm <= MUAC < 12.5 cm', () => {
      expect(assessMUACNutrition(11.5, 9)).toBe('MAM');
      expect(assessMUACNutrition(12.0, 18)).toBe('MAM');
      expect(assessMUACNutrition(12.4, 24)).toBe('MAM');
    });

    it('classifies NORMAL (Green) when MUAC >= 12.5 cm', () => {
      expect(assessMUACNutrition(12.5, 12)).toBe('NORMAL');
      expect(assessMUACNutrition(14.0, 36)).toBe('NORMAL');
    });

    it('strictly enforces age boundary: throws error for infants < 6 months', () => {
      expect(() => assessMUACNutrition(12.0, 5)).toThrow(
        'MUAC screening is clinically validated only for infants and children aged 6 months and older'
      );
      expect(() => assessMUACNutrition(11.0, 0)).toThrow('aged 6 months and older');
      expect(() => assessMUACNutrition(12.0, NaN)).toThrow('Valid child age in months is required');
      expect(() => assessMUACNutrition(0, 12)).toThrow('Valid MUAC measurement');
      expect(() => assessMUACNutrition(-2, 12)).toThrow('Valid MUAC measurement');
    });
  });

  describe('Comprehensive Child Growth Assessment (evaluateChildGrowth)', () => {
    it('evaluates normal growth profile', () => {
      const assessment = evaluateChildGrowth({
        ageMonths: 12,
        gender: 'boy',
        weightKg: 9.6,
        heightCm: 75.7,
        muacCm: 13.5,
      });

      expect(assessment.nutritionStatus).toBe('NORMAL');
      expect(assessment.classifications.weightForAge).toBe('normal');
      expect(assessment.classifications.heightForAge).toBe('normal');
      expect(assessment.classifications.weightForHeight).toBe('normal');
      expect(assessment.classifications.muacStatus).toBe('NORMAL');
      expect(assessment.clinicalRecommendationEn).toContain('normal developmental limits');
    });

    it('flags SAM with urgent RUTF therapeutic feeding recommendation', () => {
      const sam = evaluateChildGrowth({
        ageMonths: 14,
        gender: 'girl',
        weightKg: 6.0,
        heightCm: 72.0,
        muacCm: 11.0,
      });

      expect(sam.nutritionStatus).toBe('SAM');
      expect(sam.classifications.muacStatus).toBe('SAM');
      expect(sam.clinicalRecommendationEn).toContain('CRITICAL ALERT: Severe Acute Malnutrition');
      expect(sam.clinicalRecommendationSw).toContain('HATARI YA LISHE');
    });

    it('flags MAM with supplementary feeding recommendation', () => {
      const mam = evaluateChildGrowth({
        ageMonths: 18,
        gender: 'boy',
        weightKg: 8.5,
        heightCm: 81.0,
        muacCm: 12.0,
      });

      expect(mam.nutritionStatus).toBe('MAM');
      expect(mam.classifications.muacStatus).toBe('MAM');
      expect(mam.clinicalRecommendationEn).toContain('MODERATE ALERT');
    });

    it('flags stunting when height is below -2 SD', () => {
      const stunted = evaluateChildGrowth({
        ageMonths: 24,
        gender: 'boy',
        heightCm: 79.0, // Boy 24m -2SD is 81.7cm
      });

      expect(stunted.classifications.heightForAge).toBe('stunted');
    });

    it('flags severe stunting when height is below -3 SD', () => {
      const severelyStunted = evaluateChildGrowth({
        ageMonths: 24,
        gender: 'boy',
        heightCm: 75.0, // Boy 24m -3SD is 78.7cm
      });

      expect(severelyStunted.classifications.heightForAge).toBe('severely_stunted');
    });

    it('flags tall when height is above +2 SD', () => {
      const tall = evaluateChildGrowth({
        ageMonths: 12,
        gender: 'boy',
        heightCm: 82.0,
      });

      expect(tall.classifications.heightForAge).toBe('tall');
    });

    it('flags overweight and obesity properly', () => {
      const overweight = evaluateChildGrowth({
        ageMonths: 12,
        gender: 'boy',
        weightKg: 12.5, // Boy 12m +2SD is 12.0kg
      });
      expect(overweight.nutritionStatus).toBe('OVERWEIGHT');

      const obese = evaluateChildGrowth({
        ageMonths: 12,
        gender: 'boy',
        weightKg: 14.5, // Boy 12m +3SD is 13.3kg
      });
      expect(obese.nutritionStatus).toBe('OBESE');

      // Tests weight-for-height overweight and obese branches
      const wfhOverweight = evaluateChildGrowth({
        ageMonths: 12,
        gender: 'boy',
        weightKg: 10.8,
        heightCm: 70.0, // 70cm median is 8.5kg, +2SD is 10.3kg
      });
      expect(wfhOverweight.classifications.weightForHeight).toBe('overweight');

      const wfhObese = evaluateChildGrowth({
        ageMonths: 12,
        gender: 'boy',
        weightKg: 12.0,
        heightCm: 70.0, // 70cm +3SD is 11.4kg
      });
      expect(wfhObese.classifications.weightForHeight).toBe('obese');
    });
  });

  describe('Backwards Compatibility Functions', () => {
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

    it('ignores MUAC for infants < 6 months and uses weight-for-age ratio', () => {
      // 3 months infant: median weight 6.4kg.
      // If MUAC is passed as 10.0cm (which would be SAM in older child), it MUST NOT be used!
      const status = classifyNutritionStatus(6.4, 3, 10.0);
      expect(status).toBe('normal');
    });

    it('falls back to weight-for-age ratio when MUAC is missing', () => {
      // 12 months median weight is 9.6kg.
      // Weight 6.0kg -> ratio 0.625 (< 0.70 SAM)
      expect(classifyNutritionStatus(6.0, 12, null)).toBe('sam');

      // Weight 7.2kg -> ratio 0.75 (< 0.80 MAM)
      expect(classifyNutritionStatus(7.2, 12, null)).toBe('mam');

      // Weight 9.6kg -> ratio 1.0 (Normal)
      expect(classifyNutritionStatus(9.6, 12, null)).toBe('normal');

      // Weight 13.0kg -> ratio 1.35 (> 1.25 Overweight)
      expect(classifyNutritionStatus(13.0, 12, null)).toBe('overweight');
    });

    it('returns normal if no metrics are provided', () => {
      expect(classifyNutritionStatus(null, null, null)).toBe('normal');
    });

    it('fetches closest WHO weight median for child age', () => {
      expect(getClosestWhoWeight(0)).toBe(3.3);
      expect(getClosestWhoWeight(12)).toBe(9.6);
      expect(getClosestWhoWeight(20)).toBe(10.9);
    });
  });

  describe('Child Developmental Milestones Catalog (5 categories across 8 age bands)', () => {
    it('contains all 5 developmental categories in the catalog', () => {
      const categories = new Set(CHILD_MILESTONES_CATALOG.map((m) => m.category));
      expect(categories.has('motor')).toBe(true);
      expect(categories.has('cognitive')).toBe(true);
      expect(categories.has('language')).toBe(true);
      expect(categories.has('social')).toBe(true);
      expect(categories.has('feeding')).toBe(true);
      expect(categories.size).toBe(5);
    });

    it('covers all 8 age bands from 0-3m to 3-5y', () => {
      const bands = new Set(CHILD_MILESTONES_CATALOG.map((m) => m.ageBand));
      const expectedBands = ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2-3y', '3-5y'];
      for (const b of expectedBands) {
        expect(bands.has(b as any)).toBe(true);
      }
      expect(CHILD_MILESTONES_CATALOG.length).toBeGreaterThanOrEqual(40);
    });

    it('provides complete bilingual English and Swahili strings on all milestones', () => {
      for (const m of CHILD_MILESTONES_CATALOG) {
        expect(m.id).toBeTruthy();
        expect(m.title).toBeTruthy();
        expect(m.titleSw).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(m.descriptionSw).toBeTruthy();
        expect(m.categoryEn).toBeTruthy();
        expect(m.categorySw).toBeTruthy();
        expect(m.ageBandLabelEn).toBeTruthy();
        expect(m.ageBandLabelSw).toBeTruthy();
      }
    });

    it('filters milestones by age band and category correctly', () => {
      const infantMotor = getMilestonesByAgeBand('0-3m').filter((m) => m.category === 'motor');
      expect(infantMotor.length).toBeGreaterThanOrEqual(1);

      const languageMilestones = getMilestonesByCategory('language');
      expect(languageMilestones.length).toBe(8); // 1 per age band

      const toddlerMilestones = getMilestonesForAgeMonths(15);
      expect(toddlerMilestones.length).toBeGreaterThanOrEqual(5);

      expect(resolveAgeBandFromMonths(2)).toBe('0-3m');
      expect(resolveAgeBandFromMonths(5)).toBe('3-6m');
      expect(resolveAgeBandFromMonths(8)).toBe('6-9m');
      expect(resolveAgeBandFromMonths(11)).toBe('9-12m');
      expect(resolveAgeBandFromMonths(16)).toBe('12-18m');
      expect(resolveAgeBandFromMonths(22)).toBe('18-24m');
      expect(resolveAgeBandFromMonths(30)).toBe('2-3y');
      expect(resolveAgeBandFromMonths(48)).toBe('3-5y');
    });
  });
});

