/**
 * TotoAfya Digital — Transactional Mutation Outbox & Storage Adapter Contracts
 * Specification Reference: DISC-BACKEND-05 & Master Blueprint TD-1.3
 * 
 * Provides:
 * 1. Client-generated UUIDv4 idempotency keys to eliminate duplicate submissions.
 * 2. Optimistic concurrency control via base_version tracking.
 * 3. Dead-letter queue protection (max 5 retries before dead_letter).
 * 4. Clinician precedence conflict resolution with mandatory caregiver notification.
 * 5. Abstract StorageAdapter for IndexedDB (PWA) and MMKV / SQLite (Native).
 */

export type MutationEntity =
  | 'Mother'
  | 'Child'
  | 'ANCVisit'
  | 'GrowthRecord'
  | 'Immunization'
  | 'Milestone';

export type MutationAction = 'create' | 'update' | 'delete';

export type MutationSyncStatus = 'pending' | 'in_flight' | 'synced' | 'failed' | 'dead_letter';

/**
 * Transactional Mutation Outbox Record
 * Guaranteed zero 'any' types; strictly typed payload and metadata.
 */
export interface MutationRecord {
  readonly id: string; // UUIDv4 client idempotency key
  readonly entity: MutationEntity;
  readonly action: MutationAction;
  readonly payload: Record<string, unknown>;
  readonly base_version: number; // Concurrency tracking for optimistic locking
  readonly user_id: string; // Identity for PostgreSQL Row-Level Security (RLS)
  readonly operator_id: string; // Healthcare worker or caregiver performing mutation
  readonly facility_id: string; // Multi-tenant hospital partitioning
  readonly timestamp: string; // ISO 8601 mutation timestamp
  readonly sync_status: MutationSyncStatus;
  readonly retry_count: number; // Max 5 retries before dead_letter quarantine
  readonly last_error?: string;
}

export type ConflictResolutionStrategy = 'clinician_precedence_with_notification';

export type ConflictNotificationCode = 'overwritten_by_clinician' | 'data_reconciled';

export type ConflictResolutionDecision = 'accept_server' | 'force_client';

export interface ConflictResolutionResult {
  readonly resolution: ConflictResolutionDecision;
  readonly userNotificationRequired: boolean;
  readonly notificationCode: ConflictNotificationCode;
  readonly details?: string;
}

/**
 * Conflict Resolution Policy Interface
 * Prevents silent clinical data discards. When a clinician's entry supersedes
 * a caregiver's offline update, the conflict is acknowledged, logged, and
 * the caregiver receives an explicit notification.
 */
export interface ConflictResolutionPolicy {
  readonly strategy: ConflictResolutionStrategy;
  readonly onConflict: (
    serverRecord: Record<string, unknown>,
    clientMutation: MutationRecord
  ) => ConflictResolutionResult;
}

/**
 * Universal Storage Adapter Contract
 * Pluggable backing store for IndexedDB (Browser / PWA) and MMKV / SQLite (Mobile Expo).
 */
export interface StorageAdapter {
  // Mutation Queue Operations
  enqueueMutation(
    mutation: Omit<MutationRecord, 'sync_status' | 'retry_count'> &
      Partial<Pick<MutationRecord, 'sync_status' | 'retry_count'>>
  ): Promise<MutationRecord>;
  
  getPendingMutations(): Promise<MutationRecord[]>;
  getDeadLetterMutations(): Promise<MutationRecord[]>;
  updateMutationStatus(id: string, status: MutationSyncStatus, error?: string): Promise<void>;
  incrementRetryCount(id: string, error?: string): Promise<MutationRecord | null>;
  removeMutation(id: string): Promise<void>;
  clearQueue(): Promise<void>;

  // Key-Value Persistence for Optimistic Cache & Offline Snapshot
  getItem<T = unknown>(key: string): Promise<T | null>;
  setItem<T = unknown>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Standard Conflict Resolver Implementation
 * Implements the canonical 'clinician_precedence_with_notification' rule.
 */
export function resolveClinicianPrecedenceConflict(
  serverRecord: Record<string, unknown>,
  clientMutation: MutationRecord
): ConflictResolutionResult {
  const serverRole = typeof serverRecord.updated_by_role === 'string'
    ? serverRecord.updated_by_role
    : (typeof serverRecord.operator_role === 'string' ? serverRecord.operator_role : undefined);

  const isServerClinician = serverRole === 'nurse' || serverRole === 'admin' || serverRole === 'facility_admin';

  if (isServerClinician) {
    return {
      resolution: 'accept_server',
      userNotificationRequired: true,
      notificationCode: 'overwritten_by_clinician',
      details: `Clinical data for ${clientMutation.entity} #${clientMutation.id} was updated authoritatively by healthcare provider. Caregiver offline edit reconciled.`,
    };
  }

  // Last-Write-Wins fallback based on timestamps when neither is privileged clinician
  const serverTimestamp = typeof serverRecord.updated_at === 'string'
    ? serverRecord.updated_at
    : (typeof serverRecord.created_at === 'string' ? serverRecord.created_at : '');

  const clientTimestamp = clientMutation.timestamp;

  if (serverTimestamp && clientTimestamp && clientTimestamp < serverTimestamp) {
    return {
      resolution: 'accept_server',
      userNotificationRequired: true,
      notificationCode: 'data_reconciled',
      details: `Server holds more recent record for ${clientMutation.entity}. Local changes reconciled.`,
    };
  }

  return {
    resolution: 'force_client',
    userNotificationRequired: false,
    notificationCode: 'data_reconciled',
    details: `Client mutation applied successfully to server.`,
  };
}
