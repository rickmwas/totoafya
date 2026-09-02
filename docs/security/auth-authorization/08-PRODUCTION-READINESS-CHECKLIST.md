# TOTOAFYA DIGITAL — PRODUCTION READINESS CHECKLIST

**Document ID:** `DOC-SEC-AUTH-08`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/08-PRODUCTION-READINESS-CHECKLIST.md`  

---

## 1. Zero-Failure Production Engineering Standard

TotoAfya Digital handles sensitive maternal and child healthcare data. In accordance with Section 27 of the Authorization Contract:

> **The production authorization system MUST NOT be released based on assumption, manual confidence, or superficial testing. Every security-critical path MUST have explicit specification, implementation evidence, automated verification, negative testing, and mandatory release gates.**

The system is considered **PRODUCTION-READY** only when 100% of the mandatory release gates defined below are passed and verified by automated audit artifacts.

---

## 2. Mandatory Release Gate Matrix

```text
[ Pre-Production Build ]
        │
        ├── GATE 1: Identity & Authentication Verification ────────── [ MUST PASS ]
        ├── GATE 2: Role & Permission Authorization Verification ──── [ MUST PASS ]
        ├── GATE 3: Multi-Tenant Facility & County Isolation ─────── [ MUST PASS ]
        ├── GATE 4: Privilege Escalation & Defenses ───────────────── [ MUST PASS ]
        ├── GATE 5: Infrastructure & Service Role Security ────────── [ MUST PASS ]
        ├── GATE 6: Database Schema & RLS Verification ───────────── [ MUST PASS ]
        └── GATE 7: Operational & Telemetry Verification ─────────── [ MUST PASS ]
        │
[ PRODUCTION PILOT DEPLOYMENT APPROVED ]
```

### 2.1 Gate 1: Identity & Authentication Verification

- [ ] **1.1 Canonical Identity Binding**: `auth.users.id` is strictly enforced as the sole canonical identity principal; email/phone string matching is eliminated `[PROVEN FROM CODE/DB]`.
- [ ] **1.2 Caregiver Authentication**: Synthetic email generation (`${identifier}@totoafya.org`) is removed; caregiver authentication uses verified server-side activation and hashed PIN check.
- [ ] **1.3 Staff Password Policy**: Staff passwords enforce minimum 12 characters with uppercase, lowercase, numeric, and symbol requirements.
- [ ] **1.4 Session Lifetime Limits**: JWT access token expiration is set to 15 minutes; refresh token rotation is enabled.
- [ ] **1.5 Session Revocation**: Updating account status to `suspended` or `deactivated` immediately revokes all active session tokens.

### 2.2 Gate 2: Role & Permission Authorization Verification

- [ ] **2.1 Hardened Role Resolution**: `get_user_role()` function resolves canonical roles from database enum `app_role` without hardcoded emails or ambiguous fallbacks `[PROVEN FROM DB]`.
- [ ] **2.2 Granular Permissions**: Action-oriented permissions (`anc.create`, `vaccination.create`) govern API endpoints; frontend routes use protected layout guards.
- [ ] **2.3 Role Hierarchy Enforcement**: Lower-level roles are strictly forbidden from assigning higher-level roles.
- [ ] **2.4 Action Separation**: PostgreSQL policies explicitly separate `SELECT`, `INSERT`, and `UPDATE` permissions; blanket `FOR ALL` policies are eliminated `[PROVEN FROM DB]`.

### 2.3 Gate 3: Multi-Tenant Facility & County Isolation

- [ ] **3.1 Facility Data Filtering**: All clinical queries implicitly append `facility_id = get_user_facility_id()` at the database engine layer.
- [ ] **3.2 Cross-Facility Leak Prevention**: Automated test `TEST-SEC-03` confirms staff at Facility A receive zero rows when requesting Facility B records.
- [ ] **3.3 County Boundary Compliance**: County Admins receive data restricted strictly to their assigned county string.
- [ ] **3.4 Transfer Audit Protocol**: Patient facility transfers log non-repudiable audit records in `public.audit_logs`.

### 2.4 Gate 4: Privilege Escalation & Defenses

- [ ] **4.1 Horizontal Escalation Prevention**: Caregiver A is unable to view or mutate Caregiver B records (`TEST-SEC-02`).
- [ ] **4.2 Vertical Escalation Prevention**: Nurse is unable to update own role to `facility_admin` (`TEST-SEC-05`).
- [ ] **4.3 LocalStorage Security**: LocalStorage state is treated as untrusted UI state; backend validates every request independently `[PROVEN FROM CODE]`.

### 2.5 Gate 5: Infrastructure & Service Role Security

- [ ] **5.1 Edge Function Authentication**: `invite-staff` and all Edge Functions authenticate caller JWT and enforce role authorization before executing service-role queries `[PROVEN FROM CODE]`.
- [ ] **5.2 CORS Origin Hardening**: Wildcard CORS (`*`) is removed from Edge Functions; origins are pinned to trusted production domains (`https://app.totoafya.org`).
- [ ] **5.3 Service Role Key Secrecy**: `SUPABASE_SERVICE_ROLE_KEY` is inaccessible to client bundles and restricted to secure server environments.

