# TOTOAFYA DIGITAL — SECURITY TEST & THREAT MODEL SPECIFICATION

**Document ID:** `DOC-SEC-AUTH-07`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/07-SECURITY-TEST-THREAT-MODEL.md`  

---

## 1. STRIDE Threat Model & Attack Surface Map

A formal STRIDE analysis was conducted across TotoAfya Digital's architecture:

```text
[ Attacker / Malicious User ]
        │
        ├── (S) Spoofing Caregiver / Staff Identity
        ├── (T) Tampering with Clinical Records / RLS Bypass
        ├── (R) Repudiation of Emergency Access / Audit Wipe
        ├── (I) Information Disclosure of PHI across Facilities
        ├── (D) Denial of Service via Resource Exhaustion
        └── (E) Elevation of Privilege via Role String Mutation
```

### 1.1 STRIDE Threat Threat Taxonomy

| Threat Category | Attack Vector | Impact Level | Mitigation Layer |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Crafting synthetic email `${identifier}@totoafya.org` to claim unlinked mother profile | **CRITICAL** | Server-side activation verification function `verify_and_activate_mother()` |
| **Tampering** | Mutating `immunizations` or `anc_visits` via RLS policy `FOR ALL` policy flaw | **CRITICAL** | Separate SQL policies for `SELECT`, `INSERT`, `UPDATE`; revoke `DELETE` |
| **Repudiation** | Staff performing emergency access without non-repudiable log entry | **HIGH** | Immutable database trigger `prevent_audit_log_modification()` |
| **Info Disclosure**| Bypassing frontend `/facility` route to dump all patient records via PostgREST | **CRITICAL** | Engine-level PostgreSQL RLS filtering on `facility_id = get_user_facility_id()` |
| **Denial of Service**| Bulk registering dummy mothers to hit facility subscription limits | **HIGH** | Rate-limiting Edge Functions & transactional DB validation |
| **Elevation of Privilege**| Calling unauthenticated `invite-staff` Edge Function to set admin password | **CRITICAL** | Validate caller JWT & enforce `facility_admin` role check inside function |

---

## 2. Forensic Audit of Existing Codebase Vulnerabilities

Forensic inspection of the codebase revealed seven severe vulnerability patterns that MUST be remediated prior to production pilot release:

### 2.1 Vulnerability 1: Unauthenticated Service-Role Edge Function (`invite-staff`)
- **Evidence**: `supabase/functions/invite-staff/index.ts` lines 4-7, 57-64 `[PROVEN FROM CODE]`.
- **Flaw**: The Edge Function sets `Access-Control-Allow-Origin: "*"` and accepts unauthenticated POST requests containing `{ email, role }`. It invokes `supabaseClient.auth.admin.updateUserById()` or `createUser()` using `SUPABASE_SERVICE_ROLE_KEY` without checking caller identity or authorization.
- **Risk**: Global remote unauthenticated account takeover and arbitrary admin account creation.

### 2.2 Vulnerability 2: LocalStorage Auth Impersonation & Role Injection
- **Evidence**: `src/api/totoafyaClient.js` lines 198-295 `[PROVEN FROM CODE]`.
- **Flaw**: `auth.me()` and `auth.login()` read `localStorage.getItem('custom_mock_user')` and `localStorage.getItem('active_mock_role')`.
- **Risk**: Any user can open Browser DevTools, set `localStorage.setItem('active_mock_role', 'admin')`, and bypass local authentication controls.

### 2.3 Vulnerability 3: Blanket `FOR ALL` Policies Granting `DELETE` to Mothers & Nurses
- **Evidence**: `schema.sql` lines 453-456, 468-478, 508-510, 603-606 `[PROVEN FROM DB]`.
- **Flaw**: RLS policies for `mothers`, `children`, `anc_visits`, and `immunizations` use `FOR ALL` instead of separate `SELECT`, `INSERT`, `UPDATE` policies.
- **Risk**: Caregivers or nurses can delete maternal records, pediatric files, or immunization histories directly via PostgREST API calls.

### 2.4 Vulnerability 4: Hardcoded Super Admin Email in SQL Function
- **Evidence**: `schema.sql` lines 341-344 `[PROVEN FROM DB]`.
- **Flaw**: `get_user_role()` hardcodes `IF v_email = 'cto@terraseptsolutions.com' THEN RETURN 'super_admin';`.
- **Risk**: Privileges tied to hardcoded string literals; vulnerable to email changes or user metadata tampering.

### 2.5 Vulnerability 5: Predictable Synthetic Caregiver Credentials
- **Evidence**: `src/api/supabaseClient.js` lines 229-231 `[PROVEN FROM CODE]`.
- **Flaw**: `signInWithNationalIdOrAnc` generates email `${identifier}@totoafya.org` and password `toto_${pin}`.
- **Risk**: Anyone possessing a mother's National ID and 4-digit PIN can calculate her cleartext credentials and compromise her account.

### 2.6 Vulnerability 6: Unprotected Portal Frontend Routes
- **Evidence**: `src/App.jsx` lines 53-68, `NursePortal.jsx` lines 17-24, `FacilityDashboard.jsx` lines 19-32 `[PROVEN FROM CODE]`.
- **Flaw**: Route definitions lack auth guards; portal components load up to 200 records on boot without checking user roles.
- **Risk**: Unauthenticated visitors navigating to `/nurse` or `/facility` view sensitive patient lists if RLS is misconfigured.

### 2.7 Vulnerability 7: Multi-Tenant Scope Leak in Helper Function
- **Evidence**: `schema.sql` lines 362-385 `[PROVEN FROM DB]`.
- **Flaw**: `get_user_facility_id()` queries `nurses` first, and if NULL, falls through to query `mothers`.
- **Risk**: Ambiguous facility resolution for users existing in both tables, risking cross-tenant data leakage.

---

## 3. Required Security Test Matrix

Prior to production release, the following 15 negative security tests MUST be implemented and verified in the automated testing suite:

| Test ID | Test Scenario | Actor | Attempted Request / Operation | Expected Result | Enforcement Layer |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`TEST-SEC-01`** | Unauthenticated Resource Access | Anonymous User | `GET /rest/v1/mothers` | `HTTP 401 / 0 Rows Returned` | PostgreSQL RLS |
| **`TEST-SEC-02`** | Cross-Caregiver Data Inspection | Mother A | `GET /rest/v1/mothers?id=eq.Mother_B_ID` | `0 Rows Returned` | PostgreSQL RLS |
| **`TEST-SEC-03`** | Cross-Facility Staff Data Inspection| Nurse (Facility A) | `GET /rest/v1/mothers?facility_id=eq.Facility_B_ID`| `0 Rows Returned` | PostgreSQL RLS |
| **`TEST-SEC-04`** | Unauthenticated Staff Invite | Anonymous User | `POST /functions/v1/invite-staff` | `HTTP 401 Unauthorized` | Edge Function Auth |
| **`TEST-SEC-05`** | Unauthorized Role Escalation | Nurse | `PATCH /rest/v1/nurses?id=eq.Self` `{ role: 'admin' }` | `HTTP 403 / RLS Violation`| PostgreSQL RLS |
| **`TEST-SEC-06`** | Mother Record Deletion Attempt | Mother A | `DELETE /rest/v1/mothers?id=eq.Mother_A_ID` | `HTTP 403 / RLS Violation`| PostgreSQL RLS |
| **`TEST-SEC-07`** | Mother Immunization Update Attempt| Mother A | `UPDATE /rest/v1/immunizations` | `HTTP 403 / RLS Violation`| PostgreSQL RLS |
| **`TEST-SEC-08`** | Unauthenticated Break-Glass Request| Nurse | `SELECT request_emergency_access(...)` | `RAISE EXCEPTION` | SQL Function |
| **`TEST-SEC-09`** | Expired Break-Glass Access | Super Admin | `GET /rest/v1/mothers` (Grant Expired) | `0 Rows Returned` | PostgreSQL RLS |
| **`TEST-SEC-10`** | Direct Audit Log Modification | Super Admin | `DELETE FROM audit_logs` | `RAISE EXCEPTION (Immutable)`| SQL Trigger |
| **`TEST-SEC-11`** | Direct Audit Log Update | Super Admin | `UPDATE audit_logs SET action='MODIFIED'` | `RAISE EXCEPTION (Immutable)`| SQL Trigger |
| **`TEST-SEC-12`** | Cross-County Data Inspection | County Admin (A) | `GET /rest/v1/mothers?county=eq.County_B` | `0 Rows Returned` | PostgreSQL RLS |
| **`TEST-SEC-13`** | Suspended Staff Login Attempt | Suspended Nurse | `POST /auth/v1/token?grant_type=refresh_token` | `HTTP 401 Unauthorized` | Auth Engine |
| **`TEST-SEC-14`** | Caregiver Invalid PIN Lockout | Caregiver | 5 Consecutive Failed PIN Logins | Account Locked 15 Mins | Server Auth API |
| **`TEST-SEC-15`** | Malicious CORS Origin Request | External Site | `POST /functions/v1/invite-staff` from evil.com| `CORS Preflight Blocked` | Edge Gateway |

---
*End of Document 07 — Security Test & Threat Model Specification.*
