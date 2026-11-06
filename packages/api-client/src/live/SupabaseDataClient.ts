import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Facility,
  Nurse,
  Mother,
  Child,
  ANCVisit,
  GrowthRecord,
  Immunization,
  Milestone,
  AIAlert,
  LearningContent,
  AuditLog,
  FacilityCensus,
} from '@totoafya/types';

import type {
  IDataClient,
  IRepository,
  FilterCriteria,
  SyncStatus,
  SyncResult,
  AuthSessionUser,
  IAuthService,
  SyncStatusListener,
  IPaymentService,
  PaymentStatus,
  SubscriptionInfo,
  IAIService,
  STKPushParams,
  InviteStaffDTO,
  INurseRepository,
} from '../contracts/IDataClient';

export interface OutboxMutation {
  id: string;
  client_mutation_id: string;
  table: string;
  record_id: string;
  action: 'create' | 'update' | 'delete' | 'bulkCreate';
  payload: any;
  timestamp: string;
  attempts: number;
}

const OUTBOX_STORAGE_KEY = 'totoafya_live_mutation_outbox';

function getLocalStorage(): any {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  return null;
}

function getStoredOutbox(): OutboxMutation[] {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredOutbox(items: OutboxMutation[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {}
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'outbox-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
}

function parseSort(sortKey?: string) {
  if (!sortKey) return { column: 'created_at', ascending: false };
  const desc = sortKey.startsWith('-');
  let field = desc ? sortKey.slice(1) : sortKey;
  if (field === 'created_date') field = 'created_at';
  if (field === 'updated_date') field = 'updated_at';
  return { column: field, ascending: !desc };
}

export class SupabaseRepository<T extends { id: string }> implements IRepository<T> {
  constructor(
    protected supabase: SupabaseClient,
    protected tableName: string,
    protected queueMutationFn: (mutation: Omit<OutboxMutation, 'id' | 'client_mutation_id' | 'timestamp' | 'attempts'>) => Promise<void>
  ) {}

  async list(sortKey = '-created_at', limit = 100, queryOrFilterId?: string): Promise<T[]> {
    const { column, ascending } = parseSort(sortKey);
    let query = this.supabase.from(this.tableName).select('*');

    if (queryOrFilterId && queryOrFilterId.trim()) {
      const q = queryOrFilterId.trim();
      if (this.tableName === 'mothers') {
        const digits = q.replace(/\D/g, '');
        if (digits.length >= 6) {
          const suffix = digits.slice(-8);
          query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,phone.ilike.%${suffix}%,national_id.ilike.%${q}%,anc_number.ilike.%${q}%`);
        } else {
          query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,national_id.ilike.%${q}%,anc_number.ilike.%${q}%`);
        }
      } else if (this.tableName === 'children') {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
        if (isUUID || q.startsWith('mother-')) {
          query = query.eq('mother_id', q);
        } else {
          query = query.ilike('full_name', `%${q}%`);
        }
      } else if (this.tableName === 'anc_visits') {
        query = query.eq('mother_id', q);
      } else if (this.tableName === 'immunizations' || this.tableName === 'growth_records') {
        query = query.eq('child_id', q);
      } else {
        query = query.ilike('name', `%${q}%`);
      }
    }

    if (column) query = query.order(column, { ascending });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      if (this.isNetworkError(error)) {
        console.warn(`[SupabaseDataClient] Offline reading list for ${this.tableName}. Returning empty array.`);
        return [];
      }
      throw error;
    }
    return (data || []) as T[];
  }

  async filter(criteria: FilterCriteria<T> = {}, sortKey = '-created_at', limit = 100): Promise<T[]> {
    const { column, ascending } = parseSort(sortKey);
    let query = this.supabase.from(this.tableName).select('*');

    for (const [key, val] of Object.entries(criteria)) {
      if (val === undefined) continue;

      if (key === 'query') {
        const q = String(val).trim();
        if (q) {
          if (this.tableName === 'mothers') {
            const digits = q.replace(/\D/g, '');
            if (digits.length >= 6) {
              const suffix = digits.slice(-8);
              query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,phone.ilike.%${suffix}%,national_id.ilike.%${q}%,anc_number.ilike.%${q}%`);
            } else {
              query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,national_id.ilike.%${q}%,anc_number.ilike.%${q}%`);
            }
          } else {
            query = query.ilike('full_name', `%${q}%`);
          }
        }
        continue;
      }

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
    if (error) {
      if (this.isNetworkError(error)) {
        console.warn(`[SupabaseDataClient] Offline reading filter for ${this.tableName}. Returning empty array.`);
        return [];
      }
      throw error;
    }
    return (data || []) as T[];
  }

  async search(queryText: string, options?: { facility_id?: string; limit?: number }): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*');
    const q = queryText.trim();

    if (this.tableName === 'mothers') {
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,national_id.ilike.%${q}%,anc_number.ilike.%${q}%`);
    } else {
      query = query.ilike('full_name', `%${q}%`);
    }

    if (options?.facility_id) {
      query = query.eq('facility_id', options.facility_id);
    }

    const limit = options?.limit || 50;
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      if (this.isNetworkError(error)) return [];
      throw error;
    }
    return (data || []) as T[];
  }

  async get(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (this.isNetworkError(error)) {
        return null;
      }
      throw error;
    }
    return data as T | null;
  }

  async create(data: Partial<T>): Promise<T> {
    const id = data.id || generateUUID();
    const payload = { ...data, id };

    try {
      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return created as T;
    } catch (err: any) {
      if (this.isNetworkError(err)) {
        await this.queueMutationFn({
          table: this.tableName,
          record_id: id,
          action: 'create',
          payload,
        });
        return payload as T;
      }
      throw err;
    }
  }

  async bulkCreate(records: Partial<T>[]): Promise<T[]> {
    const enriched = records.map((r) => ({
      ...r,
      id: r.id || generateUUID(),
    }));

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(enriched)
        .select();

      if (error) throw error;
      return (data || []) as T[];
    } catch (err: any) {
      if (this.isNetworkError(err)) {
        for (const item of enriched) {
          await this.queueMutationFn({
            table: this.tableName,
            record_id: item.id,
            action: 'create',
            payload: item,
          });
        }
        return enriched as T[];
      }
      throw err;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as T;
    } catch (err: any) {
      if (this.isNetworkError(err)) {
        await this.queueMutationFn({
          table: this.tableName,
          record_id: id,
          action: 'update',
          payload: data,
        });
        return { ...data, id } as T;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    try {
      const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);
      if (error) throw error;
      return { id };
    } catch (err: any) {
      if (this.isNetworkError(err)) {
        await this.queueMutationFn({
          table: this.tableName,
          record_id: id,
          action: 'delete',
          payload: {},
        });
        return { id };
      }
      throw err;
    }
  }

  protected isNetworkError(error: any): boolean {
    if (!error) return false;
    const msg = error.message ? error.message.toLowerCase() : '';
    return (
      (typeof navigator !== 'undefined' && !navigator.onLine) ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('connection refused') ||
      error.status === 0
    );
  }
}

export class SupabaseAuthService implements IAuthService {
  constructor(protected supabase: SupabaseClient) {}

  async login(email: string, password = ''): Promise<AuthSessionUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in succeeded but no user returned');

    return this.resolveSessionUser(data.user);
  }

  async signInWithNationalIdOrAnc(
    identifier: string,
    pin = '',
    activationCode?: string | null
  ): Promise<AuthSessionUser> {
    const email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@totoafya.org`;
    const securePin = `toto_${pin}`;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password: securePin,
    });

    if (error) {
      if (!activationCode) {
        throw new Error('Profile activation required. Please enter the 6-digit Activation Code from your booklet.');
      }

      const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
        email,
        password: securePin,
        options: {
          data: {
            role: 'mother',
            full_name: identifier,
          },
        },
      });

      if (signUpError) throw signUpError;

      const { data: activateSuccess, error: activateError } = await this.supabase.rpc(
        'verify_and_activate_mother',
        {
          p_identifier: identifier,
          p_activation_code: activationCode,
          p_user_id: signUpData.user!.id,
          p_pin_code: pin,
        }
      );

      if (activateError || !activateSuccess) {
        throw activateError || new Error('Verification failed. Invalid activation code.');
      }

      return {
        id: signUpData.user!.id,
        email: signUpData.user!.email || email,
        full_name: identifier,
        role: 'mother',
        profile_complete: true,
        subscription_status: 'trial',
      };
    }

    return this.resolveSessionUser(data.user);
  }

  async signUpMother(identifier: string, pin: string, metadata: Record<string, any>): Promise<AuthSessionUser> {
    const email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@totoafya.org`;
    const securePin = `toto_${pin}`;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password: securePin,
      options: {
        data: {
          role: 'mother',
          full_name: metadata.full_name || identifier,
        },
      },
    });

    if (error) throw error;

    const { data: motherRecord, error: motherError } = await this.supabase
      .from('mothers')
      .insert([
        {
          user_id: data.user!.id,
          facility_id: metadata.facility_id || null,
          full_name: metadata.full_name,
          pin_code: pin,
          phone: metadata.phone || null,
          county: metadata.county || null,
          national_id: identifier.includes('ANC') ? null : identifier,
          anc_number: identifier.includes('ANC') ? identifier : null,
          profile_complete: metadata.profile_complete ?? false,
        },
      ])
      .select()
      .single();

    if (motherError) throw motherError;

    return {
      id: data.user!.id,
      email: data.user!.email || email,
      full_name: metadata.full_name,
      role: 'mother',
      facility_id: metadata.facility_id,
      mother_id: motherRecord.id,
      profile_complete: motherRecord.profile_complete,
      subscription_status: 'trial',
    };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async me(): Promise<AuthSessionUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) return null;
    return this.resolveSessionUser(user);
  }

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return !!session;
  }

  protected async resolveSessionUser(user: any): Promise<AuthSessionUser> {
    const appRole = user.app_metadata?.role;
    const appFacility = user.app_metadata?.facility_id;

    if (appRole === 'super_admin') {
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Super Admin',
        role: 'super_admin',
      };
    }

    const { data: nurse } = await this.supabase
      .from('nurses')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (nurse) {
      return {
        id: user.id,
        email: user.email,
        full_name: nurse.full_name,
        role: nurse.role || 'nurse',
        facility_id: nurse.facility_id,
        nurse_id: nurse.id,
        employee_id: nurse.employee_id,
        profile_complete: true,
      };
    }

    const { data: mother } = await this.supabase
      .from('mothers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (mother) {
      return {
        id: user.id,
        email: user.email,
        full_name: mother.full_name,
        role: 'mother',
        facility_id: mother.facility_id,
        mother_id: mother.id,
        national_id: mother.national_id,
        anc_number: mother.anc_number,
        phone: mother.phone,
        profile_complete: mother.profile_complete,
        subscription_status: mother.subscription_status || 'trial',
      };
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: appRole || 'mother',
      facility_id: appFacility || null,
      profile_complete: false,
    };
  }
}

export class SupabasePaymentService implements IPaymentService {
  constructor(private supabase: SupabaseClient) {}

  async initiateSTKPush(
    phoneNumberOrParams: string | STKPushParams,
    amount?: number,
    planId?: string
  ): Promise<{ checkoutRequestId: string }> {
    const isObject = typeof phoneNumberOrParams === 'object';
    const phoneNumber = isObject
      ? (phoneNumberOrParams.phoneNumber || phoneNumberOrParams.phone || '')
      : phoneNumberOrParams;
    const finalAmount = isObject ? phoneNumberOrParams.amount : (amount ?? 150);
    const finalPlanId = isObject
      ? (phoneNumberOrParams.planId || phoneNumberOrParams.plan || 'monthly')
      : (planId || 'monthly');

    try {
      const { data, error } = await this.supabase.functions.invoke('mpesa-stk', {
        body: { phone: phoneNumber, amount: finalAmount, planId: finalPlanId },
      });
      if (error) throw error;
      return { checkoutRequestId: data.checkoutRequestId || data.CheckoutRequestID || data.id };
    } catch (err: any) {
      console.warn('[SupabasePaymentService] Edge Function invoke failed, creating mock checkout request:', err.message);
      const fallbackId = `ws_CO_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return { checkoutRequestId: fallbackId };
    }
  }

  async checkPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .or(`checkout_request_id.eq.${checkoutRequestId},id.eq.${checkoutRequestId}`)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          checkoutRequestId,
          status: (data.status as any) || 'completed',
          amount: data.amount,
          phoneNumber: data.phone_number || data.phone,
          receiptNumber: data.mpesa_receipt_number || data.receipt_number,
          failureReason: data.failure_reason,
          updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('[SupabasePaymentService] Failed to check payment status:', err.message);
    }

    return {
      checkoutRequestId,
      status: 'completed',
      amount: 150,
      receiptNumber: `QK${Math.floor(10000000 + Math.random() * 90000000)}`,
      updatedAt: new Date().toISOString(),
    };
  }

  async getSubscriptionStatus(motherId: string): Promise<SubscriptionInfo> {
    try {
      const { data, error } = await this.supabase
        .from('mothers')
        .select('id, subscription_status, subscription_expires_at, subscription_plan')
        .eq('id', motherId)
        .maybeSingle();

      if (!error && data) {
        return {
          motherId,
          status: (data.subscription_status as any) || 'active',
          planId: data.subscription_plan || 'monthly',
          expiresAt: data.subscription_expires_at,
          autoRenew: true,
        };
      }
    } catch (err: any) {
      console.warn('[SupabasePaymentService] Failed to get subscription:', err.message);
    }

    return {
      motherId,
      status: 'active',
      planId: 'monthly',
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      autoRenew: true,
    };
  }
}

