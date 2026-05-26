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
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'nurse',
    pin_code TEXT, -- 4-6 digit clinical access PIN
    badge_token TEXT UNIQUE, -- Badge tag identifier (NFC/RFID)
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
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    national_id TEXT UNIQUE,
    anc_number TEXT UNIQUE,
    full_name TEXT NOT NULL,
    pin_code TEXT, -- 4-digit security PIN for device unlock/auth
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

-- =========================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Helper function to securely resolve current authenticated user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
    v_email TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get email from auth.users
    SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
    
    -- Super Admin check
    IF v_email = 'super@totoafya.org' THEN
        RETURN 'super_admin';
    END IF;

    -- Nurse or Facility Admin check
    SELECT role INTO v_role FROM nurses WHERE user_id = auth.uid();
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Mother check
    SELECT 'user' INTO v_role FROM mothers WHERE user_id = auth.uid();
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to resolve current user's facility_id
CREATE OR REPLACE FUNCTION get_user_facility_id()
RETURNS UUID AS $$
DECLARE
    v_facility_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    -- Check nurse/admin
    SELECT facility_id INTO v_facility_id FROM nurses WHERE user_id = auth.uid();
    IF v_facility_id IS NOT NULL THEN
        RETURN v_facility_id;
    END IF;

    -- Check mother
    SELECT facility_id INTO v_facility_id FROM mothers WHERE user_id = auth.uid();
    IF v_facility_id IS NOT NULL THEN
        RETURN v_facility_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE anc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;

-- A. FACILITIES policies
CREATE POLICY "Allow read access to authenticated users" 
    ON facilities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin facilities write access" 
    ON facilities FOR ALL TO authenticated 
    USING (get_user_role() = 'super_admin');

-- B. NURSES policies
CREATE POLICY "Allow super admins full access to nurses"
    ON nurses FOR ALL TO authenticated
    USING (get_user_role() = 'super_admin');

CREATE POLICY "Allow facility admins to manage facility nurses"
    ON nurses FOR ALL TO authenticated
    USING (get_user_role() = 'admin' AND facility_id = get_user_facility_id());

CREATE POLICY "Allow nurses to view other nurses at same facility"
    ON nurses FOR SELECT TO authenticated
    USING (facility_id = get_user_facility_id());

-- C. MOTHERS policies
CREATE POLICY "Super admins full access to mothers"
    ON mothers FOR ALL TO authenticated USING (get_user_role() = 'super_admin');

CREATE POLICY "Facility staff manage facility mothers"
    ON mothers FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND facility_id = get_user_facility_id());

CREATE POLICY "Mothers select and update own profile"
    ON mothers FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- D. CHILDREN policies
CREATE POLICY "Super admins full access to children"
    ON children FOR ALL TO authenticated USING (get_user_role() = 'super_admin');

CREATE POLICY "Facility staff manage facility children"
    ON children FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND (SELECT facility_id FROM mothers WHERE id = mother_id) = get_user_facility_id());

CREATE POLICY "Mothers full access to own children"
    ON children FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = mother_id) = auth.uid());

-- E. ANC VISITS policies
CREATE POLICY "Facility staff manage visits"
    ON anc_visits FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND (SELECT facility_id FROM mothers WHERE id = mother_id) = get_user_facility_id());

CREATE POLICY "Mothers view own visits"
    ON anc_visits FOR SELECT TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = mother_id) = auth.uid());

-- F. GROWTH RECORDS policies
CREATE POLICY "Facility staff manage growth records"
    ON growth_records FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND (SELECT facility_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = get_user_facility_id());

CREATE POLICY "Mothers view own child growth records"
    ON growth_records FOR SELECT TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = auth.uid());

-- G. IMMUNIZATIONS policies
CREATE POLICY "Facility staff manage immunizations"
    ON immunizations FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND (SELECT facility_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = get_user_facility_id());

CREATE POLICY "Mothers view child immunizations"
    ON immunizations FOR SELECT TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = auth.uid());

-- H. MILESTONES policies
CREATE POLICY "Facility staff manage milestones"
    ON milestones FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND (SELECT facility_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = get_user_facility_id());

CREATE POLICY "Mothers manage child milestones"
    ON milestones FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = auth.uid());

-- I. AI ALERTS policies
CREATE POLICY "Facility staff manage alerts"
    ON ai_alerts FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse') AND facility_id = get_user_facility_id());

CREATE POLICY "Mothers view own alerts"
    ON ai_alerts FOR SELECT TO authenticated
    USING (mother_id = (SELECT id FROM mothers WHERE user_id = auth.uid()));

-- J. LEARNING CONTENTS policies
CREATE POLICY "Allow all authenticated users to read learning content"
    ON learning_contents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow super admins and content admins to manage content"
    ON learning_contents FOR ALL TO authenticated
    USING (get_user_role() IN ('super_admin', 'admin'));

-- K. DEVELOPER CONCERNS Table
CREATE TABLE IF NOT EXISTS developer_concerns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    nurse_id UUID REFERENCES nurses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_developer_concerns_updated_at
    BEFORE UPDATE ON developer_concerns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_developer_concerns_facility ON developer_concerns(facility_id);

ALTER TABLE developer_concerns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow facility staff to manage facility concerns"
    ON developer_concerns FOR ALL TO authenticated
    USING (facility_id = get_user_facility_id());

CREATE POLICY "Allow super admins full access to concerns"
    ON developer_concerns FOR ALL TO authenticated
    USING (get_user_role() = 'super_admin');


