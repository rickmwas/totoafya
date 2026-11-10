/**
 * TotoAfya Digital — Authentication & Multi-Tenant Session Types
 * Shared-device PIN protection, role verification, and hospital tenant context.
 */

/**
 * Standardized User Roles across TotoAfya Digital Portals
 * - mother: Caregiver / Patient using Mother Web PWA or Mother Native Expo
 * - nurse: Health worker documenting clinical encounters in Nurse Portal
 * - facility_admin: Hospital administrator managing facility PC / staff
 * - chv: Community Health Volunteer conducting household visits
 */
export type UserRole = 'mother' | 'nurse' | 'facility_admin' | 'chv';

/**
 * PIN Authentication Session
 * Supports shared household smartphones with 4-digit PIN lock and biometric unlock.
 */
export interface PINAuthSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly userRole: UserRole;
  readonly phoneOrIdentifier: string;
  readonly facilityId?: string;
  readonly motherId?: string;
  readonly nurseId?: string;
  readonly authenticatedAt: string; // ISO 8601 timestamp
  readonly expiresAt: string; // ISO 8601 timestamp
  readonly isBiometricAvailable: boolean;
  readonly isBiometricEnabled: boolean;
  readonly isLocked: boolean;
  readonly failedAttempts: number;
  readonly maxAttempts: number; // Default 5 before lockout
  readonly lockoutUntil?: string; // ISO 8601 timestamp
}

/**
 * Multi-Facility Tenant Context
 * Guarantees Row-Level Security (RLS) scoping and offline facility partitioning.
 */
export interface TenantContext {
  readonly facilityId: string;
  readonly facilityCode?: string;
  readonly facilityName: string;
  readonly county?: string;
  readonly subCounty?: string;
  readonly userId: string;
  readonly userRole: UserRole;
  readonly operatorId?: string;
  readonly offlineMode: boolean;
  readonly syncStatus: 'synced' | 'pending' | 'syncing' | 'error' | 'offline';
}