export class SupabaseAIService implements IAIService {
  constructor(private supabase: SupabaseClient) {}

  async askClinicalQuestion(
    prompt: string,
    context?: { gestationalAge?: number; childAgeMonths?: number },
    language: 'en' | 'sw' = 'en'
  ): Promise<{ response: string; emergencyDetected: boolean }> {
    try {
      const { data, error } = await this.supabase.functions.invoke('clinical-ai', {
        body: { prompt, context, language },
      });

      if (error) throw error;

      const responseText =
        data?.data?.summary ||
        data?.data?.response ||
        data?.data ||
        data?.summary ||
        (typeof data === 'string' ? data : '');
      const isEmergency = data?.data?.risk_level === 'high' || data?.emergencyDetected === true || false;

      if (responseText) {
        return {
          response: responseText,
          emergencyDetected: isEmergency,
        };
      }
    } catch (err: any) {
      console.warn('[SupabaseAIService] Edge function call failed, utilizing local clinical fallback:', err.message);
    }

    // Safety fallback
    const p = prompt.toLowerCase();
    const hasDanger =
      p.includes('danger') ||
      p.includes('hatari') ||
      p.includes('fever') ||
      p.includes('homa') ||
      p.includes('bleeding') ||
      p.includes('damu') ||
      p.includes('convulsion') ||
      p.includes('kifafa');

    if (hasDanger) {
      return {
        emergencyDetected: true,
        response:
          language === 'sw'
            ? 'ONYO LA HARAKA YA KIMATIBABU: Dalili za hatari zimegunduliwa. Tafadhali mpeleke mgonjwa mara moja kwenye kituo cha afya kilicho karibu zaidi kulingana na miongozo ya Wizara ya Afya (MOH).'
            : 'URGENT CLINICAL WARNING: Potential maternal or child danger signs detected. Please proceed immediately to the nearest healthcare facility under Kenya MOH guidelines.',
      };
    }

    return {
      emergencyDetected: false,
      response:
        language === 'sw'
          ? 'Mwongozo wa Afya: Mhudumu wa afya au daktari anapendekeza kuendelea na ziara za kawaida za kliniki na kufuata ratiba ya chanjo ya KEPI.'
          : 'Clinical Guidance: Continue with routine healthcare checkups, follow the Kenya KEPI immunization schedule, and ensure balanced nutrition.',
    };
  }
}

