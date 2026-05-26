export interface Facility {
  id: string;
  name: string;
  location?: string;
  facility_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Nurse {
  id: string;
  facility_id?: string;
  full_name: string;
  email: string;
  role?: 'nurse' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
export type CaregiverType = 'mother' | 'father' | 'guardian';
export type PregnancyStatus = 'pregnant' | 'postpartum' | 'not_pregnant';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

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
  date_of_birth?: string;
  blood_group?: BloodGroup;
  caregiver_type?: CaregiverType;
  pregnancy_status?: PregnancyStatus;
  lmp?: string;
  edd?: string;
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
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type Gender = 'male' | 'female';
export type BirthType = 'normal' | 'caesarean' | 'assisted';
export type HealthStatus = 'healthy' | 'monitor' | 'at_risk' | 'critical';

export interface Child {
  id: string;
  mother_id?: string;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  birth_weight_kg?: number;
  birth_height_cm?: number;
  birth_facility?: string;
  birth_type?: BirthType;
  gestational_age_weeks?: number;
  health_status?: HealthStatus;
  last_visit_date?: string;
  next_visit_date?: string;
  avatar_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type UrineProtein = 'negative' | 'trace' | '1+' | '2+' | '3+';
export type HivStatus = 'negative' | 'positive' | 'not_tested' | 'declined';

export interface ANCVisit {
  id: string;
  mother_id?: string;
  visit_number?: number;
  visit_date: string;
  gestational_age_weeks?: number;
  facility?: string;
  clinician_name?: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  weight_kg?: number;
  fundal_height_cm?: number;
  fetal_heart_rate?: number;
  haemoglobin?: number;
  urine_protein?: UrineProtein;
  hiv_status?: HivStatus;
  ttv_given?: boolean;
  ifas_given?: boolean;
  llin_given?: boolean;
  next_visit_date?: string;
  danger_signs?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type NutritionStatus = 'normal' | 'mam' | 'sam' | 'overweight';

export interface GrowthRecord {
  id: string;
  child_id?: string;
  recorded_date: string;
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
  facility?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type ImmunizationStatus = 'scheduled' | 'due' | 'overdue' | 'given' | 'missed';

export interface Immunization {
  id: string;
  child_id?: string;
  vaccine_name: string;
  vaccine_code?: string;
  scheduled_date: string;
  given_date?: string;
  status?: ImmunizationStatus;
  dose_number?: number;
  facility?: string;
  administered_by?: string;
  batch_number?: string;
  notes?: string;
  age_weeks?: number;
  created_at?: string;
  updated_at?: string;
}

export type MilestoneCategory = 'motor' | 'language' | 'social' | 'cognitive' | 'feeding';
export type MilestoneStatus = 'upcoming' | 'due' | 'achieved' | 'delayed';

export interface Milestone {
  id: string;
  child_id?: string;
  category?: MilestoneCategory;
  milestone_name: string;
  milestone_name_sw?: string;
  expected_age_weeks?: number;
  expected_age_months?: number;
  achieved_date?: string;
  status?: MilestoneStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type LearningCategory = 'breastfeeding' | 'nutrition' | 'immunization' | 'hygiene' | 'development' | 'pregnancy' | 'danger_signs' | 'family_planning';
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

export type AlertType = 'growth_anomaly' | 'missed_vaccine' | 'missed_anc' | 'risk_flag' | 'chv_visit' | 'danger_sign' | 'reminder' | 'achievement';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AIAlert {
  id: string;
  mother_id?: string;
  child_id?: string;
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
  ai_confidence?: number;
  created_at?: string;
  updated_at?: string;
}
