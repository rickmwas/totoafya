# TOTOAFYA DIGITAL — AUTHORIZATION ENFORCEMENT SPECIFICATION

**Document ID:** `DOC-SEC-AUTH-06`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/06-AUTHORIZATION-ENFORCEMENT-SPEC.md`  

---

## 1. Defense-in-Depth Layered Architecture

Security in TotoAfya Digital is enforced across four distinct architectural layers:

```text
Layer 1: Frontend Client (UX Customization & Input Sanitization)
  └── Layer 2: API Gateway / Server Middleware (Route Guards & JWT Validation)
       └── Layer 3: Edge Functions (Privileged Operations & Input Schema Validation)
            └── Layer 4: PostgreSQL Engine (Row-Level Security, Triggers & Constraints)
```

### 1.1 Layer Enforcement Responsibilities

| Layer | Responsibility | Security Boundary Status | Fail-Closed Mechanism |
| :--- | :--- | :--- | :--- |
| **Layer 1: Frontend** | UX rendering, form validation, route hiding | NOT A SECURITY BOUNDARY | Redirect to `/login` |
| **Layer 2: API Gateway**| JWT signature check, CORS preflight, rate limiting | Edge Security Boundary | Return `HTTP 401 Unauthorized` |
| **Layer 3: Edge Functions**| Caller authentication, payload validation, service role | Service Security Boundary | Return `HTTP 403 Forbidden` |
| **Layer 4: PostgreSQL RLS**| Engine-level row/column filtering & constraints | **PRIMARY SECURITY BOUNDARY** | Return 0 rows / `RAISE EXCEPTION` |

---

## 2. Security Rule Enforcement Layer Matrix

| Security Rule | Frontend | API / Gateway | Edge Function | PostgreSQL RLS |
| :--- | :---: | :---: | :---: | :---: |
| **Route Navigation Protection** | Primary (UX) | Secondary | N/A | N/A |
| **Unauthenticated API Rejection** | N/A | Primary | Primary | Primary |
| **User Role Verification** | Secondary (UX) | Primary | Primary | Primary |
| **Facility Tenant Data Isolation**| N/A | Secondary | Secondary | **Primary (Mandatory)** |
| **County Scope Data Filtering** | N/A | Secondary | Secondary | **Primary (Mandatory)** |
| **Caregiver Self Record Access** | N/A | Secondary | N/A | **Primary (Mandatory)** |
| **Staff Invitation & Account Creation**| Form UI | N/A | **Primary (Mandatory)**| Secondary |
| **Emergency Break-Glass Granting**| Form UI | N/A | Secondary | **Primary (Mandatory)** |
| **Audit Log Immutability** | N/A | N/A | N/A | **Primary (Trigger Enforced)**|

---

## 3. Database Row-Level Security (RLS) Specification

All application tables MUST have Row-Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).  
The helper functions `get_user_role()` and `get_user_facility_id()` MUST be hardened to avoid hardcoded emails `[PROVEN FROM DB]` and prevent ambiguous table checks.

```sql
-- =========================================================================
-- HARDENED HELPER FUNCTIONS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
DECLARE
    v_role app_role;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    -- Check staff table
    SELECT role::app_role INTO v_role 
    FROM public.nurses 
    WHERE user_id = auth.uid() AND status = 'active';
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Check mother table
    SELECT 'mother'::app_role INTO v_role 
    FROM public.mothers 
    WHERE user_id = auth.uid();
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    RETURN 'mother'::app_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_facility_id()
RETURNS UUID AS $$
DECLARE
    v_facility_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    -- Check nurse staff assignment
    SELECT facility_id INTO v_facility_id 
    FROM public.nurses 
    WHERE user_id = auth.uid() AND status = 'active';
    
    IF v_facility_id IS NOT NULL THEN
        RETURN v_facility_id;
    END IF;

    -- Check mother registration facility
    SELECT facility_id INTO v_facility_id 
    FROM public.mothers 
    WHERE user_id = auth.uid();
    
    RETURN v_facility_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### 3.1 Hardened RLS Policy Definitions