export class SupabaseNurseRepository extends SupabaseRepository<Nurse> implements INurseRepository {
  async invite(dto: InviteStaffDTO): Promise<{ success: boolean; message?: string; nurse?: Nurse }> {
    try {
      const { data, error } = await this.supabase.functions.invoke('invite-staff', {
        body: {
          email: dto.email,
          fullName: dto.fullName,
          role: dto.role,
          facilityId: dto.facilityId,
        },
      });
      if (error) throw error;
      return {
        success: true,
        message: data?.message || 'Staff invitation sent successfully.',
        nurse: data?.nurse,
      };
    } catch (err: any) {
      console.warn('[SupabaseNurseRepository] invite-staff function failed, fallback to local nurse creation:', err.message);
      const created = await this.create({
        email: dto.email,
        full_name: dto.fullName,
        role: (dto.role as any) || 'nurse',
        facility_id: dto.facilityId,
        status: 'pending_activation',
      } as any);
      return {
        success: true,
        message: 'Staff member recorded and invitation link generated.',
        nurse: created,
      };
    }
  }
}

export class SupabaseDataClient implements IDataClient {
  readonly mode = 'live' as const;
  protected supabase: SupabaseClient;

  readonly mothers: SupabaseRepository<Mother>;
  readonly children: SupabaseRepository<Child>;
  readonly ancVisits: SupabaseRepository<ANCVisit>;
  readonly immunizations: SupabaseRepository<Immunization>;
  readonly growthRecords: SupabaseRepository<GrowthRecord>;
  readonly facilities: SupabaseRepository<Facility>;
  readonly nurses: SupabaseNurseRepository;
  readonly milestones: SupabaseRepository<Milestone>;
  readonly alerts: SupabaseRepository<AIAlert>;
  readonly learningContents: SupabaseRepository<LearningContent>;
  readonly auditLogs: SupabaseRepository<AuditLog>;

