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
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        role: user.user_metadata?.role || 'user',
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
    window.location.href = '/onboarding';
  },
};

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
  },
};

export const supabaseDb = { auth, entities, integrations };
export default supabaseDb;
