import { supabaseDb } from './supabaseClient';

const isSupabase = import.meta.env.VITE_DATABASE_PROVIDER === 'supabase';

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
  'ChildImmunization', 'Facility', 'Nurse',
];

const entities = Object.fromEntries(
  ENTITY_NAMES.map(name => [name, makeEntityStore(name)])
);

const MOCK_USERS = {
  super_admin: {
    id: 'mock-super-admin',
    email: 'super@totoafya.org',
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
  me: async () => getActiveMockUser(),
  isAuthenticated: async () => true,
  logout: () => {
    localStorage.clear();
    window.location.href = '/';
  },
  redirectToLogin: () => {
    window.location.href = '/onboarding';
  },
  switchMockRole: (role) => {
    if (MOCK_USERS[role]) {
      localStorage.setItem('active_mock_role', role);
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
    InvokeLLM: async ({ prompt, response_json_schema }) => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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

const localDb = { auth, entities, integrations };

export const db = isSupabase ? supabaseDb : localDb;
export const totoafya = db;
export default db;

// Make available globally for files using globalThis.__TOTOAFYA_DB__
globalThis.__TOTOAFYA_DB__ = db;
