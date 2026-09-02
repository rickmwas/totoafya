# TOTOAFYA DIGITAL — AUTHORIZATION SYSTEM IMPLEMENTATION PLAN

**Document ID:** `DOC-SEC-AUTH-09`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/09-IMPLEMENTATION-PLAN.md`  

---

## 1. Executive Implementation Roadmap

This plan outlines the phased engineering execution required to transition TotoAfya Digital from its current vulnerable, local-mock architecture `[PROVEN FROM CODE/DB]` to the hardened, database-enforced target security contract.

> **ABSOLUTE RULE**: IMPLEMENTATION IS FROZEN AT PHASE 0. NO SOURCE CODE, DATABASE SCHEMAS, RLS POLICIES, OR EDGE FUNCTIONS MAY BE MODIFIED UNTIL FORMAL HUMAN APPROVAL OF THIS PLAN AND CONTRACT SUITE IS GRANTED.

```text
[ Phase 0: Contract Review & Human Approval ] ── (FROZEN)
       │
       ├── Phase 1: Identity Foundation & Schema Standardization
       ├── Phase 2: Canonical Role Enum & PostgreSQL Constraints
       ├── Phase 3: Action-Oriented Permission Enforcement
       ├── Phase 4: Tenancy Scope & Facility Boundary Hardening
       ├── Phase 5: Database RLS SQL Policy Overhaul
       ├── Phase 6: Edge Function & Service-Role Security Hardening
       ├── Phase 7: Privileged Operations & Emergency Break-Glass
       ├── Phase 8: Frontend Route Guards & Layout Protection
       ├── Phase 9: Transactional Account Provisioning & Activation
       ├── Phase 10: Automated Negative Security Test Suite
       ├── Phase 11: Production Migration & Deployment Verification
       └── Phase 12: Production Pilot Release Gate Sign-off
