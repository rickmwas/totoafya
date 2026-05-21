-- PostgreSQL / Supabase Database Schema
-- Run this in your Supabase SQL Editor.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper trigger function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. FACILITIES Table (Multi-facility Tenant Table)
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    facility_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a default demo facility for testing
INSERT INTO facilities (name, location, facility_code)
VALUES ('Demo Referral Hospital', 'Central Region', 'REF-001')
ON CONFLICT (facility_code) DO NOTHING;

-- 2. NURSES Table (Clinic Staff)
CREATE TABLE IF NOT EXISTS nurses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'nurse',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_nurses_updated_at
    BEFORE UPDATE ON nurses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. MOTHERS Table (Maternal / Caregiver details)
CREATE TABLE IF NOT EXISTS mothers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    user_id TEXT, -- Linked external login user id
    national_id TEXT,
    anc_number TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    county TEXT,
    sub_county TEXT,
    date_of_birth DATE,
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
    caregiver_type TEXT DEFAULT 'mother' CHECK (caregiver_type IN ('mother', 'father', 'guardian')),
    pregnancy_status TEXT DEFAULT 'pregnant' CHECK (pregnancy_status IN ('pregnant', 'postpartum', 'not_pregnant')),
    lmp DATE,
    edd DATE,
    gravida NUMERIC,
    parity NUMERIC,
    risk_score NUMERIC,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    chv_alerted BOOLEAN DEFAULT FALSE,
    facility_name TEXT,
    facility_phone TEXT,
    facility_emergency_phone TEXT,
    language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'sw')),
    profile_complete BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_mothers_updated_at
    BEFORE UPDATE ON mothers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. CHILDREN Table
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mother_id UUID REFERENCES mothers(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    birth_weight_kg NUMERIC,
    birth_height_cm NUMERIC,
    birth_facility TEXT,
    birth_type TEXT DEFAULT 'normal' CHECK (birth_type IN ('normal', 'caesarean', 'assisted')),
    gestational_age_weeks NUMERIC,
    health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'monitor', 'at_risk', 'critical')),
    last_visit_date DATE,
    next_visit_date DATE,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. ANC VISITS Table
CREATE TABLE IF NOT EXISTS anc_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mother_id UUID REFERENCES mothers(id) ON DELETE CASCADE,
    visit_number NUMERIC,
    visit_date DATE NOT NULL,
    gestational_age_weeks NUMERIC,
    facility TEXT,
    clinician_name TEXT,
    blood_pressure_systolic NUMERIC,
    blood_pressure_diastolic NUMERIC,
    weight_kg NUMERIC,
    fundal_height_cm NUMERIC,
    fetal_heart_rate NUMERIC,
    haemoglobin NUMERIC,
    urine_protein TEXT CHECK (urine_protein IN ('negative', 'trace', '1+', '2+', '3+')),
    hiv_status TEXT CHECK (hiv_status IN ('negative', 'positive', 'not_tested', 'declined')),
    ttv_given BOOLEAN DEFAULT FALSE,
    ifas_given BOOLEAN DEFAULT FALSE,
    llin_given BOOLEAN DEFAULT FALSE,
    next_visit_date DATE,
    danger_signs TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_anc_visits_updated_at
    BEFORE UPDATE ON anc_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. GROWTH RECORDS Table
CREATE TABLE IF NOT EXISTS growth_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    age_weeks NUMERIC,
    age_months NUMERIC,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    muac_cm NUMERIC,
    head_circumference_cm NUMERIC,
    weight_for_age_zscore NUMERIC,
    height_for_age_zscore NUMERIC,
    weight_for_height_zscore NUMERIC,
    nutrition_status TEXT DEFAULT 'normal' CHECK (nutrition_status IN ('normal', 'mam', 'sam', 'overweight')),
    recorded_by TEXT,
    facility TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_growth_records_updated_at
    BEFORE UPDATE ON growth_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. IMMUNIZATIONS Table
CREATE TABLE IF NOT EXISTS immunizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    vaccine_code TEXT,
    scheduled_date DATE NOT NULL,
    given_date DATE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'due', 'overdue', 'given', 'missed')),
    dose_number NUMERIC,
    facility TEXT,
    administered_by TEXT,
    batch_number TEXT,
    notes TEXT,
    age_weeks NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_immunizations_updated_at
    BEFORE UPDATE ON immunizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. MILESTONES Table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('motor', 'language', 'social', 'cognitive', 'feeding')),
    milestone_name TEXT NOT NULL,
    milestone_name_sw TEXT,
    expected_age_weeks NUMERIC,
    expected_age_months NUMERIC,
    achieved_date DATE,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'achieved', 'delayed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. LEARNING CONTENTS Table
CREATE TABLE IF NOT EXISTS learning_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_sw TEXT,
    description TEXT,
    description_sw TEXT,
    category TEXT CHECK (category IN ('breastfeeding', 'nutrition', 'immunization', 'hygiene', 'development', 'pregnancy', 'danger_signs', 'family_planning')),
    content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'audio', 'article', 'infographic')),
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds NUMERIC,
    language TEXT DEFAULT 'both' CHECK (language IN ('en', 'sw', 'both')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('pregnant', 'newborn', 'infant', 'toddler', 'all')),
    age_min_weeks NUMERIC,
    age_max_weeks NUMERIC,
    is_featured BOOLEAN DEFAULT false,
    view_count NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_learning_contents_updated_at
    BEFORE UPDATE ON learning_contents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. AI ALERTS Table
CREATE TABLE IF NOT EXISTS ai_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mother_id UUID REFERENCES mothers(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    alert_type TEXT CHECK (alert_type IN ('growth_anomaly', 'missed_vaccine', 'missed_anc', 'risk_flag', 'chv_visit', 'danger_sign', 'reminder', 'achievement')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    title_sw TEXT,
    message TEXT NOT NULL,
    message_sw TEXT,
    action_label TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_date DATE,
    ai_confidence NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_ai_alerts_updated_at
    BEFORE UPDATE ON ai_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- INDEXES for Optimized Query Speed
CREATE INDEX IF NOT EXISTS idx_mothers_facility ON mothers(facility_id);
CREATE INDEX IF NOT EXISTS idx_nurses_facility ON nurses(facility_id);
CREATE INDEX IF NOT EXISTS idx_children_mother ON children(mother_id);
CREATE INDEX IF NOT EXISTS idx_anc_visits_mother ON anc_visits(mother_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_child ON growth_records(child_id);
CREATE INDEX IF NOT EXISTS idx_immunizations_child ON immunizations(child_id);
CREATE INDEX IF NOT EXISTS idx_milestones_child ON milestones(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_mother ON ai_alerts(mother_id);
