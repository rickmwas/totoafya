import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if the URL and Key are provided
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const TABLE_MAP = {
  'Mother': 'mothers',
  'Child': 'children',
  'AIAlert': 'ai_alerts',
  'ANCVisit': 'anc_visits',
  'GrowthRecord': 'growth_records',
  'Milestone': 'milestones',
  'Immunization': 'immunizations',
  'LearningContent': 'learning_contents'
};

function dbToClient(record) {
  if (!record) return null;
  const { created_at, updated_at, ...rest } = record;
  return {
    ...rest,
    created_date: created_at,
    updated_date: updated_at,
  };
}

function clientToDb(record) {
  if (!record) return null;
  const { created_date, updated_date, ...rest } = record;
  const dbRecord = { ...rest };
  if (created_date) dbRecord.created_at = created_date;
  if (updated_date) dbRecord.updated_at = updated_date;
  return dbRecord;
}

function parseSortKey(sortKey) {
  if (!sortKey) return { column: 'created_at', ascending: false };
  const desc = sortKey.startsWith('-');
  let field = desc ? sortKey.slice(1) : sortKey;
  if (field === 'created_date') field = 'created_at';
  if (field === 'updated_date') field = 'updated_at';
  return { column: field, ascending: !desc };
}

export const makeSupabaseStore = (entityName) => {
  const tableName = TABLE_MAP[entityName] || entityName.toLowerCase();
  
  return {
    list: async (sortKey = '-created_date', limit = 100) => {
      if (!supabase) throw new Error('Supabase client not initialized. Check your environment variables.');
      const { column, ascending } = parseSortKey(sortKey);
      
      let query = supabase.from(tableName).select('*');
      if (column) query = query.order(column, { ascending });
      if (limit) query = query.limit(limit);
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(dbToClient);
    },
    
    filter: async (conditions = {}, sortKey = '-created_date', limit = 100) => {
      if (!supabase) throw new Error('Supabase client not initialized. Check your environment variables.');
      const { column, ascending } = parseSortKey(sortKey);
      
      let query = supabase.from(tableName).select('*');
      
      // Apply filters
      for (const [key, val] of Object.entries(conditions)) {
        if (val === null) {
          query = query.is(key, null);
        } else if (Array.isArray(val)) {
          query = query.in(key, val);
        } else {
          query = query.eq(key, val);
        }
      }
      
      if (column) query = query.order(column, { ascending });
      if (limit) query = query.limit(limit);
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(dbToClient);
    },
    
    get: async (id) => {
      if (!supabase) throw new Error('Supabase client not initialized. Check your environment variables.');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return dbToClient(data);
    },
    
    create: async (data) => {
      if (!supabase) throw new Error('Supabase client not initialized. Check your environment variables.');
      const dbData = clientToDb(data);
      
      const { data: record, error } = await supabase
        .from(tableName)
        .insert([dbData])
        .select()
        .single();
        
      if (error) throw error;
      return dbToClient(record);
    },
    
    update: async (id, data) => {
      if (!supabase) throw new Error('Supabase client not initialized. Check your environment variables.');
      const dbData = clientToDb(data);
      
      const { data: record, error } = await supabase
        .from(tableName)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return dbToClient(record);
    },
    
    delete: async (id) => {
      if (!supabase) throw new Error('Supabase client not initialized. Check your environment variables.');
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { id };
    }
  };
};

const ENTITY_NAMES = [
  'Mother', 'Child', 'AIAlert', 'ANCVisit',
  'GrowthRecord', 'Milestone', 'Immunization', 'LearningContent'
];

const entities = Object.fromEntries(
  ENTITY_NAMES.map(name => [name, makeSupabaseStore(name)])
);

const LOCAL_USER = {
  id: 'local-user-1',
  email: 'user@local.app',
  full_name: 'Local User',
  role: 'user',
};