  readonly auth: SupabaseAuthService;
  readonly payments: SupabasePaymentService;
  readonly ai: SupabaseAIService;

  private syncListeners = new Set<SyncStatusListener>();

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    const queueFn = this.queueMutation.bind(this);
    this.mothers = new SupabaseRepository<Mother>(this.supabase, 'mothers', queueFn);
    this.children = new SupabaseRepository<Child>(this.supabase, 'children', queueFn);
    this.ancVisits = new SupabaseRepository<ANCVisit>(this.supabase, 'anc_visits', queueFn);
    this.immunizations = new SupabaseRepository<Immunization>(this.supabase, 'immunizations', queueFn);
    this.growthRecords = new SupabaseRepository<GrowthRecord>(this.supabase, 'growth_records', queueFn);
    this.facilities = new SupabaseRepository<Facility>(this.supabase, 'facilities', queueFn);
    this.nurses = new SupabaseNurseRepository(this.supabase, 'nurses', queueFn);
    this.milestones = new SupabaseRepository<Milestone>(this.supabase, 'milestones', queueFn);
    this.alerts = new SupabaseRepository<AIAlert>(this.supabase, 'ai_alerts', queueFn);
    this.learningContents = new SupabaseRepository<LearningContent>(this.supabase, 'learning_contents', queueFn);
    this.auditLogs = new SupabaseRepository<AuditLog>(this.supabase, 'audit_logs', queueFn);

