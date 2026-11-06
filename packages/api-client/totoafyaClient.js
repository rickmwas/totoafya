import { supabaseDb } from './supabaseClient';

const getEnv = (key) => {
  if (typeof window !== 'undefined' && window.__TOTOAFYA_ENV__ && window.__TOTOAFYA_ENV__[key] !== undefined) {
    return window.__TOTOAFYA_ENV__[key];
  }
  // Statically reference keys so Vite's compiler can replace them at build time
  if (key === 'VITE_DATABASE_PROVIDER') return import.meta.env.VITE_DATABASE_PROVIDER;
  if (key === 'VITE_SUPABASE_URL') return import.meta.env.VITE_SUPABASE_URL;
  if (key === 'VITE_SUPABASE_ANON_KEY') return import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (key === 'VITE_GEMINI_API_KEY') return import.meta.env.VITE_GEMINI_API_KEY;

  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[`EXPO_PUBLIC_${key}`]) {
    return process.env[`EXPO_PUBLIC_${key}`];
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  return null;
};

const isSupabase = getEnv('VITE_DATABASE_PROVIDER') === 'supabase' || getEnv('DATABASE_PROVIDER') === 'supabase';

// Local localStorage-backed database — no totoafya dependencies

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function getStore(entityName) {
  try {
    const raw = localStorage.getItem(`db_${entityName}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStore(entityName, records) {
  localStorage.setItem(`db_${entityName}`, JSON.stringify(records));
}

function seedInitialLocalData() {
  try {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem('db_Facility')) {
      const facilities = [
        { id: 'fac-a-id', name: 'Nairobi South Sub-County Hospital', facility_code: 'FAC-001', level: 'Level 4', county: 'Nairobi', sub_county: 'Langata', phone: '+254 20 1234567', subscription_tier: 'gold', subscription_status: 'active', created_date: new Date().toISOString() },
        { id: 'fac-b-id', name: 'Kibera Maternal Health Center', facility_code: 'FAC-002', level: 'Level 3', county: 'Nairobi', sub_county: 'Kibra', phone: '+254 20 7654321', subscription_tier: 'silver', subscription_status: 'active', created_date: new Date().toISOString() }
      ];
      localStorage.setItem('db_Facility', JSON.stringify(facilities));
    }
    if (!localStorage.getItem('db_Nurse')) {
      const nurses = [
        { id: 'nurse-1', user_id: 'mock-nurse-1', facility_id: 'fac-a-id', full_name: 'Nurse Joy Wambui', email: 'nurse-a@facility.org', role: 'nurse', designation: 'Maternity Senior Staff Nurse', employee_id: 'NURSE-001', phone: '+254 711 223344', pin_code: '1234', badge_token: 'BADGE-NURSE-01', status: 'active', created_date: new Date().toISOString() },
        { id: 'nurse-2', user_id: 'mock-nurse-2', facility_id: 'fac-a-id', full_name: 'Sister Mary Otieno', email: 'nurse-b@facility.org', role: 'nurse', designation: 'Pediatric Clinic Nurse', employee_id: 'NURSE-002', phone: '+254 722 334455', pin_code: '1234', badge_token: 'BADGE-NURSE-02', status: 'active', created_date: new Date().toISOString() }
      ];
      localStorage.setItem('db_Nurse', JSON.stringify(nurses));
    }
    if (!localStorage.getItem('db_Mother')) {
      const mothers = [
        { id: 'mock-mother-1', user_id: 'mock-user-1', facility_id: 'fac-a-id', national_id: '12345678', anc_number: 'ANC-2026-001', pin_code: '123456', full_name: 'Amina Mwangi', phone: '+254 712 345678', county: 'Nairobi', sub_county: 'Langata', blood_group: 'O+', caregiver_type: 'mother', pregnancy_status: 'postpartum', lmp: '2025-05-10', edd: '2026-02-15', risk_level: 'low', risk_score: 15, profile_complete: true, subscription_status: 'sponsored', created_date: new Date(Date.now() - 90 * 86400000).toISOString() },
        { id: 'mock-mother-2', user_id: 'mock-user-2', facility_id: 'fac-a-id', national_id: '87654321', anc_number: 'ANC-2026-002', pin_code: '123456', full_name: 'Faith Wanjiku', phone: '+254 722 998877', county: 'Nairobi', sub_county: 'Westlands', blood_group: 'A+', caregiver_type: 'mother', pregnancy_status: 'pregnant', lmp: '2026-05-15', edd: '2027-02-20', risk_level: 'medium', risk_score: 45, profile_complete: true, subscription_status: 'sponsored', created_date: new Date(Date.now() - 30 * 86400000).toISOString() }
      ];
      localStorage.setItem('db_Mother', JSON.stringify(mothers));
    }
    if (!localStorage.getItem('db_Child')) {
      const children = [
        { id: 'child-1', mother_id: 'mock-mother-1', name: 'Baby Jabali Mwangi', full_name: 'Baby Jabali Mwangi', dob: '2026-02-10', date_of_birth: '2026-02-10', gender: 'male', birth_weight: 3.4, birth_height: 50, blood_group: 'O+', created_date: new Date(Date.now() - 80 * 86400000).toISOString() }
      ];
      localStorage.setItem('db_Child', JSON.stringify(children));
    } else {
      const existingChildren = getStore('Child');
      if (existingChildren && existingChildren.length > 0) {
        let updated = false;
        existingChildren.forEach(c => {
          if (!c.date_of_birth && c.dob) { c.date_of_birth = c.dob; updated = true; }
          if (!c.dob && c.date_of_birth) { c.dob = c.date_of_birth; updated = true; }
          if (!c.full_name && c.name) { c.full_name = c.name; updated = true; }
          if (!c.name && c.full_name) { c.name = c.full_name; updated = true; }
        });
        if (updated) saveStore('Child', existingChildren);
      }
    }
    if (!localStorage.getItem('db_ANCVisit')) {
      const ancVisits = [
        { id: 'anc-1', mother_id: 'mock-mother-1', visit_number: 1, visit_date: '2025-07-15', gestation_weeks: 9, weight_kg: 58.5, bp_systolic: 118, bp_diastolic: 76, fundal_height_cm: 10, fetal_heart_rate: 140, danger_signs: [], notes: 'Routine initial visit. All vitals normal.', created_date: '2025-07-15T09:00:00Z' },
        { id: 'anc-2', mother_id: 'mock-mother-1', visit_number: 2, visit_date: '2025-09-20', gestation_weeks: 18, weight_kg: 61.2, bp_systolic: 120, bp_diastolic: 78, fundal_height_cm: 18, fetal_heart_rate: 144, danger_signs: [], notes: 'Fetal movement positive, ultrasound normal.', created_date: '2025-09-20T10:30:00Z' }
      ];
      localStorage.setItem('db_ANCVisit', JSON.stringify(ancVisits));
    }
    if (!localStorage.getItem('db_GrowthRecord')) {
      const growth = [
        { id: 'growth-1', child_id: 'child-1', recorded_date: '2026-02-10', weight_kg: 3.4, height_cm: 50, muac_cm: 11.5, z_score: 0.1, status: 'normal', created_date: '2026-02-10T08:00:00Z' },
        { id: 'growth-2', child_id: 'child-1', recorded_date: '2026-03-24', weight_kg: 4.8, height_cm: 56, muac_cm: 13.0, z_score: 0.2, status: 'normal', created_date: '2026-03-24T09:15:00Z' }
      ];
      localStorage.setItem('db_GrowthRecord', JSON.stringify(growth));
    }
    if (!localStorage.getItem('db_Immunization')) {
      const immunizations = [
        { id: 'imm-1', child_id: 'child-1', vaccine_name: 'BCG', due_date: '2026-02-10', administered_date: '2026-02-10', status: 'given', batch_number: 'BCG-2026-A', created_date: '2026-02-10T08:30:00Z' },
        { id: 'imm-2', child_id: 'child-1', vaccine_name: 'OPV 0 (Birth Oral Polio)', due_date: '2026-02-10', administered_date: '2026-02-10', status: 'given', batch_number: 'OPV-882', created_date: '2026-02-10T08:30:00Z' },
        { id: 'imm-3', child_id: 'child-1', vaccine_name: 'Penta 1 (DTP-HepB-Hib)', due_date: '2026-03-24', administered_date: '2026-03-24', status: 'given', batch_number: 'PNT-331', created_date: '2026-03-24T09:30:00Z' },
        { id: 'imm-4', child_id: 'child-1', vaccine_name: 'Rotavirus 1', due_date: '2026-03-24', administered_date: '2026-03-24', status: 'given', batch_number: 'ROTA-101', created_date: '2026-03-24T09:30:00Z' },
        { id: 'imm-5', child_id: 'child-1', vaccine_name: 'Penta 2 (10 Weeks)', due_date: '2026-04-21', status: 'scheduled', created_date: '2026-02-10T08:30:00Z' }
      ];
      localStorage.setItem('db_Immunization', JSON.stringify(immunizations));
    }
    if (!localStorage.getItem('db_AIAlert')) {
      const alerts = [
        { id: 'alert-1', mother_id: 'mock-mother-1', title: 'Upcoming 10-Week Immunization', message: 'Baby Jabali is scheduled for OPV 2, Penta 2, and Rotavirus 2 in 7 days.', severity: 'info', is_read: false, created_date: new Date().toISOString() }
      ];
      localStorage.setItem('db_AIAlert', JSON.stringify(alerts));
    }
  } catch (err) {
    console.error('Failed to seed local mock database:', err);
  }
}
seedInitialLocalData();


function sortRecords(records, sortKey) {
  if (!sortKey) return records;
  const desc = sortKey.startsWith('-');
  const key = desc ? sortKey.slice(1) : sortKey;
  return [...records].sort((a, b) => {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

function matchesFilter(record, conditions) {
  for (const [key, val] of Object.entries(conditions)) {
    if (Array.isArray(val)) {
      if (!val.includes(record[key])) return false;
    } else {
      if (record[key] !== val) return false;
    }
  }
  return true;
}

function makeEntityStore(name) {
  return {
    list: async (sortKey = '-created_date', limit = 100) => {
      const records = getStore(name);
      const sorted = sortRecords(records, sortKey);
      return limit ? sorted.slice(0, limit) : sorted;
    },
    filter: async (conditions = {}, sortKey = '-created_date', limit = 100) => {
      const records = getStore(name);
      const filtered = records.filter(r => matchesFilter(r, conditions));
      const sorted = sortRecords(filtered, sortKey);
      return limit ? sorted.slice(0, limit) : sorted;
    },
    get: async (id) => {
      const records = getStore(name);
      return records.find(r => r.id === id) || null;
    },
    create: async (data) => {
      const records = getStore(name);
      const newRecord = {
        ...data,
        id: generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      records.push(newRecord);
      saveStore(name, records);
      return newRecord;
    },
    bulkCreate: async (recordsList) => {
      const records = getStore(name);
      const newRecords = recordsList.map(r => ({
        ...r,
        id: generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }));
      records.push(...newRecords);
      saveStore(name, records);
      return newRecords;
    },
    update: async (id, data) => {
      const records = getStore(name);
      const idx = records.findIndex(r => r.id === id);
      if (idx === -1) throw new Error(`${name} record not found: ${id}`);
      records[idx] = { ...records[idx], ...data, updated_date: new Date().toISOString() };
      saveStore(name, records);
      return records[idx];
    },
    delete: async (id) => {
      const records = getStore(name);
      const filtered = records.filter(r => r.id !== id);
      saveStore(name, filtered);
      return { id };
    },
  };
}

const ENTITY_NAMES = [
  'Mother', 'Child', 'AIAlert', 'ANCVisit',
  'GrowthRecord', 'Milestone', 'Immunization', 'LearningContent',
  'ChildImmunization', 'Facility', 'Nurse', 'DeveloperConcern', 'FeatureFlag'
];

const entities = Object.fromEntries(
  ENTITY_NAMES.map(name => [name, makeEntityStore(name)])
);

const MOCK_USERS = {
  super_admin: {
    id: 'mock-super-admin',
    email: 'cto@terraseptsolutions.com',
    full_name: 'Super Admin',
    role: 'super_admin',
  },
  facility_admin: {
    id: 'mock-facility-admin',
    email: 'admin-a@facility.org',
    full_name: 'Facility A Admin',
    role: 'admin',
    facility_id: 'fac-a-id',
  },
  nurse: {
    id: 'mock-nurse',
    email: 'nurse-a@facility.org',
    full_name: 'Nurse Joy',
    role: 'nurse',
    facility_id: 'fac-a-id',
  },
  user: {
    id: 'mock-user',
    email: 'mother-a@local.app',
    full_name: 'Mother A',
    role: 'user',
    facility_id: 'fac-a-id',
  }
};

const getActiveMockUser = () => {
  try {
    const customUser = localStorage.getItem('custom_mock_user');
    if (customUser) {
      return JSON.parse(customUser);
    }
  } catch (e) {
    console.error("Failed to parse custom_mock_user", e);
  }
  const savedRole = localStorage.getItem('active_mock_role');
  if (savedRole && MOCK_USERS[savedRole]) {
    return MOCK_USERS[savedRole];
  }
  if (typeof window !== 'undefined') {
    if (window.location.port === '5003') return MOCK_USERS.super_admin;
    if (window.location.port === '5002') return MOCK_USERS.facility_admin;
    if (window.location.port === '5001') return MOCK_USERS.nurse;
  }
  return MOCK_USERS.user;
};

const auth = {
  quickLogin: (roleKey = 'user') => {
    const target = MOCK_USERS[roleKey] || MOCK_USERS.user;
    localStorage.setItem('custom_mock_user', JSON.stringify(target));
    localStorage.setItem('active_mock_role', target.role === 'admin' ? 'facility_admin' : target.role);
    localStorage.setItem('is_logged_in', 'true');
    localStorage.removeItem('is_logged_out');
    return target;
  },
    signInWithNationalIdOrAnc: async (identifier, pin, activationCode = null) => {
    localStorage.removeItem('is_logged_out');
    const cleanId = (identifier || '12345678').trim();
    const cleanPin = (pin || '123456').trim();
    const mothers = getStore('Mother');
    
    // 1. Try to find matching mother
    let mother = mothers.find(m => 
      (m.national_id === cleanId || m.anc_number === cleanId || m.phone === cleanId) && 
      (!cleanPin || m.pin_code === cleanPin)
    );

    // 2. In local mode, if not found, auto-create/log in with demo mother
    if (!mother) {
      mother = mothers[0] || {
        id: 'mock-mother-1',
        user_id: 'mock-user-1',
        full_name: 'Amina Mwangi (Demo Caregiver)',
        national_id: cleanId,
        anc_number: cleanId.includes('ANC') ? cleanId : 'ANC-2026-001',
        pin_code: cleanPin,
        phone: '+254712345678',
        facility_id: 'fac-a-id',
        profile_complete: true,
        subscription_status: 'sponsored'
      };
      if (!mothers.some(m => m.id === mother.id)) {
        mothers.push(mother);
        saveStore('Mother', mothers);
      }
    }

    const mockUser = {
      id: mother.user_id || 'mock-user-' + mother.id,
      email: `${cleanId}@local.app`,
      full_name: mother.full_name || 'Amina Mwangi',
      role: 'user',
      facility_id: mother.facility_id || 'fac-a-id',
      mother_id: mother.id,
      national_id: mother.national_id || cleanId,
      anc_number: mother.anc_number || 'ANC-2026-001',
      profile_complete: true,
      subscription_status: mother.subscription_status || 'sponsored',
    };
    
    localStorage.setItem('custom_mock_user', JSON.stringify(mockUser));
    localStorage.setItem('active_mock_role', 'user');
    localStorage.setItem('is_logged_in', 'true');
    return mockUser;
  },
  signUpMother: async (identifier, pin, metadata) => {
    const mothers = getStore('Mother');
    const existing = mothers.find(m => m.national_id === identifier || m.anc_number === identifier);
    if (existing) {
      throw new Error('Mother already registered');
    }

    const userId = 'mock-user-' + generateId();
    const newMother = {
      id: generateId(),
      user_id: userId,
      full_name: metadata.full_name,
      pin_code: pin,
      facility_id: metadata.facility_id || null,
      national_id: identifier.includes('ANC') ? null : identifier,
      anc_number: identifier.includes('ANC') ? identifier : null,
      profile_complete: metadata.profile_complete ?? false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    mothers.push(newMother);
    saveStore('Mother', mothers);

    const mockUser = {
      id: userId,
      email: `${identifier}@local.app`,
      full_name: metadata.full_name,
      role: 'user',
      facility_id: metadata.facility_id || null,
      mother_id: newMother.id,
      profile_complete: newMother.profile_complete,
    };
    
    localStorage.setItem('custom_mock_user', JSON.stringify(mockUser));
    localStorage.setItem('is_logged_in', 'true');
    return mockUser;
  },
  loginNurseWithBadge: async (badgeToken) => {
    localStorage.setItem('active_mock_role', 'nurse');
    localStorage.setItem('is_logged_in', 'true');
    return MOCK_USERS.nurse;
  },
  verifyNursePin: async (email, pin) => {
    localStorage.setItem('active_mock_role', 'nurse');
    localStorage.setItem('is_logged_in', 'true');
    return MOCK_USERS.nurse;
  },
  me: async () => {
    const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (!isLoggedIn) return null;

    try {
      const customUser = localStorage.getItem('custom_mock_user');
      const user = customUser ? JSON.parse(customUser) : null;
      if (user && user.role === 'user') {
        const mothersStore = getStore('Mother');
        const mother = mothersStore.find(m => m.user_id === user.id || m.id === user.mother_id) || mothersStore[0];
        if (mother) {
          let status = mother.subscription_status || 'trial';
          let trialEndDate = mother.trial_end_date;
          if (!trialEndDate && !mother.facility_id) {
            const createdDate = mother.created_date ? new Date(mother.created_date) : new Date();
            trialEndDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            mother.trial_end_date = trialEndDate;
            saveStore('Mother', mothersStore);
          }

          const isB2C = !mother.facility_id;
          if (isB2C) {
            if (status === 'trial' && new Date() > new Date(trialEndDate)) {
              status = 'expired';
              mother.subscription_status = 'expired';
              saveStore('Mother', mothersStore);
            }
          } else {
            status = 'sponsored';
            if (mother.subscription_status !== 'sponsored') {
              mother.subscription_status = 'sponsored';
              saveStore('Mother', mothersStore);
            }
          }

          return {
            ...user,
            subscription_status: status,
            trial_end_date: trialEndDate,
            facility_id: mother.facility_id || null,
            profile_complete: mother.profile_complete || false,
            mother_id: mother.id,
          };
        }
      }
      return user || getActiveMockUser();
    } catch {
      return getActiveMockUser();
    }
  },
  isAuthenticated: async () => {
    return localStorage.getItem('is_logged_in') === 'true';
  },
  signInWithGoogle: async (role = 'user') => {
    localStorage.setItem('active_mock_role', role);
    localStorage.setItem('is_logged_in', 'true');
    return MOCK_USERS[role] || MOCK_USERS.user;
  },
  login: async (email, password) => {
    if (!email) throw new Error('Please enter your email.');
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check hardcoded MOCK_USERS
    const foundRole = Object.keys(MOCK_USERS).find(r => MOCK_USERS[r].email.toLowerCase() === cleanEmail);
    if (foundRole) {
      localStorage.removeItem('custom_mock_user');
      localStorage.setItem('active_mock_role', foundRole);
      localStorage.setItem('is_logged_in', 'true');
      return MOCK_USERS[foundRole];
    }

    // 2. Check registered Nurse / Staff entity store (db_Nurse)
    const nursesStore = getStore('Nurse');
    const nurse = nursesStore.find(n => n.email && n.email.toLowerCase() === cleanEmail);
    if (nurse) {
      if (nurse.status === 'pending_activation' || nurse.status === 'pending') {
        nurse.status = 'active';
        saveStore('Nurse', nursesStore);
      }

      const nurseUser = {
        id: nurse.user_id || 'mock-nurse-' + nurse.id,
        nurse_id: nurse.id,
        email: nurse.email,
        full_name: nurse.full_name,
        role: nurse.role === 'admin' ? 'admin' : (nurse.role || 'nurse'),
        facility_id: nurse.facility_id || 'fac-a-id',
        employee_id: nurse.employee_id || nurse.id,
        designation: nurse.designation || 'Nurse',
      };

      localStorage.setItem('custom_mock_user', JSON.stringify(nurseUser));
      localStorage.setItem('active_mock_role', nurseUser.role === 'admin' ? 'facility_admin' : 'nurse');
      localStorage.setItem('is_logged_in', 'true');
      return nurseUser;
    }

    // 3. Check registered Mother entity store (db_Mother)
    const mothersStore = getStore('Mother');
    const mother = mothersStore.find(m => (m.email && m.email.toLowerCase() === cleanEmail));
    if (mother) {
      const motherUser = {
        id: mother.user_id || 'mock-user-' + mother.id,
        email: mother.email,
        full_name: mother.full_name,
        role: 'user',
        facility_id: mother.facility_id || null,
        mother_id: mother.id,
        profile_complete: mother.profile_complete ?? true,
      };

      localStorage.setItem('custom_mock_user', JSON.stringify(motherUser));
      localStorage.setItem('active_mock_role', 'user');
      localStorage.setItem('is_logged_in', 'true');
      return motherUser;
    }

    // 4. Local mode dynamic fallback for any valid email
    const dynamicUser = {
      id: 'mock-' + Math.random().toString(36).slice(2),
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Staff Member',
      role: cleanEmail.includes('admin') ? 'admin' : (cleanEmail.includes('super') ? 'super_admin' : 'nurse'),
      facility_id: nursesStore[0]?.facility_id || 'fac-a-id',
    };

    localStorage.setItem('custom_mock_user', JSON.stringify(dynamicUser));
    localStorage.setItem('active_mock_role', dynamicUser.role === 'admin' ? 'facility_admin' : 'nurse');
    localStorage.setItem('is_logged_in', 'true');
    return dynamicUser;
  },
  signUp: async (email, password, metadata = {}) => {
    const newUser = {
      id: 'mock-' + Math.random().toString(36).slice(2),
      email,
      full_name: metadata.full_name || email.split('@')[0],
      role: metadata.role || 'user',
      facility_id: metadata.facility_id || 'fac-a-id',
    };
    localStorage.setItem('custom_mock_user', JSON.stringify(newUser));
    localStorage.setItem('active_mock_role', newUser.role);
    localStorage.setItem('is_logged_in', 'true');
    return newUser;
  },
  logout: () => {
    localStorage.removeItem('custom_mock_user');
    localStorage.removeItem('active_mock_role');
    localStorage.setItem('is_logged_in', 'false');
    localStorage.setItem('is_logged_out', 'true');
    window.location.href = '/login';
  },
  redirectToLogin: () => {
    window.location.href = '/login';
  },
  switchMockRole: (role) => {
    if (MOCK_USERS[role]) {
      localStorage.setItem('active_mock_role', role);
      localStorage.setItem('is_logged_in', 'true');
      window.location.reload();
    }
  }
};

function generateMockResponse(prompt, response_json_schema) {
  if (response_json_schema) {
    const isSwahili = prompt.toLowerCase().includes('swahili') || prompt.toLowerCase().includes('lang: sw');
    const hasDanger = prompt.toLowerCase().includes('danger') || prompt.toLowerCase().includes('hatari') || prompt.toLowerCase().includes('fever') || prompt.toLowerCase().includes('critical');

    const riskScore = hasDanger ? 75 : 20;
    const riskLevel = hasDanger ? 'high' : 'low';

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      summary: hasDanger
        ? "The patient shows potential danger signs that require urgent clinical attention. Please consult a health worker immediately."
        : "The patient is healthy and all growth indicators are currently within normal range. Keep up the routine immunization schedule.",
      summary_sw: hasDanger
        ? "Mgonjwa anaonyesha dalili za hatari zinazohitaji uangalizi wa haraka wa kliniki. Tafadhali wasiliana na mfanyakazi wa afya mara moja."
        : "Mtoto ana afya njema na viashiria vyote vya ukuaji viko kawaida kwa sasa. Endelea na ratiba ya chanjo ya kawaida.",
      alerts: hasDanger ? [
        {
          type: "danger_flag",
          severity: "critical",
          title: "Urgent Clinic Visit Required",
          title_sw: "Uchunguzi wa Haraka wa Kliniki Unahitajika",
          message: "Potential danger signs detected. Please visit the nearest health facility immediately.",
          message_sw: "Dalili za hatari zimegunduliwa. Tafadhali tembelea kituo cha afya kilicho karibu mara moja.",
          chv_needed: true
        }
      ] : [
        {
          type: "routine_check",
          severity: "info",
          title: "All Parameters Normal",
          title_sw: "Vipimo Vyote Viko Sawa",
          message: "Weight and height are tracking well against WHO growth standards.",
          message_sw: "Uzito na urefu vinafuatiliwa vizuri kulingana na viwango vya ukuaji vya WHO.",
          chv_needed: false
        }
      ],
      recommendations: hasDanger ? [
        {
          action: "Seek medical assessment at facility",
          action_sw: "Tafuta uchunguzi wa matibabu kituoni",
          priority: "high",
          icon: "alert-triangle"
        },
        {
          action: "Inform Community Health Volunteer (CHV)",
          action_sw: "Mfahamishe Mjitoleaji wa Afya ya Jamii (CHV)",
          priority: "medium",
          icon: "users"
        }
      ] : [
        {
          action: "Continue exclusive breastfeeding (if under 6 months)",
          action_sw: "Endelea na unyonyeshaji wa maziwa ya mama pekee (kama yuko chini ya miezi 6)",
          priority: "low",
          icon: "heart"
        },
        {
          action: "Monitor milestones and growth monthly",
          action_sw: "Fuatilia hatua za ukuaji kila mwezi",
          priority: "low",
          icon: "trending-up"
        }
      ]
    };
  }

  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('danger') || promptLower.includes('hatari') || promptLower.includes('dalili')) {
    return `Maternal Danger Signs in Pregnancy and Postpartum / Dalili za Hatari wakati wa Uja uzito na Baada ya Kujifungua:
1. Severe headache or blurred vision (Kuumwa na kichwa sana au kutoona vizuri).
2. Vaginal bleeding (Kutokwa na damu ukeni).
3. Convulsions or fits (Kifafa cha mimba).
4. High fever (Homa kali).
5. Baby stops moving or moves less (Mtoto kuacha kucheza au kucheza kwa nadra).
6. Severe abdominal pain (Maumivu makali ya tumbo).

If you experience any of these symptoms, please visit the nearest health center immediately.`;
  }

  if (promptLower.includes('vaccine') || promptLower.includes('chanjo')) {
    return `Kenya National Immunization Schedule / Ratiba ya Chanjo Nchini Kenya:
- Birth (Kuzaliwa): BCG, OPV 0 (Kuzuia Kifua Kikuu na Polio).
- 6 Weeks (Wiki 6): OPV 1, Pentavalent 1, Rotavirus 1, PCV 1.
- 10 Weeks (Wiki 10): OPV 2, Pentavalent 2, Rotavirus 2, PCV 2.
- 14 Weeks (Wiki 14): IPV, Pentavalent 3, PCV 3.
- 9 Months (Miezi 9): Measles-Rubella 1, Yellow Fever.
- 18 Months (Miezi 18): Measles-Rubella 2.

Ensure your child gets all vaccines on time for full protection.`;
  }

  if (promptLower.includes('anc') || promptLower.includes('visit') || promptLower.includes('kliniki')) {
    return `Antenatal Care (ANC) Visit Recommendations / Ushauri wa Mahudhurio ya Kliniki (ANC):
WHO recommends at least 8 contacts during pregnancy:
1. First contact: before 12 weeks of pregnancy.
2. Second contact: 20 weeks.
3. Third contact: 26 weeks.
4. Fourth contact: 30 weeks.
5. Fifth contact: 34 weeks.
6. Sixth contact: 36 weeks.
7. Seventh contact: 38 weeks.
8. Eighth contact: 40 weeks.

These visits ensure both mother and baby remain healthy throughout the pregnancy.`;
  }

  return `Hello! I am your TotoAfya Digital Health Assistant. I am here to help you monitor your maternal and child health. I have full access to your health records and can provide clinical advice based on WHO and Kenya guidelines. 

How can I help you today?

---

Habari! Mimi ni Msaidizi wako wa Afya wa TotoAfya. Niko hapa kukusaidia kufuatilia afya yako na ya mtoto wako. Nina taarifa zako zote na naweza kukupa ushauri wa afya kulingana na miongozo ya WHO na Kenya.

Una swali gani leo?`;
}

const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file_url: reader.result });
        reader.readAsDataURL(file);
      });
    },
    InvokeLLM: async ({ prompt, response_json_schema = null }) => {
      const apiKey = getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY');

      if (apiKey) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          
          const payload = {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          };

          if (response_json_schema) {
            const transformSchema = (schema) => {
              if (!schema || typeof schema !== 'object') return schema;
              const newSchema = { ...schema };
              if (typeof newSchema.type === 'string') {
                newSchema.type = newSchema.type.toUpperCase();
              }
              if (newSchema.properties) {
                const newProps = {};
                for (const [k, v] of Object.entries(newSchema.properties)) {
                  newProps[k] = transformSchema(v);
                }
                newSchema.properties = newProps;
              }
              if (newSchema.items) {
                newSchema.items = transformSchema(newSchema.items);
              }
              return newSchema;
            };

            payload.generationConfig = {
              responseMimeType: "application/json",
              responseSchema: transformSchema(response_json_schema)
            };
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error("No response content from Gemini API.");
          }

          if (response_json_schema) {
            return JSON.parse(text);
          } else {
            return text;
          }
        } catch (error) {
          console.error("Error in InvokeLLM live call:", error);
          return generateMockResponse(prompt, response_json_schema);
        }
      } else {
        return generateMockResponse(prompt, response_json_schema);
      }
    },
  },
};

let featureFlagsCache = {
  'enable-chatbot': true,
  'enable-learning-hub': true,
  'enable-danger-signs-red-alerts': true
};

export const features = {
  isEnabled: (name) => {
    return featureFlagsCache[name] ?? true;
  },
  load: async () => {
    try {
      const raw = localStorage.getItem('db_FeatureFlag');
      const records = raw ? JSON.parse(raw) : [];
      if (records.length === 0) {
        const defaults = [
          { id: '1', name: 'enable-chatbot', description: 'Enables chatbot', is_enabled: true },
          { id: '2', name: 'enable-learning-hub', description: 'Enables learning hub', is_enabled: true },
          { id: '3', name: 'enable-danger-signs-red-alerts', description: 'Enables danger signs red alerts', is_enabled: true }
        ];
        localStorage.setItem('db_FeatureFlag', JSON.stringify(defaults));
        defaults.forEach(flag => {
          featureFlagsCache[flag.name] = flag.is_enabled;
        });
      } else {
        records.forEach(flag => {
          featureFlagsCache[flag.name] = flag.is_enabled;
        });
      }
    } catch (e) {
      console.error("Failed to load mock feature flags", e);
    }
  },
  setCache: (name, val) => {
    featureFlagsCache[name] = val;
  },
  getAll: () => {
    return featureFlagsCache;
  }
};

const localDb = { auth, entities, integrations, features };

export const db = isSupabase ? supabaseDb : localDb;
export const totoafya = db;
export default db;

// Make available globally for files using globalThis.__TOTOAFYA_DB__
globalThis.__TOTOAFYA_DB__ = db;
