# TOTOAFYA DIGITAL — ROLES & PERMISSIONS SPECIFICATION

**Document ID:** `DOC-SEC-AUTH-03`  
**Version:** `1.0.0-PROD-SPEC`  
**Status:** `DRAFT FOR REVIEW / IMPLEMENTATION FROZEN`  
**Classification:** `CONFIDENTIAL — HEALTHCARE SECURITY ARCHITECTURE`  
**Target System:** TotoAfya Digital Production Platform  
**Location:** `docs/security/auth-authorization/03-ROLES-PERMISSIONS-SPEC.md`  

---

## 1. Canonical Role Taxonomy

To eliminate authorization ambiguity resulting from legacy string comparisons `[PROVEN FROM DB]` (e.g., treating `'admin'`, `'facility_admin'`, and `'administrator'` as synonymous), TotoAfya Digital establishes a single, enum-enforced role taxonomy.

### 1.1 Canonical Role Taxonomy Table

```sql
-- Target Database Enum
CREATE TYPE app_role AS ENUM (
    'super_admin',
    'moh_admin',
    'county_admin',
    'facility_admin',
    'doctor',
    'nurse',
    'chv',
    'mother'
);
```

| Role Key | Role Name | Default Scope | Maximum Privilege Boundary | Primary Assignment Authority |
| :--- | :--- | :--- | :--- | :--- |
| **`super_admin`** | Super Administrator | `global` | Full platform administration & break-glass | Root System Provisioning CLI |
| **`moh_admin`** | Ministry of Health Admin | `national` | Read-only national analytics & reporting | Super Admin |
| **`county_admin`** | County Health Administrator| `county` | Read-only county performance & facility audit | Super Admin |
| **`facility_admin`**| Facility Administrator | `facility` | Full administrative management of single facility | County Admin / Super Admin |
| **`doctor`** | Medical Officer / Doctor | `facility` | Full clinical write & prescription management | Facility Admin |
| **`nurse`** | Registered Nurse / Midwife | `facility` | Clinical intake, ANC logging, child tracking | Facility Admin |
| **`chv`** | Community Health Volunteer | `sub_county` | Community screening, follow-up, danger alert | Facility Admin |
| **`mother`** | Caregiver / Mother | `self` | Read-only own ANC/child records, self profile | Pre-registration / Self Signup |

---

## 2. Role Assignment Contract & Matrix

Privilege escalation occurs when a user elevates their own role or grants another user excessive permissions. The following matrix governs **EXACTLY who may assign which role to whom**:

### 2.1 Role Assignment Matrix

| Actor (Grantor) | May Grant `mother` | May Grant `chv` | May Grant `nurse` | May Grant `doctor` | May Grant `facility_admin` | May Grant `county_admin` | May Grant `moh_admin` | May Grant `super_admin` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`super_admin`** | YES | YES | YES | YES | YES | YES | YES | YES `[REQUIRES AUDIT]` |
| **`moh_admin`** | NO | NO | NO | NO | NO | YES | NO | NO |
| **`county_admin`** | NO | YES | YES | YES | YES | NO | NO | NO |
| **`facility_admin`**| YES | YES | YES | YES | NO | NO | NO | NO |
| **`doctor`** | NO | NO | NO | NO | NO | NO | NO | NO |
| **`nurse`** | YES (Intake) | NO | NO | NO | NO | NO | NO | NO |
| **`chv`** | NO | NO | NO | NO | NO | NO | NO | NO |
| **`mother`** | NO | NO | NO | NO | NO | NO | NO | NO |

> **NON-NEGOTIABLE RULE**: A user MUST NEVER be able to assign a role higher than or equal to their own role, except `super_admin` operating under strict multi-party break-glass authorization.

---

## 3. Action-Oriented Permission Taxonomy

Permissions MUST be action-oriented, granular strings following the standard convention:  
`[resource].[action]`

```text
E.g.: mother.read, child.create, anc.update, staff.assign_role
```

### 3.1 Permission Registry

