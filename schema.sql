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
    level TEXT,
    county TEXT,
    sub_county TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
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
    county TEXT, -- Optional county assignment for county admins
    pin_code TEXT, -- 4-6 digit clinical access PIN
    badge_token TEXT UNIQUE, -- Badge tag identifier (NFC/RFID)
    employee_id TEXT,
    phone TEXT,
    designation TEXT,
    status TEXT DEFAULT 'pending_activation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_nurses_updated_at ON nurses;
CREATE TRIGGER update_nurses_updated_at
    BEFORE UPDATE ON nurses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2.1 TEMPORARY GRANTS Table (For super admin break-glass access)
CREATE TABLE IF NOT EXISTS temporary_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    record_id UUID NOT NULL, -- Target record ID (e.g. mother_id)
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);


-- 3. MOTHERS Table (Maternal / Caregiver details)
CREATE TABLE IF NOT EXISTS mothers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    national_id TEXT UNIQUE,
    anc_number TEXT UNIQUE,
    full_name TEXT NOT NULL,
    pin_code TEXT, -- 6-digit security PIN for device unlock/auth
    activation_code TEXT, -- Hashed or clear 6-digit activation code
    activation_expires_at TIMESTAMPTZ,
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

DROP TRIGGER IF EXISTS update_mothers_updated_at ON mothers;
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

DROP TRIGGER IF EXISTS update_children_updated_at ON children;
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

DROP TRIGGER IF EXISTS update_anc_visits_updated_at ON anc_visits;
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

DROP TRIGGER IF EXISTS update_growth_records_updated_at ON growth_records;
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

DROP TRIGGER IF EXISTS update_immunizations_updated_at ON immunizations;
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

DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
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

DROP TRIGGER IF EXISTS update_learning_contents_updated_at ON learning_contents;
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

DROP TRIGGER IF EXISTS update_ai_alerts_updated_at ON ai_alerts;
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
CREATE INDEX IF NOT EXISTS idx_anc_visits_mother_date ON anc_visits(mother_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_growth_records_child_date ON growth_records(child_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_immunizations_child_date ON immunizations(child_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_mother_created ON ai_alerts(mother_id, created_at DESC);

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
    IF v_email = 'cto@terraseptsolutions.com' THEN
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
ALTER TABLE temporary_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE anc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;

-- A. FACILITIES policies
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON facilities;
CREATE POLICY "Allow read access to authenticated users" 
    ON facilities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Super admin facilities write access" ON facilities;
CREATE POLICY "Super admin facilities write access" 
    ON facilities FOR ALL TO authenticated 
    USING (get_user_role() = 'super_admin');

-- B. NURSES policies
DROP POLICY IF EXISTS "Allow super admins full access to nurses" ON nurses;
CREATE POLICY "Allow super admins full access to nurses"
    ON nurses FOR ALL TO authenticated
    USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Allow facility admins to manage facility nurses" ON nurses;
CREATE POLICY "Allow facility admins to manage facility nurses"
    ON nurses FOR ALL TO authenticated
    USING (get_user_role() = 'admin' AND facility_id = get_user_facility_id());

DROP POLICY IF EXISTS "Allow nurses to view other nurses at same facility" ON nurses;
CREATE POLICY "Allow nurses to view other nurses at same facility"
    ON nurses FOR SELECT TO authenticated
    USING (facility_id = get_user_facility_id());

DROP POLICY IF EXISTS "Allow nurses to update their own profile" ON nurses;
CREATE POLICY "Allow nurses to update their own profile"
    ON nurses FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- B.1 TEMPORARY GRANTS policies
DROP POLICY IF EXISTS "Allow super admins full access to temporary grants" ON temporary_grants;
CREATE POLICY "Allow super admins full access to temporary grants"
    ON temporary_grants FOR ALL TO authenticated
    USING (get_user_role() = 'super_admin');

-- C. MOTHERS policies
DROP POLICY IF EXISTS "Super admins break-glass access to mothers" ON mothers;
CREATE POLICY "Super admins break-glass access to mothers"
    ON mothers FOR ALL TO authenticated 
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = mothers.id 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage facility mothers" ON mothers;
CREATE POLICY "Facility staff manage facility mothers"
    ON mothers FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND facility_id = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view mothers in county" ON mothers;
CREATE POLICY "County admins view mothers in county"
    ON mothers FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND county = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers select and update own profile" ON mothers;
CREATE POLICY "Mothers select and update own profile"
    ON mothers FOR ALL TO authenticated
    USING (
        user_id = auth.uid() 
        OR (
            user_id IS NULL 
            AND (
                auth.jwt() ->> 'email' = concat(replace(lower(national_id), ' ', ''), '@totoafya.org')
                OR auth.jwt() ->> 'email' = concat(replace(lower(anc_number), ' ', ''), '@totoafya.org')
            )
        )
    );

-- D. CHILDREN policies
DROP POLICY IF EXISTS "Super admins break-glass access to children" ON children;
CREATE POLICY "Super admins break-glass access to children"
    ON children FOR ALL TO authenticated 
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = mother_id 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage facility children" ON children;
CREATE POLICY "Facility staff manage facility children"
    ON children FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND (SELECT facility_id FROM mothers WHERE id = mother_id) = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view children in county" ON children;
CREATE POLICY "County admins view children in county"
    ON children FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND (SELECT county FROM mothers WHERE id = mother_id) = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers full access to own children" ON children;
CREATE POLICY "Mothers full access to own children"
    ON children FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = mother_id) = auth.uid());

-- E. ANC VISITS policies
DROP POLICY IF EXISTS "Super admins break-glass access to visits" ON anc_visits;
CREATE POLICY "Super admins break-glass access to visits"
    ON anc_visits FOR ALL TO authenticated
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = mother_id 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage visits" ON anc_visits;
CREATE POLICY "Facility staff manage visits"
    ON anc_visits FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND (SELECT facility_id FROM mothers WHERE id = mother_id) = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view visits in county" ON anc_visits;
CREATE POLICY "County admins view visits in county"
    ON anc_visits FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND (SELECT county FROM mothers WHERE id = mother_id) = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers view own visits" ON anc_visits;
CREATE POLICY "Mothers view own visits"
    ON anc_visits FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = mother_id) = auth.uid());