```

---

## 2. Phase-by-Phase Technical Execution Breakdown

### PHASE 0 — Specification Review & Formal Approval (Current State)
- **Objective**: Conduct forensic architecture review, document vulnerabilities, and publish 10 security specification files under `docs/security/auth-authorization/`.
- **Files Affected**: `docs/security/auth-authorization/*.md` (Documentation files only).
- **Database / Code Changes**: **ZERO CODE OR DATABASE CHANGES**.
- **Acceptance Criteria**: Human review and explicit written sign-off of the Auth Contract suite.

---

### PHASE 1 — Identity Foundation & Schema Standardization
- **Objective**: Standardize identity references across tables, eliminating email/phone-based identity lookups `[PROVEN FROM CODE]`.
- **Files Affected**: `totoreplit/schema.sql`, `supabase/migrations/20260902_identity_foundation.sql`.
- **Database Changes**:
  - Add explicit foreign key constraint `nurses.user_id REFERENCES auth.users(id) ON DELETE CASCADE`.
  - Add explicit foreign key constraint `mothers.user_id REFERENCES auth.users(id) ON DELETE SET NULL`.
  - Ensure `national_id` and `anc_number` have unique indices.
- **Code Changes**: Update database client interfaces to require valid UUID user references.
- **Rollback Strategy**: Revert migration script `20260902_identity_foundation.sql`.

---

### PHASE 2 — Canonical Role Taxonomy & Enum Constraints
- **Objective**: Replace unrestricted `nurses.role TEXT` column `[PROVEN FROM DB]` with single canonical enum `app_role`.
- **Files Affected**: `totoreplit/schema.sql`, database migrations.
- **Database Changes**:
  ```sql
  CREATE TYPE app_role AS ENUM ('super_admin', 'moh_admin', 'county_admin', 'facility_admin', 'doctor', 'nurse', 'chv', 'mother');
  ALTER TABLE public.nurses ALTER COLUMN role TYPE app_role USING role::app_role;
  ```
- **Acceptance Criteria**: Database rejects non-enum role strings (e.g. `'administrator'`).

---

### PHASE 3 — Action-Oriented Permission Enforcement
- **Objective**: Implement granular permission checks (`mother.read`, `anc.create`, `vaccination.create`).
- **Files Affected**: `src/lib/permissions.js`, backend middleware.
- **Code Changes**: Create permission evaluation utility that maps canonical roles to permission sets.

---

### PHASE 4 — Tenancy & Multi-Facility Isolation Hardening
- **Objective**: Fix `get_user_facility_id()` multi-tenant scope leak `[PROVEN FROM DB]`.
- **Files Affected**: `totoreplit/schema.sql`.
- **Database Changes**: Overhaul `get_user_facility_id()` SQL function to require active staff status and eliminate ambiguous fallbacks.

---

### PHASE 5 — Database Row-Level Security (RLS) Policy Overhaul
- **Objective**: Replace flawed `FOR ALL` RLS policies `[PROVEN FROM DB]` with hardened, operation-specific policies (`SELECT`, `INSERT`, `UPDATE`).
- **Files Affected**: `totoreplit/schema.sql`, database migration scripts.
- **Database Changes**: Drop existing policies on `mothers`, `children`, `anc_visits`, `immunizations`, `growth_records`, `ai_alerts`. Apply hardened policies from `DOC-SEC-AUTH-06`.
- **Acceptance Criteria**: Caregivers cannot delete records; nurses cannot delete patient files; cross-facility access returns zero rows.

---

### PHASE 6 — Edge Function Security Hardening
- **Objective**: Remediate critical remote unauthenticated account takeover vulnerability in `invite-staff` `[PROVEN FROM CODE]`.
- **Files Affected**: `supabase/functions/invite-staff/index.ts`.
- **Code Changes**:
  - Remove `Access-Control-Allow-Origin: "*"`; pin origin to domain whitelist.
  - Authenticate caller JWT (`supabaseClient.auth.getUser()`).
  - Verify caller role is `facility_admin` or `super_admin`.
- **Acceptance Criteria**: Unauthenticated requests to `/functions/v1/invite-staff` return `HTTP 401`.

---

### PHASE 7 — Privileged Operations & Emergency Break-Glass
- **Objective**: Harden `request_emergency_access()` function and make `audit_logs` immutable.
- **Files Affected**: `totoreplit/schema.sql`.
- **Database Changes**: Apply `prevent_audit_log_modification` trigger; restrict break-glass to audited 60-minute windows.

---

### PHASE 8 — Frontend Route Guards & Layout Protection
- **Objective**: Protect `/nurse/*`, `/facility`, `/settings` routes from unauthorized URL navigation `[PROVEN FROM CODE]`.
- **Files Affected**: `src/App.jsx`, `src/components/ProtectedRoute.jsx`.
- **Code Changes**: Wrap portal routes in `ProtectedRoute` components that verify `isAuthenticated` and `user.role`.

---

### PHASE 9 — Transactional Caregiver & Staff Account Provisioning
- **Objective**: Eliminate synthetic email generation (`${identifier}@totoafya.org`) `[PROVEN FROM CODE]`; implement transactional signup.
- **Files Affected**: `src/api/supabaseClient.js`, Edge Functions.
- **Code Changes**: Implement activation code verification workflow (`verify_and_activate_mother()`).

---

### PHASE 10 — Automated Negative Security Test Suite
- **Objective**: Build automated security regression test suite executing all 15 negative tests (`TEST-SEC-01` to `TEST-SEC-15`).
- **Files Affected**: `tests/security/auth.spec.ts`.
- **Acceptance Criteria**: 100% test pass rate in CI pipeline.

---

### PHASE 11 & 12 — Production Deployment & Pilot Release Sign-off
- **Objective**: Execute database migrations on production Supabase instance, verify environment config, run smoke tests, and complete formal sign-off artifact.
- **Acceptance Criteria**: All 7 Production Release Gates passed; signed audit artifact archived.

---
*End of Document 09 — Implementation Plan.*