| Permission ID | Description | Targeted Resource | Action | Required Minimum Scope |
| :--- | :--- | :--- | :--- | :--- |
| **`mother.read`** | Read maternal profile & demographic records | `mothers` | `SELECT` | `self` |
| **`mother.create`** | Register new pregnant mother or caregiver | `mothers` | `INSERT` | `facility` |
| **`mother.update`** | Update maternal health & contact records | `mothers` | `UPDATE` | `self` |
| **`mother.delete`** | Soft delete / archive maternal profile | `mothers` | `UPDATE` | `facility_admin` |
| **`child.read`** | View child profile & clinical history | `children` | `SELECT` | `self` |
| **`child.create`** | Register new newborn or child | `children` | `INSERT` | `self` |
| **`child.update`** | Update child baseline clinical indicators | `children` | `UPDATE` | `facility` |
| **`anc.read`** | Read Antenatal Care encounter logs | `anc_visits` | `SELECT` | `self` |
| **`anc.create`** | Log clinical ANC visit examination details | `anc_visits` | `INSERT` | `facility` |
| **`anc.update`** | Amend recorded ANC visit record | `anc_visits` | `UPDATE` | `facility` |
| **`growth.read`** | View child growth (height/weight z-score) | `growth_records` | `SELECT` | `self` |
| **`growth.create`** | Record child anthropometric measurement | `growth_records` | `INSERT` | `facility` |
| **`vaccination.read`**| View immunization schedule & records | `immunizations` | `SELECT` | `self` |
| **`vaccination.create`**| Administer & record child vaccine dose | `immunizations` | `INSERT` | `facility` |
| **`staff.read`** | View clinic staff roster & status | `nurses` | `SELECT` | `facility` |
| **`staff.create`** | Invite / pre-register new staff member | `nurses` | `INSERT` | `facility` |
| **`staff.disable`** | Suspend or deactivate staff access | `nurses` | `UPDATE` | `facility_admin` |
| **`staff.assign_role`**| Change staff role assignment | `nurses` | `UPDATE` | `facility_admin` |
| **`facility.read`** | View health facility profile & metrics | `facilities` | `SELECT` | `facility` |
| **`facility.configure`**| Modify facility settings & subscription tier| `facilities` | `UPDATE` | `super_admin` |
| **`reports.facility`**| View facility-level aggregate analytics | `reports` | `SELECT` | `facility` |
| **`reports.county`** | View county-wide epidemiological reports | `reports` | `SELECT` | `county` |
| **`reports.national`**| View national MNCH compliance dashboard | `reports` | `SELECT` | `national` |
| **`system.audit_view`**| View immutable security audit logs | `audit_logs` | `SELECT` | `super_admin` |
| **`system.break_glass`**| Request emergency break-glass record access| `temporary_grants` | `INSERT` | `facility_admin` |

---

## 4. Comprehensive Permission-to-Role Mapping Matrix

| Permission | `mother` | `chv` | `nurse` | `doctor` | `facility_admin` | `county_admin` | `moh_admin` | `super_admin` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `mother.read` | Self | Facility | Facility | Facility | Facility | County | National | Global |
| `mother.create` | Self | Facility | Facility | Facility | Facility | NO | NO | Global |
| `mother.update` | Self | NO | Facility | Facility | Facility | NO | NO | Global |
| `mother.delete` | NO | NO | NO | NO | Facility | NO | NO | Global |
| `child.read` | Self | Facility | Facility | Facility | Facility | County | National | Global |
| `child.create` | Self | Facility | Facility | Facility | Facility | NO | NO | Global |
| `child.update` | NO | NO | Facility | Facility | Facility | NO | NO | Global |
| `anc.read` | Self | Facility | Facility | Facility | Facility | County | National | Global |
| `anc.create` | NO | NO | Facility | Facility | Facility | NO | NO | Global |
| `anc.update` | NO | NO | Facility | Facility | Facility | NO | NO | Global |
| `growth.read` | Self | Facility | Facility | Facility | Facility | County | National | Global |
| `growth.create` | NO | Facility | Facility | Facility | Facility | NO | NO | Global |
| `vaccination.read`| Self | Facility | Facility | Facility | Facility | County | National | Global |
| `vaccination.create`| NO | NO | Facility | Facility | Facility | NO | NO | Global |
| `staff.read` | NO | Facility | Facility | Facility | Facility | County | National | Global |
| `staff.create` | NO | NO | NO | NO | Facility | County | NO | Global |
| `staff.disable` | NO | NO | NO | NO | Facility | County | NO | Global |
| `staff.assign_role`| NO | NO | NO | NO | Facility | County | NO | Global |
| `facility.read` | Self | Facility | Facility | Facility | Facility | County | National | Global |
| `facility.configure`| NO | NO | NO | NO | NO | NO | NO | Global |
| `reports.facility`| NO | NO | Facility | Facility | Facility | County | National | Global |
| `reports.county` | NO | NO | NO | NO | NO | County | National | Global |
| `reports.national`| NO | NO | NO | NO | NO | NO | National | Global |
| `system.audit_view`| NO | NO | NO | NO | NO | NO | NO | Global |
| `system.break_glass`| NO | NO | NO | NO | Facility | NO | NO | Global |

---
*End of Document 03 — Roles & Permissions Specification.*