-- F. GROWTH RECORDS policies
DROP POLICY IF EXISTS "Super admins break-glass access to growth records" ON growth_records;
CREATE POLICY "Super admins break-glass access to growth records"
    ON growth_records FOR ALL TO authenticated
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = (SELECT mother_id FROM children WHERE id = child_id) 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage growth records" ON growth_records;
CREATE POLICY "Facility staff manage growth records"
    ON growth_records FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND (SELECT facility_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view growth records in county" ON growth_records;
CREATE POLICY "County admins view growth records in county"
    ON growth_records FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND (SELECT county FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers view own child growth records" ON growth_records;
CREATE POLICY "Mothers view own child growth records"
    ON growth_records FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = auth.uid());

-- G. IMMUNIZATIONS policies
DROP POLICY IF EXISTS "Super admins break-glass access to immunizations" ON immunizations;
CREATE POLICY "Super admins break-glass access to immunizations"
    ON immunizations FOR ALL TO authenticated
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = (SELECT mother_id FROM children WHERE id = child_id) 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage immunizations" ON immunizations;
CREATE POLICY "Facility staff manage immunizations"
    ON immunizations FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND (SELECT facility_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view immunizations in county" ON immunizations;
CREATE POLICY "County admins view immunizations in county"
    ON immunizations FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND (SELECT county FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers manage child immunizations" ON immunizations;
CREATE POLICY "Mothers manage child immunizations"
    ON immunizations FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = auth.uid());

-- H. MILESTONES policies
DROP POLICY IF EXISTS "Super admins break-glass access to milestones" ON milestones;
CREATE POLICY "Super admins break-glass access to milestones"
    ON milestones FOR ALL TO authenticated
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = (SELECT mother_id FROM children WHERE id = child_id) 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage milestones" ON milestones;
CREATE POLICY "Facility staff manage milestones"
    ON milestones FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND (SELECT facility_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view milestones in county" ON milestones;
CREATE POLICY "County admins view milestones in county"
    ON milestones FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND (SELECT county FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers manage child milestones" ON milestones;
CREATE POLICY "Mothers manage child milestones"
    ON milestones FOR ALL TO authenticated
    USING ((SELECT user_id FROM mothers WHERE id = (SELECT mother_id FROM children WHERE id = child_id)) = auth.uid());

-- I. AI ALERTS policies
DROP POLICY IF EXISTS "Super admins break-glass access to alerts" ON ai_alerts;
CREATE POLICY "Super admins break-glass access to alerts"
    ON ai_alerts FOR ALL TO authenticated
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM temporary_grants 
            WHERE user_id = auth.uid() 
              AND record_id = mother_id 
              AND expires_at > NOW()
        )
    );

DROP POLICY IF EXISTS "Facility staff manage alerts" ON ai_alerts;
CREATE POLICY "Facility staff manage alerts"
    ON ai_alerts FOR ALL TO authenticated
    USING (get_user_role() IN ('admin', 'nurse', 'doctor', 'chv') AND (SELECT facility_id FROM mothers WHERE id = mother_id) = get_user_facility_id());

DROP POLICY IF EXISTS "County admins view alerts in county" ON ai_alerts;
CREATE POLICY "County admins view alerts in county"
    ON ai_alerts FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND (SELECT county FROM mothers WHERE id = mother_id) = (SELECT county FROM nurses WHERE user_id = auth.uid() LIMIT 1)
    );

DROP POLICY IF EXISTS "Mothers view own alerts" ON ai_alerts;
CREATE POLICY "Mothers view own alerts"
    ON ai_alerts FOR ALL TO authenticated
    USING (mother_id = (SELECT id FROM mothers WHERE user_id = auth.uid()));

-- J. LEARNING CONTENTS policies
DROP POLICY IF EXISTS "Allow all authenticated users to read learning content" ON learning_contents;
CREATE POLICY "Allow all authenticated users to read learning content"
    ON learning_contents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow super admins and content admins to manage content" ON learning_contents;
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

DROP TRIGGER IF EXISTS update_developer_concerns_updated_at ON developer_concerns;
CREATE TRIGGER update_developer_concerns_updated_at
    BEFORE UPDATE ON developer_concerns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_developer_concerns_facility ON developer_concerns(facility_id);

ALTER TABLE developer_concerns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow facility staff to manage facility concerns" ON developer_concerns;
CREATE POLICY "Allow facility staff to manage facility concerns"
    ON developer_concerns FOR ALL TO authenticated
    USING (facility_id = get_user_facility_id());

DROP POLICY IF EXISTS "Allow super admins full access to concerns" ON developer_concerns;
CREATE POLICY "Allow super admins full access to concerns"
    ON developer_concerns FOR ALL TO authenticated
    USING (get_user_role() = 'super_admin');

-- L. AUDITING AND TEMPORARY GRANTS SCHEMA (Break-Glass)
CREATE TABLE IF NOT EXISTS temporary_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    record_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operator_role TEXT NOT NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    affected_record_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS block_audit_log_changes ON audit_logs;
CREATE TRIGGER block_audit_log_changes
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

CREATE OR REPLACE FUNCTION request_emergency_access(p_record_id UUID, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_role := get_user_role();
    
    IF v_role NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Only administrators can request emergency break-glass access';
    END IF;

    -- Write immutable audit
    INSERT INTO audit_logs (operator_id, operator_role, action, affected_record_id, new_value)
    VALUES (auth.uid(), v_role, 'BREAK_GLASS_ACCESS_REQUESTED', p_record_id, jsonb_build_object('reason', p_reason));

    -- Assign temporary grant (1 hour duration)
    INSERT INTO temporary_grants (user_id, record_id, expires_at, reason)
    VALUES (auth.uid(), p_record_id, NOW() + INTERVAL '1 hour', p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_and_activate_mother(
    p_identifier TEXT,
    p_activation_code TEXT,
    p_user_id UUID,
    p_pin_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_mother_id UUID;
    v_db_code TEXT;
    v_db_expiry TIMESTAMPTZ;
BEGIN
    -- Find mother by national_id or anc_number where user_id is NULL (unactivated)
    SELECT id, activation_code, activation_expires_at 
    INTO v_mother_id, v_db_code, v_db_expiry
    FROM mothers 
    WHERE (replace(lower(national_id), ' ', '') = replace(lower(p_identifier), ' ', '')
       OR replace(lower(anc_number), ' ', '') = replace(lower(p_identifier), ' ', ''))
      AND user_id IS NULL
    LIMIT 1;

    IF v_mother_id IS NULL THEN
        -- Check if already activated
        IF EXISTS (
            SELECT 1 FROM mothers 
            WHERE (replace(lower(national_id), ' ', '') = replace(lower(p_identifier), ' ', '')
               OR replace(lower(anc_number), ' ', '') = replace(lower(p_identifier), ' ', ''))
              AND user_id IS NOT NULL
        ) THEN
            RAISE EXCEPTION 'Profile is already activated. Please sign in directly.';
        ELSE
            RAISE EXCEPTION 'Profile record not found. Please contact your health facility.';
        END IF;
    END IF;

    -- Verify activation code (if expiry is set and past, or doesn't match)
    IF v_db_expiry IS NOT NULL AND v_db_expiry < NOW() THEN
        RAISE EXCEPTION 'Activation code has expired. Please request a new one at the facility.';
    END IF;

    IF v_db_code IS NULL OR v_db_code <> p_activation_code THEN
        RAISE EXCEPTION 'Invalid activation code.';
    END IF;

    -- Activation code matches. Update profile with user_id, pin_code, complete profile, and clear code
    UPDATE mothers 
    SET user_id = p_user_id,
        pin_code = p_pin_code,
        profile_complete = TRUE,
        activation_code = NULL,
        activation_expires_at = NULL
    WHERE id = v_mother_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- K. FEATURE FLAGS CONFIGURATION
DROP TABLE IF EXISTS feature_flags CASCADE;
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for auto updated_at
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to read flags" ON feature_flags;
CREATE POLICY "Allow all authenticated users to read flags"
    ON feature_flags FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Allow super admins to manage feature flags" ON feature_flags;
CREATE POLICY "Allow super admins to manage feature flags"
    ON feature_flags FOR ALL TO authenticated
    USING (get_user_role() = 'super_admin')
    WITH CHECK (get_user_role() = 'super_admin');

-- Seed initial feature flags
INSERT INTO feature_flags (name, description, is_enabled)
VALUES 
    ('enable-chatbot', 'Enables/disables the AI health chat assistant chatbot in the caregiver portal.', TRUE),
    ('enable-learning-hub', 'Enables/disables the Learning Hub (bilingual health education hub) in the caregiver portal.', TRUE),
    ('enable-danger-signs-red-alerts', 'Enables/disables the red high-risk alerts and indicators in the clinician portal.', TRUE)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- L. SYSTEM EXCEPTIONS & APPLICATION LOGS
CREATE TABLE IF NOT EXISTS system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role TEXT,
    error_code TEXT,
    message TEXT NOT NULL,
    stack_trace TEXT,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to log exceptions" ON system_errors;
CREATE POLICY "Allow all authenticated users to log exceptions"
    ON system_errors FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow administrators to read errors" ON system_errors;
CREATE POLICY "Allow administrators to read errors"
    ON system_errors FOR SELECT TO authenticated
    USING (get_user_role() IN ('super_admin', 'admin'));

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role TEXT,
    log_type TEXT NOT NULL,
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to insert system logs" ON system_logs;
CREATE POLICY "Allow all authenticated users to insert system logs"
    ON system_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow administrators to read system logs" ON system_logs;
CREATE POLICY "Allow administrators to read system logs"
    ON system_logs FOR SELECT TO authenticated
    USING (get_user_role() IN ('super_admin', 'admin'));

-- M. IMMUTABLE AUDIT LOGS TRIGGER
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Direct updates or deletions are prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS block_audit_log_modification ON audit_logs;
CREATE TRIGGER block_audit_log_modification
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- N. AUTOMATIC STAFF SIGNUP LINKING TRIGGER
CREATE OR REPLACE FUNCTION public.handle_staff_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Only link if the email confirmation is completed
    IF NEW.email_confirmed_at IS NULL THEN
        RETURN NEW;
    END IF;

    UPDATE public.nurses
    SET user_id = NEW.id
    WHERE LOWER(email) = LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_staff_auth_signup ON auth.users;
CREATE TRIGGER on_staff_auth_signup
    AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_staff_signup();

-- O. INCREMENTAL COLUMNS FOR EXISTING DATABASES
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS county TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS sub_county TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_activation';

-- Enable RLS and add update profile policy
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow nurses to update their own profile" ON public.nurses;
CREATE POLICY "Allow nurses to update their own profile"
    ON public.nurses FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