#### Table: `mothers`
```sql
ALTER TABLE public.mothers ENABLE ROW LEVEL SECURITY;

-- 1. Caregiver Self Read/Update
CREATE POLICY "mothers_self_access" ON public.mothers
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2. Facility Staff Operational Access
CREATE POLICY "mothers_facility_staff_access" ON public.mothers
    FOR ALL TO authenticated
    USING (
        get_user_role() IN ('facility_admin', 'doctor', 'nurse', 'chv') 
        AND facility_id = get_user_facility_id()
    )
    WITH CHECK (
        get_user_role() IN ('facility_admin', 'doctor', 'nurse', 'chv') 
        AND facility_id = get_user_facility_id()
    );

-- 3. County Admin Read-Only
CREATE POLICY "mothers_county_admin_read" ON public.mothers
    FOR SELECT TO authenticated
    USING (
        get_user_role() = 'county_admin' 
        AND county = (SELECT county FROM public.nurses WHERE user_id = auth.uid() LIMIT 1)
    );

-- 4. Super Admin Break-Glass Access
CREATE POLICY "mothers_super_admin_break_glass" ON public.mothers
    FOR SELECT TO authenticated
    USING (
        get_user_role() = 'super_admin' 
        AND EXISTS (
            SELECT 1 FROM public.temporary_grants 
            WHERE user_id = auth.uid() AND record_id = mothers.id AND expires_at > NOW()
        )
    );
```

#### Table: `anc_visits`
```sql
ALTER TABLE public.anc_visits ENABLE ROW LEVEL SECURITY;

-- 1. Caregiver Read Own Visits
CREATE POLICY "anc_visits_mother_read" ON public.anc_visits
    FOR SELECT TO authenticated
    USING ((SELECT user_id FROM public.mothers WHERE id = mother_id) = auth.uid());

-- 2. Clinical Staff Manage Facility Encounters (SELECT, INSERT, UPDATE)
CREATE POLICY "anc_visits_staff_manage" ON public.anc_visits
    FOR ALL TO authenticated
    USING (
        get_user_role() IN ('facility_admin', 'doctor', 'nurse') 
        AND (SELECT facility_id FROM public.mothers WHERE id = mother_id) = get_user_facility_id()
    )
    WITH CHECK (
        get_user_role() IN ('facility_admin', 'doctor', 'nurse') 
        AND (SELECT facility_id FROM public.mothers WHERE id = mother_id) = get_user_facility_id()
    );
```

---

## 4. Privileged Operations & Service-Role Security Contract

Edge Functions or server actions that utilize the `SUPABASE_SERVICE_ROLE_KEY` operate with full database administrative privilege, bypassing all RLS.

### 4.1 Non-Negotiable Edge Function Security Rules

```typescript
// MANDATORY CALLER AUTHENTICATION IN EDGE FUNCTIONS
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
}

const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabaseClient.auth.getUser(token);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
}

// MANDATORY CALLER AUTHORIZATION CHECK
const { data: nurse } = await supabaseClient
  .from('nurses')
  .select('role, facility_id')
  .eq('user_id', user.id)
  .single();

if (!nurse || !['facility_admin', 'super_admin'].includes(nurse.role)) {
  return new Response(JSON.stringify({ error: 'Insufficient privilege' }), { status: 403 });
}
```

- **Rule 1**: Edge Functions MUST NEVER accept wildcard CORS (`Access-Control-Allow-Origin: "*"`) on privileged endpoints `[PROVEN FROM CODE]`. Origin must be restricted to verified application domains.
- **Rule 2**: Every service-role operation MUST validate caller JWT identity and role BEFORE executing any mutation or admin operation.
- **Rule 3**: All service-role operations MUST record an audit entry in `public.audit_logs`.

---
*End of Document 06 — Authorization Enforcement Specification.*
