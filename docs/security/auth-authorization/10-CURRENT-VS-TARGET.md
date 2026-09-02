# TOTOAFYA DIGITAL — CURRENT VS TARGET ARCHITECTURAL COMPARISON

**Document ID:** `DOC-SEC-AUTH-10`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/10-CURRENT-VS-TARGET.md`  

---

## 1. Executive Gap Analysis

This document presents a side-by-side forensic gap analysis comparing TotoAfya Digital's current implementation against the production target contract.

```text
                  CURRENT IMPLEMENTATION                       TARGET PRODUCTION SYSTEM
          ┌───────────────────────────────────┐         ┌───────────────────────────────────┐
          │ • Dual Local / Supabase Mode      │         │ • Unified Database Enforced Auth  │
          │ • Unauthenticated Edge Functions  │         │ • Strict JWT & Role Checked Edge  │
          │ • RLS Policies use FOR ALL        │ ──────► │ • Granular SELECT/INSERT/UPDATE   │
          │ • Synthetic Email Caregiver Auth │         │ • Server Activated Identifier Auth│
          │ • Hardcoded Super Admin Email     │         │ • Database Enum app_role Contract │
          └───────────────────────────────────┘         └───────────────────────────────────┘
```

---

## 2. Side-by-Side Architectural Comparison Matrix

| Security Dimension | Current Implementation `[PROVEN FROM CODE/DB]` | Target Production Contract | Architectural Gap & Risk |
| :--- | :--- | :--- | :--- |
| **1. Authentication Source** | Dual mode (`VITE_DATABASE_PROVIDER`). Local mode reads `localStorage.getItem('is_logged_in')` `[PROVEN FROM CODE]`. | Single Supabase Auth engine. JWT validated on every request. | Local mode allows arbitrary user impersonation in DevTools. |
| **2. Caregiver Identity** | Synthetic client email `${identifier}@totoafya.org` & default password `toto_${pin}` `[PROVEN FROM CODE]`. | Phone / National ID / ANC Number linked to `auth.users.id` via activation function. | Predictable synthetic credentials allow account takeover. |
| **3. Role Taxonomy** | Unrestricted `nurses.role TEXT` column; values like `'admin'`, `'nurse'`, `'chv'` `[PROVEN FROM DB]`. | PostgreSQL enum `app_role` (`super_admin`, `facility_admin`, `doctor`, `nurse`, `chv`, `mother`). | Arbitrary role strings allow role injection vulnerabilities. |
| **4. Super Admin Resolution** | Hardcoded email check `v_email = 'cto@terraseptsolutions.com'` in `get_user_role()` `[PROVEN FROM DB]`. | Role resolved from `public.user_roles` table with foreign key constraints. | Super admin privileges break if email changes. |
| **5. RLS Policy Granularity**| RLS policies use blanket `FOR ALL` policies on `mothers`, `children`, `anc_visits` `[PROVEN FROM DB]`. | Explicit, separate SQL policies for `SELECT`, `INSERT`, `UPDATE`; `DELETE` revoked. | Caregivers and nurses can delete patient clinical files. |
| **6. Multi-Tenant Isolation**| `get_user_facility_id()` falls back to `mothers` if `nurses` query returns NULL `[PROVEN FROM DB]`. | Hardened SQL function requiring active staff status & explicit facility assignment. | Ambiguous facility resolution risks cross-tenant data leaks. |
| **7. Edge Function Security**| `invite-staff` sets `CORS: "*"` and lacks JWT or role verification `[PROVEN FROM CODE]`. | Edge Function verifies caller JWT and enforces `facility_admin` or `super_admin` role. | Global remote unauthenticated account takeover vulnerability. |
| **8. Frontend Route Protection**| `/nurse/*` and `/facility` routes render without checking `user.role` or `isAuthenticated` `[PROVEN FROM CODE]`. | Protected layout guards (`ProtectedRoute`) enforce role checks before component mounting. | Unauthenticated users can view patient records if RLS fails. |
| **9. Account Provisioning** | Client directly inserts into `mothers` or `nurses` table `[PROVEN FROM CODE]`. | Transactional server-side provisioning with automatic rollback on partial failure. | Inconsistent database states when auth creation succeeds but DB fails. |
| **10. Audit Trail Security** | `audit_logs` table exists but triggers lack immutability enforcement on update `[PROVEN FROM DB]`. | Immutable database trigger `prevent_audit_log_modification()` blocks `UPDATE`/`DELETE`. | Malicious admin could alter audit trail to cover unauthorized actions. |
| **11. Emergency Access** | Break-glass function `request_emergency_access` lacks strict 60-minute expiry enforcement `[PROVEN FROM DB]`. | Temporary grants automatically expire after 60 minutes via SQL policy check. | Permanent administrative access leak following emergency request. |
| **12. Feature Flags Access** | `feature_flags` read policy grants access to `anon` and `authenticated` `[PROVEN FROM DB]`. | Feature flags cached in-memory at root boot; mutation restricted to `super_admin`. | Correct design; requires consistent preloading across entry points. |
| **13. Staff Status Machine** | Staff status is arbitrary text (`'pending_activation'`, `'active'`) without check constraints `[PROVEN FROM DB]`. | Database enum status (`PENDING_ACTIVATION`, `INVITED`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED`). | Invalid state transitions during account lifecycle. |
| **14. Multi-Facility Staff** | Nurses table ties one staff row to one `facility_id` without locum/multi-facility handling `[PROVEN FROM CODE]`. | Explicit "Facility Switch" re-issuing session context token for multi-clinic providers. | Provider action attribution ambiguous across clinic sites. |
| **15. Security Test Suite** | Zero automated RLS or negative authorization security tests in codebase `[PROVEN FROM CODE]`. | Automated suite executing 15 negative security tests (`TEST-SEC-01` to `TEST-SEC-15`) in CI/CD. | Regressions undetected until pilot failure in production. |

---

## 3. Forensic Analysis of Previous Pilot Failure

In response to Section 26 of the Authorization Contract, a forensic review was conducted to determine the root cause of the previous pilot failure during preparation before user account distribution:

```text
                                  PILOT FAILURE ROOT CAUSES
                                ┌──────────────────────────┐
                                │                          │
     ┌──────────────────────────┴───────────┐    ┌─────────┴──────────────────────────┐
     │ 1. Synthetic Credential Collisions  │    │ 2. Unauthenticated Service Role    │
     │    caregiver email synthesis failed │    │    invite-staff Edge Function failed │
     │    on pre-registered profile sync   │    │    under strict CORS/TLS checks     │
     └──────────────────────────┬───────────┘    └─────────┬──────────────────────────┘
                                │                          │
                                └──────────────────────────┘
                                             │
                                ┌────────────┴─────────────┐
                                │ 3. RLS Policy Fail-Closed│
                                │    get_user_facility_id()│
                                │    returned NULL for DB  │
                                └──────────────────────────┘
```

### 3.1 Confirmed Failure Drivers `[PROVEN FROM CODE/DB]`

1. **Synthetic Credential & Profile Linking Collision (`CONFIRMED`)**:
   - In `supabaseClient.js` lines 228-348 `[PROVEN FROM CODE]`, `signInWithNationalIdOrAnc` attempted to sign up mothers on the fly using synthetic emails `${identifier}@totoafya.org`.
   - When pilot nurses pre-registered mothers at the facility, those mother records had `user_id = NULL`.
   - When the mother later attempted first-time login, the client tried to insert a duplicate `mothers` record instead of linking the existing pre-registered profile, causing database unique key constraint violations (`national_id_key` / `anc_number_key`) and locking users out.

2. **Unauthenticated Privileged Edge Function & CORS Failure (`CONFIRMED`)**:
   - The `invite-staff` Edge Function relied on unauthenticated Deno requests and wildcard CORS (`*`).
   - Strict browser security policies and Supabase gateway validation rejected preflight headers or failed when client apps attempted staff onboarding without sending valid authorization tokens, causing staff activation emails to fail.

3. **Multi-Tenant Scope Resolution Failure (`CONFIRMED`)**:
   - `get_user_facility_id()` in `schema.sql` `[PROVEN FROM DB]` evaluated `nurses` first. If a staff member had `facility_id = NULL` (e.g. newly invited staff or county admin), the function fell through to check `mothers`.
   - This caused RLS policies evaluating `facility_id = get_user_facility_id()` to resolve to `NULL = NULL` or return zero rows, completely blocking staff from viewing facility dashboards upon initial login.

---

## 4. Architectural Drift & Remediation Index

To restore system safety, every architectural deficiency MUST be remediated according to the following index:

| Deficiency ID | Current Code / DB Artifact | Remediation Requirement | Implementation Target |
| :--- | :--- | :--- | :--- |
| **`DEF-01`** | `supabase/functions/invite-staff/index.ts` | Authenticate caller JWT; enforce `facility_admin` role; restrict CORS | Phase 6 |
| **`DEF-02`** | `src/api/totoafyaClient.js` | Remove local storage mock authentication fallbacks in production builds | Phase 1 |
| **`DEF-03`** | `totoreplit/schema.sql` (RLS Policies) | Split `FOR ALL` policies on `mothers`, `children`, `anc_visits` into `SELECT`, `INSERT`, `UPDATE` | Phase 5 |
| **`DEF-04`** | `totoreplit/schema.sql` (`get_user_role`) | Remove hardcoded email `'cto@terraseptsolutions.com'`; resolve from enum roles | Phase 2 |
| **`DEF-05`** | `src/api/supabaseClient.js` | Replace synthetic email generation with server-side activation code function | Phase 9 |
| **`DEF-06`** | `src/App.jsx` & Portal components | Wrap `/nurse/*` and `/facility` routes in role-based `ProtectedRoute` guards | Phase 8 |
| **`DEF-07`** | `totoreplit/schema.sql` (`get_user_facility_id`)| Fix fallback logic to require active staff status before returning facility ID | Phase 4 |
| **`DEF-08`** | `totoreplit/schema.sql` (`audit_logs`) | Add `BEFORE UPDATE OR DELETE` trigger `prevent_audit_log_modification` | Phase 7 |

---
*End of Document 10 — Current System vs Target System Comparison.*
