-- =========================================================================
-- TotoAfya Digital — Sprint 1 Security Migration: Custom Claims & Outbox
-- Migration: 20261106_custom_claims_and_outbox.sql
-- Description: 
--   1. Implements authoritative custom access token hook (injecting app_metadata claims)
--   2. Hardens get_user_role() and get_user_facility_id() against user_metadata tampering
--   3. Deprecates and drops insecure admin_register_staff stored procedure
--   4. Creates applied_mutations table for idempotent deduplication
--   5. Creates apply_offline_mutations() RPC for transactional outbox batch processing
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. AUTH HOOK: Custom Access Token Hook
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_claims JSONB;
    v_app_metadata JSONB;
    v_role TEXT;
    v_facility_id UUID;
BEGIN
    v_user_id := (event ->> 'user_id')::UUID;
    v_claims := COALESCE(event -> 'claims', '{}'::JSONB);
    v_app_metadata := COALESCE(v_claims -> 'app_metadata', '{}'::JSONB);

    -- 1. Check for Active Staff / Nurse Record
    SELECT role::TEXT, facility_id INTO v_role, v_facility_id
    FROM public.nurses
    WHERE user_id = v_user_id AND status = 'active'
    LIMIT 1;

    -- 2. If not staff, check Mother profile
    IF v_role IS NULL THEN
        SELECT 'mother', facility_id INTO v_role, v_facility_id
        FROM public.mothers
        WHERE user_id = v_user_id
        LIMIT 1;
    END IF;

    -- 3. Default fallback
    v_role := COALESCE(v_role, 'user');

    -- 4. Inject authoritative role and facility_id into app_metadata (immutable by client)
    v_app_metadata := jsonb_set(v_app_metadata, '{role}', to_jsonb(v_role));
    IF v_facility_id IS NOT NULL THEN
        v_app_metadata := jsonb_set(v_app_metadata, '{facility_id}', to_jsonb(v_facility_id));
    END IF;

    v_claims := jsonb_set(v_claims, '{app_metadata}', v_app_metadata);
    RETURN jsonb_set(event, '{claims}', v_claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Grant execution to supabase_auth_admin
DO $$ BEGIN
    GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
    REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) FROM authenticated, anon, public;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;


-- -------------------------------------------------------------------------
-- 2. HARDENED ROLE RESOLUTION FUNCTIONS
-- -------------------------------------------------------------------------

-- Drop old vulnerable implementation of get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
DECLARE
    v_role app_role;
    v_app_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    -- 1. Read authoritative role from JWT app_metadata ONLY (never user_metadata)
    v_app_role := auth.jwt() -> 'app_metadata' ->> 'role';
    
    IF v_app_role = 'super_admin' THEN
        RETURN 'super_admin'::app_role;
    ELSIF v_app_role = 'moh_admin' THEN
        RETURN 'moh_admin'::app_role;
    ELSIF v_app_role = 'county_admin' THEN
        RETURN 'county_admin'::app_role;
    ELSIF v_app_role = 'facility_admin' OR v_app_role = 'admin' THEN
        RETURN 'facility_admin'::app_role;
    ELSIF v_app_role = 'doctor' THEN
        RETURN 'doctor'::app_role;
    ELSIF v_app_role = 'nurse' THEN
        RETURN 'nurse'::app_role;
    ELSIF v_app_role = 'chv' THEN
        RETURN 'chv'::app_role;
    ELSIF v_app_role = 'mother' THEN
        RETURN 'mother'::app_role;
    END IF;

    -- 2. Direct database lookup fallback (active nurses)
    SELECT role INTO v_role 
    FROM public.nurses 
    WHERE user_id = auth.uid() AND status = 'active'
    LIMIT 1;
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 3. Check mother table
    SELECT 'mother'::app_role INTO v_role 
    FROM public.mothers 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    RETURN 'mother'::app_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;


-- Harden get_user_facility_id()
CREATE OR REPLACE FUNCTION public.get_user_facility_id()
RETURNS UUID AS $$
DECLARE
    v_facility_id UUID;
    v_jwt_facility TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    -- 1. Check verified app_metadata claim
    v_jwt_facility := auth.jwt() -> 'app_metadata' ->> 'facility_id';
    IF v_jwt_facility IS NOT NULL AND v_jwt_facility <> '' THEN
        RETURN v_jwt_facility::UUID;
    END IF;

    -- 2. Check nurse staff table
    SELECT facility_id INTO v_facility_id 
    FROM public.nurses 
    WHERE user_id = auth.uid() AND status = 'active'
    LIMIT 1;
    
    IF v_facility_id IS NOT NULL THEN
        RETURN v_facility_id;
    END IF;

    -- 3. Check mother table
    SELECT facility_id INTO v_facility_id 
    FROM public.mothers 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN v_facility_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;


-- -------------------------------------------------------------------------
-- 3. DEPRECATE & DROP INSECURE admin_register_staff PROCEDURE
-- -------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_register_staff(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);


-- -------------------------------------------------------------------------
-- 4. IDEMPOTENT MUTATION OUTBOX TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applied_mutations (
    client_mutation_id UUID PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applied_mutations_applied_at ON public.applied_mutations(applied_at DESC);

ALTER TABLE public.applied_mutations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view applied mutations" ON public.applied_mutations;
CREATE POLICY "Authenticated users can view applied mutations"
    ON public.applied_mutations FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "System can insert applied mutations" ON public.applied_mutations;
CREATE POLICY "System can insert applied mutations"
    ON public.applied_mutations FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = applied_by OR applied_by IS NULL);


