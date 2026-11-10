/**
 * TotoAfya Digital — Central Types Repository (@totoafya/types)
 * 
 * Standards & Design Document Mappings:
 * - design/mother-experience/03-information-architecture/INFORMATION_ARCHITECTURE.md
 * - context/architecture.md
 * - engineering/discovery/backend/OFFLINE_SYNC_ASSESSMENT.md
 * - context/code-standards.md
 * 
 * ZERO 'any' types allowed. Strict TypeScript models across all 5 portals and 6 packages.
 */

// Domain Entities
export * from './entities';

// Clinical Guardrails & Measurements
export * from './clinical';

// Authentication, Roles & Multi-Tenant Session
export * from './auth';

// Transactional Mutation Outbox & Storage Adapters
export * from './outbox';

// Runtime Type Guards & Validators
export * from './guards';
