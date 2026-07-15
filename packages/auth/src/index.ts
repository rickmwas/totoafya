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

// Pure JavaScript SHA-256 implementation (works in Node, Web, React Native, Tauri)
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;

  const result = [];
  const words: number[] = [];
  const asciiLength = ascii[lengthProperty];
  
  const hash: number[] = [];
  const k: number[] = [];

  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false;
    }
    return true;
  };

  let candidate = 2;
  while (hash[lengthProperty] < 8 || k[lengthProperty] < 64) {
    if (isPrime(candidate)) {
      if (hash[lengthProperty] < 8) {
        hash.push((mathPow(candidate, 1 / 2) * maxWord) | 0);
      }
      k.push((mathPow(candidate, 1 / 3) * maxWord) | 0);
    }
    candidate++;
  }

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    const charCode = ascii.charCodeAt(i);
    if (charCode >> 8) return '';
    words[i >> 2] |= charCode << (24 - 8 * (i & 3));
  }
  words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
  words[words[lengthProperty]] = (asciiLength * 8) | 0;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      const expandedWord = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      w[i] = expandedWord;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + expandedWord) | 0;
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    let word = hash[i];
    if (word < 0) word += maxWord;
    let wordHex = word.toString(16);
    while (wordHex[lengthProperty] < 8) wordHex = '0' + wordHex;
    result.push(wordHex);
  }
  return result.join('');
}

// Client pre-hash helper for storage and queries
export function hashCredential(value: string): string {
  if (!value) return '';
  return sha256(value.trim());
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
  // Remove administrative guessing; default fallback to standard checks but rely primarily on session metadata role assignments
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