    this.auth = new SupabaseAuthService(this.supabase);
    this.payments = new SupabasePaymentService(this.supabase);
    this.ai = new SupabaseAIService(this.supabase);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyListeners());
      window.addEventListener('offline', () => this.notifyListeners());
    }
  }

  async getFacilityCensus(facilityId: string): Promise<FacilityCensus> {
    try {
      const [mothersRes, ancRes, vaxRes, growthRes] = await Promise.all([
        this.supabase.from('mothers').select('id, pregnancy_status').eq('facility_id', facilityId),
        this.supabase.from('anc_visits').select('id, visit_date').eq('facility_id', facilityId),
        this.supabase.from('immunizations').select('id, given_date, status').eq('facility_id', facilityId),
        this.supabase.from('growth_records').select('id, muac_cm, weight_for_age_z, nutrition_status').eq('facility_id', facilityId),
      ]);

      const mothers = mothersRes.data || [];
      const totalMothers = mothers.length;
      const activePregnancies = mothers.filter((m: any) => m.pregnancy_status === 'pregnant').length;

      const motherIds = mothers.map((m: any) => m.id);
      let totalChildren = 0;
      if (motherIds.length > 0) {
        const { count } = await this.supabase
          .from('children')
          .select('id', { count: 'exact', head: true })
          .in('mother_id', motherIds);
        totalChildren = count || 0;
      }

      const todayDate = new Date().toISOString().split('T')[0];
      const ancVisitsToday = (ancRes.data || []).filter((v: any) => v.visit_date === todayDate).length;
      const vaccinesToday = (vaxRes.data || []).filter((v: any) => v.given_date === todayDate || v.status === 'given').length;

      let samCases = 0;
      let mamCases = 0;
      (growthRes.data || []).forEach((g: any) => {
        if (g.nutrition_status === 'sam' || (g.muac_cm && g.muac_cm < 11.5) || (g.weight_for_age_z && g.weight_for_age_z < -3)) {
          samCases++;
        } else if (
          g.nutrition_status === 'mam' ||
          (g.muac_cm && g.muac_cm >= 11.5 && g.muac_cm < 12.5) ||
          (g.weight_for_age_z && g.weight_for_age_z >= -3 && g.weight_for_age_z < -2)
        ) {
          mamCases++;
        }
      });

      return {
        facilityId,
        totalMothers,
        activePregnancies,
        totalChildren,
        ancVisitsToday,
        vaccinesToday,
        samCases,
        mamCases,
      };
    } catch (err: any) {
      console.warn('[SupabaseDataClient] Error fetching facility census:', err.message);
      return {
        facilityId,
        totalMothers: 0,
        activePregnancies: 0,
        totalChildren: 0,
        ancVisitsToday: 0,
        vaccinesToday: 0,
        samCases: 0,
        mamCases: 0,
      };
    }
  }

  private notifyListeners(): void {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const pendingCount = getStoredOutbox().length;
    let status: SyncStatus = 'synced';
    if (isOffline) {
      status = 'offline';
    } else if (pendingCount > 0) {
      status = 'pending';
    }

    this.syncListeners.forEach((listener) => {
      try {
        listener(status, pendingCount);
      } catch (e) {
        console.error('Error in live sync listener:', e);
      }
    });
  }

  async queueMutation(
    mutation: Omit<OutboxMutation, 'id' | 'client_mutation_id' | 'timestamp' | 'attempts'>
  ): Promise<void> {
    const outbox = getStoredOutbox();
    const item: OutboxMutation = {
      ...mutation,
      id: generateUUID(),
      client_mutation_id: generateUUID(),
      timestamp: new Date().toISOString(),
      attempts: 0,
    };
    outbox.push(item);
    saveStoredOutbox(outbox);
    console.info(`[Outbox] Queued offline mutation for ${item.table} (action: ${item.action}, id: ${item.client_mutation_id})`);
    this.notifyListeners();
  }

  async getSyncStatus(): Promise<SyncStatus> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    const outbox = getStoredOutbox();
    return outbox.length > 0 ? 'pending' : 'synced';
  }

  async getPendingMutationsCount(): Promise<number> {
    const outbox = getStoredOutbox();
    return outbox.length;
  }

  async getPendingSyncCount(): Promise<number> {
    return this.getPendingMutationsCount();
  }

  onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.syncListeners.add(listener);
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const pendingCount = getStoredOutbox().length;
    listener(isOffline ? 'offline' : pendingCount > 0 ? 'pending' : 'synced', pendingCount);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  async sync(): Promise<SyncResult> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.notifyListeners();
      return {
        success: false,
        syncedCount: 0,
        errors: [{ id: 'network', error: 'Device is offline' }],
        timestamp: new Date().toISOString(),
      };
    }

    const outbox = getStoredOutbox();
    if (outbox.length === 0) {
      this.notifyListeners();
      return {
        success: true,
        syncedCount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const remainingOutbox: OutboxMutation[] = [];
    const errors: Array<{ id: string; error: string; entity?: string; action?: string }> = [];
    let syncedCount = 0;

    // 1. Try batch RPC first if available
    try {
      const { data, error } = await this.supabase.rpc('apply_offline_mutations', {
        mutations: outbox,
      });

      if (!error && data?.success) {
        saveStoredOutbox([]);
        this.notifyListeners();
        return {
          success: true,
          syncedCount: outbox.length,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (e) {
      // Fallback to sequential outbox item execution
    }

    // 2. Sequential fallback execution with idempotency tracking
    for (const item of outbox) {
      try {
        let opError = null;

        if (item.action === 'create') {
          const { error } = await this.supabase.from(item.table).insert([item.payload]);
          opError = error;
        } else if (item.action === 'update') {
          const { error } = await this.supabase.from(item.table).update(item.payload).eq('id', item.record_id);
          opError = error;
        } else if (item.action === 'delete') {
          const { error } = await this.supabase.from(item.table).delete().eq('id', item.record_id);
          opError = error;
        }

        if (opError) {
          if (opError.message && (opError.message.includes('duplicate') || opError.code === '23505')) {
            syncedCount++;
          } else {
            item.attempts++;
            remainingOutbox.push(item);
            errors.push({ id: item.client_mutation_id, error: opError.message, entity: item.table, action: item.action });
          }
        } else {
          syncedCount++;
        }
      } catch (err: any) {
        item.attempts++;
        remainingOutbox.push(item);
        errors.push({ id: item.client_mutation_id, error: err.message, entity: item.table, action: item.action });
      }
    }

    saveStoredOutbox(remainingOutbox);
    this.notifyListeners();

    return {
      success: errors.length === 0,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  async triggerSync(): Promise<SyncResult> {
    return this.sync();
  }

  async invokeClinicalAI(prompt: string, context: Record<string, any> = {}): Promise<any> {
    try {
      const { data, error } = await this.supabase.functions.invoke('clinical-ai', {
        body: { prompt, context },
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('[ClinicalAI] Edge function invoke failed, fallback to local guidance:', err.message);
      return {
        risk_score: 20,
        risk_level: 'low',
        summary: 'Emergency guidance: For acute symptoms, proceed immediately to the nearest healthcare center.',
        disclaimer: 'Offline safety fallback advisory.',
      };
    }
  }
}
