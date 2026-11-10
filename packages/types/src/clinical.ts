/**
 * TotoAfya Digital — Clinical Types & Guardrails
 * Canonical Definitions per Kenya Ministry of Health & WHO Guidelines
 * 
 * Standards Citations:
 * - Kenya MoH Maternal & Child Health Handbook (MoH 216)
 * - WHO 2016 Recommendations on Antenatal Care for a Positive Pregnancy Experience
 * - WHO Child Growth Standards (2006)
 * - Kenya Integrated Management of Acute Malnutrition (IMAM)
 * - Kenya Expanded Programme on Immunization (KEPI)
 */

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
export type CaregiverType = 'mother' | 'father' | 'guardian';
export type PregnancyStatus = 'pregnant' | 'postpartum' | 'not_pregnant';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Gender = 'male' | 'female';
export type BirthType = 'normal' | 'caesarean' | 'assisted';
export type HealthStatus = 'healthy' | 'monitor' | 'at_risk' | 'critical';
export type UrineProtein = 'negative' | 'trace' | '1+' | '2+' | '3+';
export type HivStatus = 'negative' | 'positive' | 'not_tested' | 'declined';
export type NutritionStatus = 'normal' | 'mam' | 'sam' | 'overweight';
export type ImmunizationStatus = 'scheduled' | 'due' | 'overdue' | 'given' | 'missed';
export type MilestoneCategory = 'motor' | 'language' | 'social' | 'cognitive' | 'feeding';
export type MilestoneStatus = 'upcoming' | 'due' | 'achieved' | 'delayed';

/**
 * Gestational Age Representation
 * Calculates completed weeks and additional days elapsed since Last Menstrual Period (LMP).
 * Bounded between 1 and 44 completed weeks.
 */
export interface GestationalAge {
  readonly weeks: number; // Completed weeks (1 to 44)
  readonly days: number; // Additional days within current week (0 to 6)
  readonly totalDays: number; // Total days elapsed since LMP
  readonly trimester: 1 | 2 | 3; // 1: weeks 1-12, 2: weeks 13-27, 3: weeks 28+
  readonly formatted: string; // e.g. "Week 28 + 3 days"
  readonly formattedSw: string; // e.g. "Wiki ya 28 na siku 3"
}

/**
 * Estimated Date of Delivery (EDD) Record
 * Formulated via Naegele's rule (LMP + 280 days), ultrasound biometry, or guided trimester estimate.
 */
export type EDDCalculationMethod = 'lmp_naegele' | 'ultrasound' | 'guided_estimate';
export type EDDConfidence = 'confirmed' | 'estimated' | 'provisional';

export interface EDDRecord {
  readonly edd: string; // ISO date string: YYYY-MM-DD
  readonly lmp: string; // ISO date string: YYYY-MM-DD
  readonly calculationMethod: EDDCalculationMethod;
  readonly confidence: EDDConfidence;
  readonly calculatedAt: string; // ISO 8601 timestamp
  readonly gestationalAgeAtCalculation: GestationalAge;
  readonly notes?: string;
}

/**
 * Mid-Upper Arm Circumference (MUAC) Nutrition Measurement
 * Governed by Kenya IMAM & WHO Nutrition Guidelines:
 * - SAM (Severe Acute Malnutrition): MUAC < 11.5 cm -> Red Alert
 * - MAM (Moderate Acute Malnutrition): 11.5 cm <= MUAC < 12.5 cm -> Yellow Alert
 * - NORMAL (Healthy Nutrition): MUAC >= 12.5 cm -> Green
 * Applicable strictly to children aged >= 6 months.
 */
export type MUACClassification = 'SAM' | 'MAM' | 'NORMAL';
export type MUACColorBand = 'red' | 'yellow' | 'green';

export interface MUACMeasurement {
  readonly muacCm: number;
  readonly childAgeMonths: number;
  readonly classification: MUACClassification;
  readonly colorBand: MUACColorBand;
  readonly isEligible: boolean; // Must be >= 6 months of age
  readonly measuredAt: string; // ISO 8601 timestamp
  readonly operatorId?: string;
  readonly facilityId?: string;
  readonly notes?: string;
}

/**
 * Blood Pressure Reading & Pre-Eclampsia Triage
 * Clinical Thresholds per Kenya MoH Obstetric Guidelines:
 * - Normal: Systolic < 120 and Diastolic < 80 mmHg
 * - Elevated: Systolic 120-129 and Diastolic < 80 mmHg
 * - Stage 1: Systolic 130-139 or Diastolic 80-89 mmHg
 * - Stage 2: Systolic >= 140 or Diastolic >= 90 mmHg (Suspected Pre-eclampsia Alert)
 * - Hypertensive Crisis: Systolic >= 160 or Diastolic >= 110 mmHg (Immediate Emergency SOS Takeover)
 */
export type BPTriageCategory =
  | 'normal'
  | 'elevated'
  | 'stage1_hypertension'
  | 'stage2_hypertension'
  | 'hypertensive_crisis_preeclampsia';

export interface BloodPressureReading {
  readonly systolic: number; // mmHg (plausibility bounds: 70 - 240)
  readonly diastolic: number; // mmHg (plausibility bounds: 40 - 150)
  readonly measuredAt: string; // ISO 8601 timestamp
  readonly triageCategory: BPTriageCategory;
  readonly isPreEclampsiaRisk: boolean; // systolic >= 140 || diastolic >= 90
  readonly isCriticalEmergency: boolean; // systolic >= 160 || diastolic >= 110
  readonly pulseBpm?: number;
  readonly armUsed?: 'left' | 'right';
  readonly position?: 'sitting' | 'lying' | 'standing';
  readonly notes?: string;
}

/**
 * Obstetric and Neonatal Danger Signs Alert
 * Deterministic Regex Emergency Sniffer Output (Fail-closed design).
 * Triggers SCR-21 Emergency SOS Takeover, bypassing conversational AI.
 */
export type DangerSignDomain =
  | 'maternal_antepartum'
  | 'maternal_postpartum'
  | 'neonatal'
  | 'infant';

export type DangerSignUrgency = 'immediate_emergency' | 'urgent_referral' | 'warning';

export interface DangerSignAlert {
  readonly id: string;
  readonly domain: DangerSignDomain;
  readonly symptoms: readonly string[];
  readonly urgency: DangerSignUrgency;
  readonly requiresImmediateSOS: boolean; // If true, triggers SCR-21 emergency dialer takeover
  readonly recommendedAction: string;
  readonly recommendedActionSw: string;
  readonly matchedKeywords: readonly string[];
  readonly detectedAt: string; // ISO 8601 timestamp
  readonly motherId?: string;
  readonly childId?: string;
  readonly facilityEmergencyPhone?: string;
}
