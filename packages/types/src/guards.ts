/**
 * TotoAfya Digital — Strict Type Guards & Validators
 * Ensures runtime validation without unsafe 'any' assertions.
 */

import type { Mother, Child, ANCVisit, GrowthRecord, ImmunizationRecord, MilestoneRecord, AIAlert } from './entities';
import type { MutationRecord, MutationEntity, MutationAction, MutationSyncStatus } from './outbox';
import type { UserRole } from './auth';
import type { BloodPressureReading, MUACMeasurement } from './clinical';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'mother' || value === 'nurse' || value === 'facility_admin' || value === 'chv';
}

export function isMother(value: unknown): value is Mother {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.full_name === 'string';
}

export function isChild(value: unknown): value is Child {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.full_name === 'string' &&
    typeof value.date_of_birth === 'string' &&
    (value.gender === 'male' || value.gender === 'female')
  );
}

export function isANCVisit(value: unknown): value is ANCVisit {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.visit_date === 'string';
}

export function isGrowthRecord(value: unknown): value is GrowthRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.recorded_date === 'string';
}

export function isImmunizationRecord(value: unknown): value is ImmunizationRecord {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.vaccine_name === 'string' &&
    typeof value.scheduled_date === 'string'
  );
}

export function isMilestoneRecord(value: unknown): value is MilestoneRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.milestone_name === 'string';
}

export function isAIAlert(value: unknown): value is AIAlert {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.message === 'string'
  );
}

export function isMutationEntity(value: unknown): value is MutationEntity {
  return (
    value === 'Mother' ||
    value === 'Child' ||
    value === 'ANCVisit' ||
    value === 'GrowthRecord' ||
    value === 'Immunization' ||
    value === 'Milestone'
  );
}

export function isMutationAction(value: unknown): value is MutationAction {
  return value === 'create' || value === 'update' || value === 'delete';
}

export function isMutationSyncStatus(value: unknown): value is MutationSyncStatus {
  return (
    value === 'pending' ||
    value === 'in_flight' ||
    value === 'synced' ||
    value === 'failed' ||
    value === 'dead_letter'
  );
}

export function isMutationRecord(value: unknown): value is MutationRecord {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    isMutationEntity(value.entity) &&
    isMutationAction(value.action) &&
    isRecord(value.payload) &&
    typeof value.base_version === 'number' &&
    typeof value.user_id === 'string' &&
    typeof value.operator_id === 'string' &&
    typeof value.facility_id === 'string' &&
    typeof value.timestamp === 'string' &&
    isMutationSyncStatus(value.sync_status) &&
    typeof value.retry_count === 'number'
  );
}

export function isBloodPressureReading(value: unknown): value is BloodPressureReading {
  if (!isRecord(value)) return false;
  return (
    typeof value.systolic === 'number' &&
    typeof value.diastolic === 'number' &&
    typeof value.measuredAt === 'string' &&
    typeof value.isPreEclampsiaRisk === 'boolean'
  );
}

export function isMUACMeasurement(value: unknown): value is MUACMeasurement {
  if (!isRecord(value)) return false;
  return (
    typeof value.muacCm === 'number' &&
    typeof value.childAgeMonths === 'number' &&
    (value.classification === 'SAM' || value.classification === 'MAM' || value.classification === 'NORMAL') &&
    typeof value.isEligible === 'boolean'
  );
}
