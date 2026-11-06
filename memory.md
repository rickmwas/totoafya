# Memory — Feature Flags & Local Dev Auth Bypass

Last updated: 2026-11-04T15:25:00+03:00

## What was built

*   **Database Table & Seeds**: Added `feature_flags` table to `schema.sql` with default flags (`enable-chatbot`, `enable-learning-hub`, `enable-danger-signs-red-alerts`) and RLS policies restricting write access to `super_admin`.
*   **Dual-Mode Synchronous Cache**: Implemented in-memory caching and synchronous checks via `db.features.isEnabled(name)` in both `@totoafya/api-client` and local `src/api` client wrappers.
*   **Super Admin Control Panel**: Integrated a Feature Flags control panel as a tab component in the Super Admin Portal dashboard allowing toggles of flags in real-time.
*   **Caregiver & Nurse Portal Gates**: Wrapped symptoms quick actions, chatbot components, the learning hub page, and clinical danger-signs red styling in evaluations to collapse gracefully when flags are disabled.
*   **Local Dev Auth Bypass & Role Switcher**:
    *   Disabled blocking auth gates when running locally (`VITE_DATABASE_PROVIDER=local`).
    *   Created dedicated `/login` route with 1-click quick-login demo buttons.
    *   Added floating `<DevRoleSwitcher />` pill for instant jumping between Mother (:5000), Nurse (:5001), Facility (:5002), and Super Admin (:5003).
    *   Resolved the blank white screen issue by fixing unauthenticated redirect loops in `AuthContext`/`App.jsx`, non-blocking splash screen handling on `/login`, and date-fns crash in `ChildCard.jsx`/`ChildProfile.jsx` (`date_of_birth` vs `dob` schema normalization).

## Decisions made

*   **App Startup Preloading**: Chose to load all feature flags dynamically once at the application root boot (`db.features.load()`) to cache them and keep check evaluations synchronous, preventing UI flicker.
*   **Double-Layer Gating**: Managed visibility at both the page navigation level (drawer/quick actions) and the component level (e.g. inside `PatientChatbot.jsx`) as a solid fallback layer.
*   **Dual Field Normalization**: In `totoafyaClient.js`, automatically map `dob <-> date_of_birth` and `name <-> full_name` so mock seeds and UI components are 100% interoperable.

## Problems solved

*   **White Blank Screen on Local Boot**:
    *   *Issue 1*: In `apps/mother-portal/src/App.jsx`, `AuthenticatedApp` was throwing `auth_required` error and doing `window.location.href = '/login'; return null;` in a loop because there was no declared `/login` route.
    *   *Issue 2*: Full-screen `SplashScreen` was obscuring `/login` in local development.
    *   *Issue 3*: Uncaught `TypeError` in `ChildCard.jsx` at `parseISO(child.date_of_birth)` crashed the React tree because local mock child stored `dob` instead of `date_of_birth`.
    *   *Fix*: Added declared `/login` route, skipped splash screen on direct `/login` navigation, normalized child records in `totoafyaClient.js`, and added defensive try/catch wrappers around date parsing in `ChildCard.jsx` and `ChildProfile.jsx`.

## Current state

*   `http://localhost:5000/login` renders the login UI with 1-click demo mother login.
*   `http://localhost:5000/` renders the Caregiver dashboard with full pregnancy and child cards.
*   Floating `<DevRoleSwitcher />` allows switching roles and portals on the fly.
