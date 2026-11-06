# Nurse Portal UI Migration & Cleanup Specification
**Sprint 1 — Monolith UI Decoupling & Component Transition Plan**  
**Lead Frontend & UI Architect Report**  
**Target Application:** `apps/nurse-portal`  
**Target Shared Package:** `@totoafya/shared-ui`  
**Date:** November 2026  

---

## 1. Executive Summary & Audit Verification

When `apps/nurse-portal` was branched from the monolithic `totoreplit/src/` codebase, the entire **46-file shadcn/ui component library** was copied verbatim into `apps/nurse-portal/src/components/ui/`.

### Critical Finding: 98% Unused Dead Code
A full static analysis of all JSX files in `apps/nurse-portal/src` reveals:
- **Only 1 file** in the entire application imports from `components/ui/`:  
  `apps/nurse-portal/src/App.jsx` line 1: `import { Toaster } from "@/components/ui/toaster"`.
- **45 out of 46 files** in `src/components/ui/` have **zero consumers** within `apps/nurse-portal`. All nurse clinical forms (`NurseANCForm.jsx`, `NurseVaccineForm.jsx`, `NurseGrowthForm.jsx`, `NursePatientView.jsx`, `NursePatientSearch.jsx`) currently use raw HTML inputs and ad-hoc Tailwind classes rather than these UI components.
- The remaining internal imports found in `src/components/ui/` are merely UI primitives importing each other (e.g. `dialog.jsx` importing `button.jsx`).

---

## 2. Component Migration & Replacement Mapping

All active and planned nurse portal workflows will import from the enterprise `@totoafya/shared-ui` package, standardizing on the canonical design tokens (`#006B5F` TotoAfya Teal, 8pt grid, 44px min touch targets):

| Local Monolith UI File (`src/components/ui/`) | Replacement in `@totoafya/shared-ui` | Status in Nurse Portal | Planned Action |
| :--- | :--- | :--- | :--- |
| `button.jsx` | `import { Button } from '@totoafya/shared-ui'` | Unused | Safe to remove |
| `input.jsx` | `import { Input } from '@totoafya/shared-ui'` | Unused | Safe to remove |
| `badge.jsx` | `import { Badge } from '@totoafya/shared-ui'` | Unused | Safe to remove |
| `card.jsx` | `import { Card, CardHeader, CardTitle, CardContent } from '@totoafya/shared-ui'` | Unused | Safe to remove |
| `table.jsx` | `import { Table, TableHeader, TableRow, TableCell } from '@totoafya/shared-ui'` | Unused | Safe to remove |
| *N/A (New)* | `import { SearchInput } from '@totoafya/shared-ui'` | New | Replaces raw search in `NursePatientSearch` |
| *N/A (New)* | `import { SyncStatusBar } from '@totoafya/shared-ui'` | New | Added to `NursePortal` header |
| `toaster.jsx` / `toast.jsx` / `use-toast.jsx` | Standardize on `@totoafya/shared-ui` notification system | Used in `App.jsx` | Migrate to shared toast |
| **All other 38 files** (accordion, alert-dialog, avatar, calendar, command, drawer, dropdown-menu, form, menubar, pagination, progress, select, sheet, sidebar, skeleton, slider, switch, tabs, etc.) | Available in `@totoafya/shared-ui` as needed | **100% Unused** | **Scheduled for deletion** |

---

## 3. Detailed File-by-File Disposition Table

