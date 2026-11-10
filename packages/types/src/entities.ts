/**
 * TotoAfya Digital — Domain Entity Models
 * Canonical TypeScript definitions adhering strictly to:
 * - context/architecture.md & context/code-standards.md
 * - design/mother-experience/03-information-architecture/INFORMATION_ARCHITECTURE.md
 * - ZERO 'any' types guarantee.
 */

import type {
  BloodGroup,
  CaregiverType,
  PregnancyStatus,
  RiskLevel,
  Gender,
  BirthType,
  HealthStatus,
  UrineProtein,
  HivStatus,
  NutritionStatus,
  ImmunizationStatus,
  MilestoneCategory,
  MilestoneStatus,
} from './clinical';

export interface Facility {
  id: string;
  name: string;
  location?: string;
  facility_code?: string;
  level?: string;
  county?: string;
  sub_county?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Nurse {
  id: string;
  user_id?: string;
  facility_id?: string;
  full_name: string;
  email: string;
  role?: 'nurse' | 'admin' | 'facility_admin';
  employee_id?: string;
  phone?: string;
  designation?: string;
  status?: 'pending_activation' | 'active' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface Mother {
  id: string;
  facility_id?: string;
  user_id?: string;
  national_id?: string;
  anc_number?: string;
  full_name: string;
  phone?: string;
  county?: string;
  sub_county?: string;
  ward?: string;
  date_of_birth?: string;
  blood_group?: BloodGroup;
  caregiver_type?: CaregiverType;
  pregnancy_status?: PregnancyStatus;
  lmp?: string; // ISO date string YYYY-MM-DD
  edd?: string; // ISO date string YYYY-MM-DD
  edd_calculation_method?: 'lmp_naegele' | 'ultrasound' | 'guided_estimate';
  gestational_age_weeks?: number;
  gravida?: number;
  parity?: number;
  risk_score?: number;
  risk_level?: RiskLevel;
  chv_alerted?: boolean;
  facility_name?: string;
  facility_phone?: string;
  facility_emergency_phone?: string;
  language_preference?: 'en' | 'sw';
  profile_complete?: boolean;
  subscription_status?: 'active' | 'trial' | 'expired' | 'sponsored';
  subscription_plan?: string;
  subscription_expires_at?: string;
  avatar_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bereavement_mode?: boolean; // SCR-28 sensitive journey support
  bereavement_date?: string;
  version_id?: number; // Concurrency tracking
  created_at?: string;
  updated_at?: string;
}

export interface Child {
  id: string;
  mother_id?: string;
  facility_id?: string;
  full_name: string;
  date_of_birth: string; // ISO date string YYYY-MM-DD
  gender: Gender;
  birth_weight_kg?: number;
  birth_height_cm?: number;
  birth_head_circumference_cm?: number;
  birth_facility?: string;
  birth_type?: BirthType;
  gestational_age_weeks?: number;
  health_status?: HealthStatus;
  muac_status?: 'normal' | 'mam' | 'sam';
  last_visit_date?: string;
  next_visit_date?: string;
  avatar_url?: string;
  notes?: string;
  is_active_profile?: boolean;
  is_twin_or_multiple?: boolean;
  version_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ANCVisit {
  id: string;
  mother_id?: string;
  facility_id?: string;
  visit_number?: number; // 1 to 8 contact schedule per Kenya MoH
  visit_date: string; // ISO date string YYYY-MM-DD
  gestational_age_weeks?: number;
  gestational_age_days?: number;
  facility?: string;
  clinician_name?: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  weight_kg?: number;
  fundal_height_cm?: number;
  fetal_heart_rate?: number;
  haemoglobin?: number; // g/dL
  urine_protein?: UrineProtein;
  hiv_status?: HivStatus;
  blood_glucose_mmol_l?: number;
  ttv_given?: boolean; // Tetanus Toxoid Vaccine
  ifas_given?: boolean; // Iron & Folic Acid Supplementation
  llin_given?: boolean; // Long Lasting Insecticidal Net
  malaria_prophylaxis_given?: boolean;
  deworming_given?: boolean;
  danger_signs?: string[];
  risk_level?: RiskLevel;
  next_visit_date?: string;
  notes?: string;
  created_by_role?: 'mother' | 'nurse' | 'facility_admin' | 'chv';
  version_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GrowthRecord {
  id: string;
  child_id?: string;
  facility_id?: string;
  recorded_date: string; // ISO date string YYYY-MM-DD
  age_weeks?: number;
  age_months?: number;
  weight_kg?: number;
  height_cm?: number;
  muac_cm?: number;
  head_circumference_cm?: number;
  weight_for_age_zscore?: number;
  height_for_age_zscore?: number;
  weight_for_height_zscore?: number;
  nutrition_status?: NutritionStatus;
  recorded_by?: string;
  recorded_by_role?: 'mother' | 'nurse' | 'facility_admin' | 'chv';
  facility?: string;
  notes?: string;
  version_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ImmunizationRecord {
  id: string;
  child_id?: string;
  facility_id?: string;
  vaccine_name: string;
  vaccine_code?: string;
  dose_number?: number;
  scheduled_date: string; // ISO date string YYYY-MM-DD
  given_date?: string; // ISO date string YYYY-MM-DD
  status?: ImmunizationStatus;
  target_disease?: string;
  facility?: string;
  administered_by?: string;
  administered_by_role?: 'nurse' | 'chv';
  batch_number?: string;
  manufacturer?: string;
  site_of_administration?: 'left_upper_arm' | 'right_upper_arm' | 'left_thigh' | 'right_thigh' | 'oral';
  adverse_effects_noted?: string;
  notes?: string;
  age_weeks?: number;
  version_id?: number;
  created_at?: string;
  updated_at?: string;
}

/** Backward-compatible alias for existing codebase */
export type Immunization = ImmunizationRecord;

export interface MilestoneRecord {
  id: string;
  child_id?: string;
  facility_id?: string;
  category?: MilestoneCategory;
  milestone_name: string;
  milestone_name_sw?: string;
  expected_age_weeks?: number;
  expected_age_months?: number;
  achieved_date?: string;
  status?: MilestoneStatus;
  observations?: string;
  notes?: string;
  version_id?: number;
  created_at?: string;
  updated_at?: string;
}

/** Backward-compatible alias for existing codebase */
export type Milestone = MilestoneRecord;

export type LearningCategory =
  | 'breastfeeding'
  | 'nutrition'
  | 'immunization'
  | 'hygiene'
  | 'development'
  | 'pregnancy'
  | 'danger_signs'
  | 'family_planning';

export type LearningContentType = 'video' | 'audio' | 'article' | 'infographic';

export interface LearningContent {
  id: string;
  title: string;
  title_sw?: string;
  description?: string;
  description_sw?: string;
  category?: LearningCategory;
  content_type?: LearningContentType;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  language?: 'en' | 'sw' | 'both';
  target_audience?: 'pregnant' | 'newborn' | 'infant' | 'toddler' | 'all';
  age_min_weeks?: number;
  age_max_weeks?: number;
  is_featured?: boolean;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type AlertType =
  | 'growth_anomaly'
  | 'missed_vaccine'
  | 'missed_anc'
  | 'risk_flag'
  | 'chv_visit'
  | 'danger_sign'
  | 'reminder'
  | 'achievement';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AIAlert {
  id: string;
  mother_id?: string;
  child_id?: string;
  facility_id?: string;
  alert_type?: AlertType;
  severity?: AlertSeverity;
  title: string;
  title_sw?: string;
  message: string;
  message_sw?: string;
  action_label?: string;
  action_url?: string;
  is_read?: boolean;
  is_resolved?: boolean;
  resolved_date?: string;
  resolved_by?: string;
  ai_confidence?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'auth' | 'export' | string;

export interface AuditLog {
  id: string;
  user_id?: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  facility_id?: string;
  action: AuditAction;
  entity?: string;
  entity_type?: string;
  event_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>; // ZERO 'any' types per code-standards.md
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateAuditLogDTO = Partial<AuditLog> & {
  action: string;
  entity?: string;
};

export interface FacilityCensus {
  facilityId: string;
  totalMothers: number;
  activePregnancies: number;
  totalChildren: number;
  ancVisitsToday: number;
  vaccinesToday: number;
  samCases: number;
  mamCases: number;
}