-- -------------------------------------------------------------------------
-- 5. TRANSACTIONAL BATCH OUTBOX RPC (apply_offline_mutations)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_offline_mutations(mutations JSONB)
RETURNS JSONB AS $$
DECLARE
    v_item JSONB;
    v_mutation_id UUID;
    v_table TEXT;
    v_record_id UUID;
    v_action TEXT;
    v_payload JSONB;
    v_processed_count INT := 0;
    v_skipped_count INT := 0;
    v_error_count INT := 0;
    v_errors JSONB := '[]'::JSONB;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF jsonb_typeof(mutations) <> 'array' THEN
        RAISE EXCEPTION 'Invalid mutations format: Expected JSON array';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(mutations)
    LOOP
        BEGIN
            v_mutation_id := (v_item ->> 'client_mutation_id')::UUID;
            v_table := v_item ->> 'table';
            v_record_id := (v_item ->> 'record_id')::UUID;
            v_action := LOWER(v_item ->> 'action');
            v_payload := v_item -> 'payload';

            -- 1. Idempotency Check: Skip if already applied
            IF EXISTS (SELECT 1 FROM public.applied_mutations WHERE client_mutation_id = v_mutation_id) THEN
                v_skipped_count := v_skipped_count + 1;
                CONTINUE;
            END IF;

            -- 2. Safe Dynamic Table Dispatch
            IF v_table = 'mothers' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.mothers SELECT * FROM jsonb_populate_record(NULL::public.mothers, v_payload);
                ELSIF v_action = 'update' THEN
                    UPDATE public.mothers SET 
                        phone = COALESCE(v_payload ->> 'phone', phone),
                        risk_level = COALESCE(v_payload ->> 'risk_level', risk_level),
                        pregnancy_status = COALESCE(v_payload ->> 'pregnancy_status', pregnancy_status),
                        updated_at = NOW()
                    WHERE id = v_record_id;
                END IF;

            ELSIF v_table = 'children' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.children SELECT * FROM jsonb_populate_record(NULL::public.children, v_payload);
                ELSIF v_action = 'update' THEN
                    UPDATE public.children SET 
                        health_status = COALESCE(v_payload ->> 'health_status', health_status),
                        updated_at = NOW()
                    WHERE id = v_record_id;
                END IF;

            ELSIF v_table = 'anc_visits' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.anc_visits SELECT * FROM jsonb_populate_record(NULL::public.anc_visits, v_payload);
                ELSIF v_action = 'update' THEN
                    UPDATE public.anc_visits SET 
                        notes = COALESCE(v_payload ->> 'notes', notes),
                        updated_at = NOW()
                    WHERE id = v_record_id;
                END IF;

            ELSIF v_table = 'growth_records' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.growth_records SELECT * FROM jsonb_populate_record(NULL::public.growth_records, v_payload);
                END IF;

            ELSIF v_table = 'immunizations' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.immunizations SELECT * FROM jsonb_populate_record(NULL::public.immunizations, v_payload);
                ELSIF v_action = 'update' THEN
                    UPDATE public.immunizations SET 
                        status = COALESCE(v_payload ->> 'status', status),
                        given_date = COALESCE((v_payload ->> 'given_date')::DATE, given_date),
                        batch_number = COALESCE(v_payload ->> 'batch_number', batch_number),
                        administered_by = COALESCE(v_payload ->> 'administered_by', administered_by),
                        updated_at = NOW()
                    WHERE id = v_record_id;
                END IF;

            ELSIF v_table = 'milestones' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.milestones SELECT * FROM jsonb_populate_record(NULL::public.milestones, v_payload);
                ELSIF v_action = 'update' THEN
                    UPDATE public.milestones SET 
                        status = COALESCE(v_payload ->> 'status', status),
                        achieved_date = COALESCE((v_payload ->> 'achieved_date')::DATE, achieved_date),
                        updated_at = NOW()
                    WHERE id = v_record_id;
                END IF;

            ELSIF v_table = 'ai_alerts' THEN
                IF v_action = 'create' THEN
                    INSERT INTO public.ai_alerts SELECT * FROM jsonb_populate_record(NULL::public.ai_alerts, v_payload);
                ELSIF v_action = 'update' THEN
                    UPDATE public.ai_alerts SET 
                        is_read = COALESCE((v_payload ->> 'is_read')::BOOLEAN, is_read),
                        is_resolved = COALESCE((v_payload ->> 'is_resolved')::BOOLEAN, is_resolved),
                        updated_at = NOW()
                    WHERE id = v_record_id;
                END IF;

            ELSE
                RAISE EXCEPTION 'Table % not permitted for offline mutation outbox', v_table;
            END IF;

            -- 3. Record Successful Mutation
            INSERT INTO public.applied_mutations (client_mutation_id, table_name, record_id, action, applied_by)
            VALUES (v_mutation_id, v_table, v_record_id, v_action, auth.uid());

            v_processed_count := v_processed_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            v_errors := v_errors || jsonb_build_object(
                'client_mutation_id', v_mutation_id,
                'table', v_table,
                'error', SQLERRM
            );
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success', v_error_count = 0,
        'processed_count', v_processed_count,
        'skipped_count', v_skipped_count,
        'error_count', v_error_count,
        'errors', v_errors,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.apply_offline_mutations(JSONB) TO authenticated;