| File Name in `src/components/ui/` | Size | Used by App? | Safe to Delete? | Reason & Replacement |
| :--- | :--- | :---: | :---: | :--- |
| `accordion.jsx` | 1.8 KB | No | **Yes** | Zero imports. |
| `alert-dialog.jsx` | 3.5 KB | No | **Yes** | Zero imports. |
| `alert.jsx` | 1.2 KB | No | **Yes** | Zero imports. |
| `aspect-ratio.jsx` | 0.4 KB | No | **Yes** | Zero imports. |
| `avatar.jsx` | 1.5 KB | No | **Yes** | Zero imports. |
| `badge.jsx` | 1.1 KB | No | **Yes** | Replaced by `@totoafya/shared-ui` `Badge`. |
| `breadcrumb.jsx` | 2.4 KB | No | **Yes** | Zero imports. |
| `button.jsx` | 2.1 KB | No | **Yes** | Replaced by `@totoafya/shared-ui` `Button` (44px target). |
| `calendar.jsx` | 2.8 KB | No | **Yes** | Zero imports. |
| `card.jsx` | 2.0 KB | No | **Yes** | Replaced by `@totoafya/shared-ui` `Card`. |
| `carousel.jsx` | 4.9 KB | No | **Yes** | Zero imports. |
| `chart.jsx` | 6.8 KB | No | **Yes** | Zero imports. |
| `checkbox.jsx` | 1.1 KB | No | **Yes** | Zero imports. |
| `collapsible.jsx` | 0.5 KB | No | **Yes** | Zero imports. |
| `command.jsx` | 4.2 KB | No | **Yes** | Zero imports. |
| `context-menu.jsx` | 4.8 KB | No | **Yes** | Zero imports. |
| `dialog.jsx` | 3.4 KB | No | **Yes** | Zero imports. |
| `drawer.jsx` | 3.1 KB | No | **Yes** | Zero imports. |
| `dropdown-menu.jsx` | 5.2 KB | No | **Yes** | Zero imports. |
| `form.jsx` | 4.6 KB | No | **Yes** | Zero imports. |
| `hover-card.jsx` | 1.5 KB | No | **Yes** | Zero imports. |
| `input-otp.jsx` | 2.2 KB | No | **Yes** | Zero imports. |
| `input.jsx` | 1.0 KB | No | **Yes** | Replaced by `@totoafya/shared-ui` `Input` & `SearchInput`. |
| `label.jsx` | 0.8 KB | No | **Yes** | Zero imports. |
| `menubar.jsx` | 6.8 KB | No | **Yes** | Zero imports. |
| `navigation-menu.jsx` | 3.8 KB | No | **Yes** | Zero imports. |
| `pagination.jsx` | 2.5 KB | No | **Yes** | Zero imports. |
| `popover.jsx` | 1.3 KB | No | **Yes** | Zero imports. |
| `progress.jsx` | 1.1 KB | No | **Yes** | Zero imports. |
| `radio-group.jsx` | 1.4 KB | No | **Yes** | Zero imports. |
| `resizable.jsx` | 1.8 KB | No | **Yes** | Zero imports. |
| `scroll-area.jsx` | 1.4 KB | No | **Yes** | Zero imports. |
| `select.jsx` | 4.3 KB | No | **Yes** | Zero imports. |
| `separator.jsx` | 1.0 KB | No | **Yes** | Zero imports. |
| `sheet.jsx` | 3.9 KB | No | **Yes** | Zero imports. |
| `sidebar.jsx` | 12.8 KB | No | **Yes** | Zero imports. |
| `skeleton.jsx` | 0.5 KB | No | **Yes** | Zero imports. |
| `slider.jsx` | 1.3 KB | No | **Yes** | Zero imports. |
| `sonner.jsx` | 1.2 KB | No | **Yes** | Zero imports. |
| `switch.jsx` | 1.4 KB | No | **Yes** | Zero imports. |
| `table.jsx` | 2.2 KB | No | **Yes** | Replaced by `@totoafya/shared-ui` `Table`. |
| `tabs.jsx` | 1.5 KB | No | **Yes** | Zero imports. |
| `textarea.jsx` | 1.0 KB | No | **Yes** | Zero imports. |
| `toast.jsx` | 3.2 KB | Ref by toaster | Stage 2 | Migrate to shared notification. |
| `toaster.jsx` | 1.2 KB | Ref by App.jsx | Stage 2 | Migrate to shared notification. |
| `toggle-group.jsx` | 1.6 KB | No | **Yes** | Zero imports. |
| `toggle.jsx` | 1.4 KB | No | **Yes** | Zero imports. |
| `tooltip.jsx` | 1.5 KB | No | **Yes** | Zero imports. |
| `use-toast.jsx` | 4.8 KB | Ref by toaster | Stage 2 | Migrate to shared notification. |

---

## 4. Execution Plan for Sprint 1 Rebuild

1. **Step 1: Wire Workspace Aliases** (Completed):
   - Added `@totoafya/shared-ui` and `@totoafya/design-system` aliases to `apps/nurse-portal/vite.config.js`.
   - Linked `@totoafya/design-system/src/tailwind-preset.js` into `apps/nurse-portal/tailwind.config.js`.
2. **Step 2: Clean Rebuild of Nurse Portal Screens** (Sprint 1 Active):
   - Build new `NursePatientSearch` using `SearchInput`, `Button`, and `Table` from `@totoafya/shared-ui`.
   - Build new `NursePatientView` and clinical forms (`NurseANCForm`, `NurseVaccineForm`, `NurseGrowthForm`) utilizing `@totoafya/shared-ui` and canonical Teal `#006B5F` tokens.
   - Insert `SyncStatusBar` into the top navigation of `NursePortal.jsx`.
3. **Step 3: Safe Purge of `src/components/ui/`**:
   - Delete all 43 unused `.jsx` files in `apps/nurse-portal/src/components/ui/`.
   - Migrate `App.jsx` toaster to shared feedback system.
   - Remove directory completely, recovering over 100KB of redundant code.
