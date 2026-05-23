export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'nurse' | 'admin' | 'super_admin';
  facility_id?: string;
  mother_id?: string;
  nurse_id?: string;
  profile_complete?: boolean;
}

export function determineUserRole(email: string): 'super_admin' | 'admin' | 'nurse' | 'user' {
  if (!email) return 'user';
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === 'super@totoafya.org') {
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
  return 'user';
}

export function isProfileComplete(motherRecord?: { profile_complete?: boolean } | null): boolean {
  return !!motherRecord?.profile_complete;
}

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin.trim());
}

export function validateNationalId(id: string): boolean {
  return /^\d{7,8}$/.test(id.trim());
}

export function validateAncNumber(anc: string): boolean {
  return anc.trim().length >= 4;
}

