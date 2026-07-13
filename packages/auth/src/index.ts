export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'nurse' | 'doctor' | 'admin' | 'county_admin' | 'moh_admin' | 'super_admin';
  facility_id?: string;
  mother_id?: string;
  nurse_id?: string;
  profile_complete?: boolean;
}

export type Capability =
  | 'appointments:view' | 'growth:view' | 'vaccinations:view' | 'chat:use' | 'symptoms:create'
  | 'mother:create' | 'anc:update' | 'vaccination:create' | 'growth:update'
  | 'diagnosis:create' | 'prescription:create' | 'risk:update' | 'referral:create'
  | 'staff:manage' | 'reports:view' | 'facility:configure'
  | 'national_analytics:view' | 'population_statistics:view'
  | 'infrastructure:manage';

export const ROLE_CAPABILITIES: Record<UserProfile['role'], Capability[]> = {
  user: [
    'appointments:view',
    'growth:view',
    'vaccinations:view',
    'chat:use',
    'symptoms:create'
  ],
  nurse: [
    'appointments:view',
    'growth:view',
    'vaccinations:view',
    'chat:use',
    'symptoms:create',
    'mother:create',
    'anc:update',
    'vaccination:create',
    'growth:update'
  ],
  doctor: [
    'appointments:view',
    'growth:view',
    'vaccinations:view',
    'chat:use',
    'symptoms:create',
    'mother:create',
    'anc:update',
    'vaccination:create',
    'growth:update',
    'diagnosis:create',
    'prescription:create',
    'risk:update',
    'referral:create'
  ],
  admin: [
    'appointments:view',
    'reports:view',
    'staff:manage',
    'facility:configure'
  ],
  county_admin: [
    'reports:view'
  ],
  moh_admin: [
    'national_analytics:view',
    'population_statistics:view'
  ],
  super_admin: [
    'infrastructure:manage'
  ]
};

export function hasCapability(role: UserProfile['role'], capability: Capability): boolean {
  const caps = ROLE_CAPABILITIES[role];
  return caps ? caps.includes(capability) : false;
}

export function determineUserRole(email: string): UserProfile['role'] {
  if (!email) return 'user';
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === 'cto@terraseptsolutions.com') {
    return 'super_admin';
  }
  if (cleanEmail.startsWith('mother-') && cleanEmail.endsWith('@totoafya.org')) {
    return 'user';
  }
  if (cleanEmail.includes('admin') || cleanEmail.includes('facility')) {
    return 'admin';
  }
  if (cleanEmail.includes('nurse')) {
    return 'nurse';
  }
  if (cleanEmail.includes('doctor')) {
    return 'doctor';
  }
  return 'user';
}

export function isProfileComplete(motherRecord?: { profile_complete?: boolean } | null): boolean {
  return !!motherRecord?.profile_complete;
}

export function validateMotherPin(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

export function validateNursePin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim());
}

// Retain legacy method signature for backward compatibility mapping
export function validatePin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim());
}

export function validateNationalId(id: string): boolean {
  return /^\d{7,8}$/.test(id.trim());
}

export function validateAncNumber(anc: string): boolean {
  return anc.trim().length >= 4;
}

export * from './localCrypt';
