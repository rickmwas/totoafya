# Memory — Feature Flags System

Last updated: 2026-07-14T09:58:00+03:00

## What was built

*   **Database Table & Seeds**: Added `feature_flags` table to `schema.sql` with default flags (`enable-chatbot`, `enable-learning-hub`, `enable-danger-signs-red-alerts`) and RLS policies restricting write access to `super_admin`.
*   **Dual-Mode Synchronous Cache**: Implemented in-memory caching and synchronous checks via `db.features.isEnabled(name)` in both `@totoafya/api-client` and local `src/api` client wrappers.
*   **Super Admin Control Panel**: Integrated a Feature Flags control panel as a tab component in the Super Admin Portal dashboard allowing toggles of flags in real-time.
*   **Caregiver & Nurse Portal Gates**: Wrapped symptoms quick actions, chatbot components, the learning hub page, and clinical danger-signs red styling in evaluations to collapse gracefully when flags are disabled.

## Decisions made

*   **App Startup Preloading**: Chose to load all feature flags dynamically once at the application root boot (`db.features.load()`) to cache them and keep check evaluations synchronous, preventing UI flicker.
*   **Double-Layer Gating**: Managed visibility at both the page navigation level (drawer/quick actions) and the component level (e.g. inside `PatientChatbot.jsx`) as a solid fallback layer.

## Problems solved

*   **Client Divergence**: Maintained duplicate mappings in both package client `@totoafya/api-client` and the local application `src/api` folder clients so both mock local storage and live Supabase operate identical schema paths.
*   **Clean Build Verification**: Confirmed that all portals build successfully for production with zero TypeScript or module resolution errors.

## Current state

*   The Feature Flags system is 100% complete and fully verified.
*   Monorepo builds and compiles successfully via `npm run build`.

## Next session starts with

*   Implementing gestational age computations from LMP and WHO weight z-scores during clinical ANC intake.
*   Enabling live sync validations with Supabase hosting.

## Open questions

*   None.
