/**
 * TotoAfya Digital — Transactional Mutation Outbox & Storage Adapter Contracts
 * Specification Reference: DISC-BACKEND-05 & Master Blueprint TD-1.3
 */

export type {
  MutationRecord,
  MutationEntity,
  MutationAction,
  MutationSyncStatus,
  ConflictResolutionPolicy,
  ConflictResolutionResult,
  ConflictResolutionStrategy,
  ConflictNotificationCode,
  ConflictResolutionDecision,
  StorageAdapter,
} from '@totoafya/types';

export { resolveClinicianPrecedenceConflict } from '@totoafya/types';