### 2.6 Gate 6: Database Schema & RLS Verification

- [ ] **6.1 Universal RLS Activation**: Every table in schema `public` has RLS enabled (`ENABLE ROW LEVEL SECURITY`).
- [ ] **6.2 Default Public Revocation**: Default permissions for `anon` and `public` roles are explicitly revoked.
- [ ] **6.3 Immutable Audit Logging**: Database triggers (`prevent_audit_log_modification`) block all `UPDATE` or `DELETE` operations on `audit_logs` `[PROVEN FROM DB]`.
- [ ] **6.4 Reproducible Migrations**: Complete schema applies cleanly via idempotent migration scripts without manual SQL edits.

### 2.7 Gate 7: Operational & Telemetry Verification

- [ ] **7.1 Negative Security Tests**: All 15 automated negative security tests (`TEST-SEC-01` through `TEST-SEC-15`) pass with zero failures.
- [ ] **7.2 Audit Trail Verification**: Emergency break-glass access logs detailed operator identity, timestamp, target record ID, and justification reason.
- [ ] **7.3 Production Rollback Plan**: Automated database migration rollback scripts are tested and documented.

---

## 3. Production Security Audit Sign-off Artifact

Before distributing production credentials or onboarding real caregivers/nurses, the lead security architect and engineering director MUST execute and archive this sign-off artifact:

```text
===============================================================================
               TOTOAFYA DIGITAL — PRODUCTION SECURITY SIGN-OFF
===============================================================================
Date of Evaluation: ________________________
Target Environment: PRODUCTION PILOT (KENYA)
Specification Version: 1.0.0-PROD-SPEC

Verification Checklist Summary:
  [ ] Gate 1: Identity & Authentication Verification        PASS / FAIL
  [ ] Gate 2: Role & Permission Authorization Verification  PASS / FAIL
  [ ] Gate 3: Multi-Tenant Isolation Verification          PASS / FAIL
  [ ] Gate 4: Privilege Escalation Defenses                PASS / FAIL
  [ ] Gate 5: Infrastructure & Service Role Security       PASS / FAIL
  [ ] Gate 6: Database Schema & RLS Hardening              PASS / FAIL
  [ ] Gate 7: Automated Security Suite & Audit Logs        PASS / FAIL

Architectural Certification Statement:
  "I certify that the security, identity, authorization, and tenancy controls 
   for TotoAfya Digital have been audited against the production specification. 
   No critical vulnerabilities remain, and all release gates have passed."

Lead Security Architect: ___________________________ Date: ______________
Director of Engineering: ___________________________ Date: ______________
===============================================================================
```

---
*End of Document 08 — Production Readiness Checklist.*
