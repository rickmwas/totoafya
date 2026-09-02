# TOTOAFYA DIGITAL — PRODUCTION AUTHORIZATION CONTRACT

**Document ID:** `DOC-SEC-AUTH-01`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/01-AUTHORIZATION-CONTRACT.md`  

---

## 1. Executive Summary & Security Mindset

TotoAfya Digital is a production healthcare platform designed to deliver maternal, newborn, and child health (MNCH) services across Kenya. The system manages protected health information (PHI), clinical encounter data, childhood growth tracking, immunization schedules, and risk alerts for mothers, children, healthcare providers, facility managers, county administrators, and Ministry of Health (MOH) officials.

This document establishes the **Formal Authorization Contract** for TotoAfya Digital. It serves as an immutable design boundary that defines how security, identity, authorization, tenancy, and access control are designed and enforced.

### 1.1 Priorities in Strict Hierarchy

1. **Security Correctness** — Protection against unauthorized data access, manipulation, or disclosure takes precedence over all other considerations.
2. **Authorization Correctness** — Every request must be evaluated against explicit, deterministic, server-enforced authorization rules.
3. **Identity Integrity** — Canonical identity must be cryptographically verified and bound to unique database principals; synthetic or ambiguous identity is strictly forbidden.
4. **Data Isolation** — Multi-tenant boundaries (facility, county, national) and patient ownership must be enforced at the database engine level.
5. **Auditability & Accountability** — Security-critical and privileged actions must generate immutable, non-repudiable audit logs.
6. **Operational Reliability** — Authorization checks must be fail-closed, deterministic, and free of race conditions.
7. **Maintainability** — Access control policies must be centralized, declarative, and free of duplicated business logic.
8. **Developer Convenience** — DX is secondary to security and must never compromise any higher priority.

---

## 2. Forensic Evidence Classification Standard

Every architectural conclusion, flaw diagnosis, and requirement in this document and child specifications is strictly classified using the following evidence tags:

- **`[PROVEN FROM CODE]`**: Verified directly from inspecting application source code (JavaScript/TypeScript/Deno).
- **`[PROVEN FROM DATABASE]`**: Verified directly from inspecting PostgreSQL schemas, RLS policies, SQL functions, triggers, and indices (`schema.sql`).
- **`[PROVEN FROM CONFIGURATION]`**: Verified directly from configuration files (`config.toml`, `.env.example`, `package.json`, `vite.config.js`).
- **`[PROVEN FROM TESTS]`**: Verified directly from existing test suites or test runner configurations.
- **`[INFERRED]`**: Derived logically from architectural structure or common failure patterns.
- **`[UNKNOWN]`**: Cannot be verified from repository artifacts due to missing code/logs/environment configuration.
- **`[REQUIRES PRODUCT DECISION]`**: Ambiguous or missing business logic requiring explicit decision from product leadership.

---

## 3. Axiomatic Authorization Model

Authorization in TotoAfya Digital is formally defined as an immutable evaluation chain:

$$\text{Identity} \longrightarrow \text{Account} \longrightarrow \text{Role} \longrightarrow \text{Permission} \longrightarrow \text{Scope} \longrightarrow \text{Resource} \longrightarrow \text{Action} \longrightarrow \text{Enforcement Point}$$

Every protected operational attempt MUST yield a deterministic answer to seven mandatory questions:

| Evaluation Question | Target Definition | Current Failure in Codebase `[PROVEN FROM CODE/DB]` |
| :--- | :--- | :--- |
| **WHO** is making the request? | Authenticated `auth.users.id` bound to verified domain profile | Local mode returns static mock object `local-user-1`; Supabase mode uses client-constructed user metadata `[PROVEN FROM CODE]` |
| **WHAT** role do they have? | Single canonical role assigned in DB with checked constraints | `nurses.role` is unrestricted `TEXT`; `get_user_role()` hardcodes email `cto@terraseptsolutions.com` `[PROVEN FROM DB]` |
| **WHAT** permission allows it? | Action-oriented granular permission string (e.g., `anc.create`) | No granular permission check exists; UI routes render directly based on URL `[PROVEN FROM CODE]` |
| **WHAT** scope limits it? | Scope bound to `self`, `facility`, `county`, `national`, or `global` | `get_user_facility_id()` returns NULL for unassigned staff, breaking tenant filtering `[PROVEN FROM DB]` |
| **WHAT** resource is targeted? | Valid domain entity record ID (e.g., `mothers.id`) | Resource IDs are passed in raw client queries without backend scope binding `[PROVEN FROM CODE]` |
| **WHAT** action is performed? | Explicit verb (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) | RLS policies use blanket `FOR ALL` policies, granting `DELETE` to nurses and mothers `[PROVEN FROM DB]` |
| **WHERE** is it enforced? | PostgreSQL RLS + Server API / Edge Function verification | Frontend pages (`/nurse`, `/facility`) render data directly without route or role checks `[PROVEN FROM CODE]` |

If any of these seven answers is undefined, ambiguous, or client-supplied, the authorization rule is **INCOMPLETE AND FAIL-CLOSED BY DEFAULT**.

---

## 4. Non-Negotiable System Boundary Principles

### 4.1 Client Interface is NOT a Security Boundary `[PROVEN FROM CODE]`
- UI element visibility, hidden routes, page navigation drawers, or client-side conditional rendering (e.g., `{user?.role === 'admin' && ...}`) provide User Experience (UX) customization only.
- They MUST NOT be treated as security controls. Every API endpoint, PostgREST endpoint, and Edge Function MUST independently validate authentication and authorization regardless of frontend origin.

### 4.2 Auth Token Metadata is NOT Authorization `[PROVEN FROM CODE]`
- Claims inside JWT `user_metadata` (such as `role: 'admin'` set during `signUp`) are untrusted user-supplied data unless signed into app-metadata by a trusted backend trigger.
- Canonical roles MUST be resolved directly from database tables governed by strict RLS and foreign key constraints.

### 4.3 Database Level Failure Behavior (Fail-Closed) `[PROVEN FROM DB]`
- If a query fails to match an RLS policy condition, PostgreSQL MUST return zero rows (`SELECT`) or raise an authorization violation error (`INSERT`, `UPDATE`, `DELETE`).
- Default PostgreSQL access for public and anonymous roles MUST be revoked (`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public, anon`).

### 4.4 Multi-Tenant Facility & County Isolation `[PROVEN FROM DB]`
- Data access across facility boundaries is strictly denied by default.
- Cross-facility access is permitted ONLY for explicit referral transfers or temporary break-glass emergency grants (`temporary_grants` table) subject to non-repudiable audit logging (`audit_logs` table).

---

## 5. Security Architecture Document Index

This specification suite consists of ten formal design contract documents:

| Document | File Path | Focus Area |
| :--- | :--- | :--- |
| **01 — Authorization Contract** | `docs/security/auth-authorization/01-AUTHORIZATION-CONTRACT.md` | Core principles, priority hierarchy, formal contract definitions |
| **02 — Identity & Account Model** | `docs/security/auth-authorization/02-IDENTITY-ACCOUNT-MODEL.md` | Canonical identity taxonomy, account types, lifecycle state machine |
| **03 — Roles & Permissions Spec** | `docs/security/auth-authorization/03-ROLES-PERMISSIONS-SPEC.md` | Role taxonomy, action-oriented permissions, authority matrix |
| **04 — Tenancy & Data Access Spec**| `docs/security/auth-authorization/04-TENANCY-DATA-ACCESS-SPEC.md` | Facility/County hierarchy, ownership rules, multi-facility transfer |
| **05 — Auth Lifecycle Spec** | `docs/security/auth-authorization/05-AUTHENTICATION-LIFECYCLE-SPEC.md` | Credentials, OTP/PIN activation, session revocation, error states |
| **06 — Enforcement Specification** | `docs/security/auth-authorization/06-AUTHORIZATION-ENFORCEMENT-SPEC.md` | Layered enforcement, RLS SQL policies, service-role Edge Functions |
| **07 — Threat Model & Test Suite** | `docs/security/auth-authorization/07-SECURITY-TEST-THREAT-MODEL.md` | STRIDE analysis, forensic flaw audit, negative test matrix |
| **08 — Readiness Checklist** | `docs/security/auth-authorization/08-PRODUCTION-READINESS-CHECKLIST.md` | Pre-deployment verification gates, evidence standards, audit sign-off |
| **09 — Implementation Plan** | `docs/security/auth-authorization/09-IMPLEMENTATION-PLAN.md` | Phased engineering execution plan (Phases 0–12), dependencies, rollbacks |
| **10 — Current vs Target Analysis** | `docs/security/auth-authorization/10-CURRENT-VS-TARGET.md` | Complete gap analysis, failure root cause, architectural drift index |

---
*End of Document 01 — Authorization Contract.*
