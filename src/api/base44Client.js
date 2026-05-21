
// Local localStorage-backed database — no base44 dependencies

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
    if (record[key] !== val) return false;
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
  'ChildImmunization',
];

const entities = Object.fromEntries(
  ENTITY_NAMES.map(name => [name, makeEntityStore(name)])
);

// Default local user
const LOCAL_USER = {
  id: 'local-user-1',
  email: 'user@local.app',
  full_name: 'Local User',
  role: 'user',
};

const auth = {
  me: async () => LOCAL_USER,
  isAuthenticated: async () => true,
  logout: () => {
    localStorage.clear();
    window.location.href = '/';
  },
  redirectToLogin: () => {
    window.location.href = '/onboarding';
  },
};

const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file_url: reader.result });
        reader.readAsDataURL(file);
      });
    },
  },
};

export const db = { auth, entities, integrations };
export const base44 = db;
export default db;

// Make available globally for files using globalThis.__B44_DB__
globalThis.__B44_DB__ = db;