const auth = {
  me: async () => {
    if (!supabase) return LOCAL_USER;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return LOCAL_USER;

      // Fetch mother profile to get facility_id, mother_id, and profile_complete
      const { data: mother, error: mError } = await supabase
        .from('mothers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        role: user.user_metadata?.role || 'user',
        facility_id: mother?.facility_id || null,
        mother_id: mother?.id || null,
        profile_complete: mother?.profile_complete ?? false,
        subscription_status: mother?.subscription_status || 'trial',
        trial_end_date: mother?.trial_end_date || null,
      };
    } catch {
      return LOCAL_USER;
    }
  },
  isAuthenticated: async () => {
    if (!supabase) return true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return true;
    }
  },
  logout: async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.clear();
    window.location.href = '/';
  },
  redirectToLogin: () => {
    window.location.href = '/login';
  },
  signInWithNationalIdOrAnc: async (identifier, pin) => {
    if (!supabase) throw new Error('Supabase client not initialized.');
    const email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@totoafya.org`;
    
    try {
      // 1. Try to sign in first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });

      if (error) {
        // 2. If sign in fails, let's try to register them on the fly
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: pin,
          options: {
            data: {
              role: 'user',
              full_name: identifier,
            }
          }
        });

        if (signUpError) {
          // If sign up fails too, throw the original sign in error
          throw error;
        }

        // SignUp succeeded. Create or link mother profile record
        let motherId = null;
        let profileComplete = false;
        let facilityId = null;
        let subscriptionStatus = 'trial';
        
        try {
          const { data: motherData, error: motherError } = await supabase
            .from('mothers')
            .insert([{
              user_id: signUpData.user.id,
              full_name: identifier,
              pin_code: pin,
              national_id: identifier.includes('ANC') ? null : identifier,
              anc_number: identifier.includes('ANC') ? identifier : null,
              profile_complete: false,
            }])
            .select()
            .single();

          if (!motherError && motherData) {
            motherId = motherData.id;
            profileComplete = motherData.profile_complete;
            facilityId = motherData.facility_id;
            subscriptionStatus = motherData.subscription_status || 'trial';
          }
        } catch (dbErr) {
          console.error("Database insert failed during on-the-fly registration:", dbErr);
          // Try to link existing pre-registered record
          try {
            const { data: existingMother } = await supabase
              .from('mothers')
              .select('*')
              .or(`national_id.eq.${identifier},anc_number.eq.${identifier}`)
              .maybeSingle();
              
            if (existingMother) {
              const { data: updatedMother } = await supabase
                .from('mothers')
                .update({ user_id: signUpData.user.id })
                .eq('id', existingMother.id)
                .select()
                .single();
                
              if (updatedMother) {
                motherId = updatedMother.id;
                profileComplete = updatedMother.profile_complete;
                facilityId = updatedMother.facility_id;
                subscriptionStatus = updatedMother.subscription_status || 'trial';
              }
            }
          } catch (linkErr) {
            console.error("Failed to link existing mother record:", linkErr);
          }
        }

        return {
          id: signUpData.user.id,
          email: signUpData.user.email,
          full_name: identifier,
          role: 'user',
          facility_id: facilityId,
          mother_id: motherId,
          profile_complete: profileComplete,
          subscription_status: subscriptionStatus,
          trial_end_date: null,
        };
      }

      // Sign in succeeded. Fetch mother profile to get info
      const { data: mother, error: mError } = await supabase
        .from('mothers')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      return {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email,
        role: 'user',
        facility_id: mother?.facility_id || null,
        mother_id: mother?.id || null,
        profile_complete: mother?.profile_complete ?? false,
        subscription_status: mother?.subscription_status || 'trial',
        trial_end_date: mother?.trial_end_date || null,
      };
    } catch (err) {
      throw err;
    }
  },
  signUpMother: async (identifier, pin, metadata) => {
    if (!supabase) throw new Error('Supabase client not initialized.');
    const email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@totoafya.org`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pin,
      options: {
        data: {
          role: 'user',
          full_name: metadata.full_name,
        }
      }
    });
    if (authError) throw authError;

    // Insert mother profile into 'mothers' table
    const { data: motherData, error: motherError } = await supabase
      .from('mothers')
      .insert([{
        user_id: authData.user.id,
        facility_id: metadata.facility_id || null,
        full_name: metadata.full_name,
        pin_code: pin,
        phone: metadata.phone || null,
        county: metadata.county || null,
        national_id: identifier.includes('ANC') ? null : identifier,
        anc_number: identifier.includes('ANC') ? identifier : null,
        profile_complete: metadata.profile_complete ?? false,
      }])
      .select()
      .single();

    if (motherError) throw motherError;

    return {
      id: authData.user.id,
      email: authData.user.email,
      full_name: metadata.full_name,
      role: 'user',
      facility_id: metadata.facility_id || null,
      mother_id: motherData.id,
      profile_complete: motherData.profile_complete,
      subscription_status: motherData.subscription_status || 'trial',
      trial_end_date: motherData.trial_end_date || null,
    };
  },
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
      if (!supabase) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file_url: reader.result });
          reader.readAsDataURL(file);
        });
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `files/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
        
      return { file_url: publicUrl };
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

export const supabaseDb = { auth, entities, integrations };
export default supabaseDb;

