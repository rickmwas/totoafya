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
  STKPushParams,
  IAIService,
  InviteStaffDTO,
  INurseRepository,
  ClinicalAIResponse,
  StorageAdapter,
} from '../contracts/IDataClient';

import { InMemoryStorageAdapter } from '../storage/InMemoryStorageAdapter';

import type { FacilityCensus } from '@totoafya/types';

import {
  mockFacilities,
  mockNurses,
  mockMothers,
  mockChildren,
  mockANCVisits,
  mockImmunizations,
  mockGrowthRecords,
  mockMilestones,
  mockAlerts,
  mockLearningContents,
} from './fixtures/clinicalFixtures';

function generateId(): string {
  return 'mock-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

function sortItems<T>(items: T[], sortKey?: string): T[] {
  if (!sortKey) return [...items];
  const isDesc = sortKey.startsWith('-');
  let field = isDesc ? sortKey.slice(1) : sortKey;
  if (field === 'created_date') field = 'created_at';
  if (field === 'updated_date') field = 'updated_at';

  return [...items].sort((a: any, b: any) => {
    const valA = a[field] ?? '';
    const valB = b[field] ?? '';
    if (valA < valB) return isDesc ? 1 : -1;
    if (valA > valB) return isDesc ? -1 : 1;
    return 0;
  });
}

function matchQueryText(item: any, q: string): boolean {
  const query = q.toLowerCase().trim();
  if (!query) return true;

  // Search across common healthcare identifier & name fields
  const fields = [
    item.full_name,
    item.national_id,
    item.anc_number,
    item.phone,
    item.name,
    item.vaccine_name,
    item.batch_number,
    item.clinician_name,
    item.facility,
    item.employee_id,
  ];

  if (fields.some((f) => f && String(f).toLowerCase().includes(query))) {
    return true;
  }

  // Check phone number normalization (e.g., +254 712 345678 vs 0712 345678 vs 712345678)
  const queryDigits = query.replace(/\D/g, '');
  if (queryDigits.length >= 6 && item.phone) {
    const itemPhoneDigits = String(item.phone).replace(/\D/g, '');
    if (
      itemPhoneDigits.includes(queryDigits) ||
      queryDigits.includes(itemPhoneDigits) ||
      (itemPhoneDigits.length >= 8 && queryDigits.length >= 8 && itemPhoneDigits.slice(-8) === queryDigits.slice(-8))
    ) {
      return true;
    }
  }

  return false;
}

function matchesCriteria<T>(item: any, criteria: FilterCriteria<T>): boolean {
  for (const [key, target] of Object.entries(criteria)) {
    if (target === undefined) continue;

    if (key === 'query') {
      if (!matchQueryText(item, String(target))) return false;
      continue;
    }

    const itemVal = item[key];

    if (target === null) {
      if (itemVal !== null && itemVal !== undefined) return false;
    } else if (Array.isArray(target)) {
      if (!target.includes(itemVal)) return false;
    } else {
      if (itemVal !== target) return false;
    }
  }
  return true;
}

export class MockRepository<T extends { id: string; created_at?: string; updated_at?: string }>
  implements IRepository<T>
{
  protected storageKey: string;
  protected inMemoryItems: T[];
  protected useStorage: boolean;
  protected onMutationCallback?: () => void;

  constructor(
    public readonly entityName: string,
    initialFixtures: T[],
    onMutationCallback?: () => void
  ) {
    this.storageKey = `totoafya_mock_${entityName}`;
    this.useStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    this.onMutationCallback = onMutationCallback;
    
    if (this.useStorage) {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.inMemoryItems = JSON.parse(stored);
        } else {
          this.inMemoryItems = [...initialFixtures];
          this.persist();
        }
      } catch (e) {
        this.inMemoryItems = [...initialFixtures];
      }
    } else {
      this.inMemoryItems = [...initialFixtures];
    }
  }

  setMutationCallback(cb: () => void) {
    this.onMutationCallback = cb;
  }

  protected persist(): void {
    if (this.useStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.inMemoryItems));
      } catch (e) {}
    }
  }

  async list(sortKey = '-created_at', limit = 100, queryOrFilterId?: string): Promise<T[]> {
    let items = this.inMemoryItems;

    if (queryOrFilterId && queryOrFilterId.trim()) {
      const q = queryOrFilterId.trim();
      if (this.entityName === 'Mother') {
        items = items.filter((m) => matchQueryText(m, q));
      } else if (this.entityName === 'Child') {
        items = items.filter((c: any) => c.mother_id === q || matchQueryText(c, q));
      } else if (this.entityName === 'ANCVisit') {
        items = items.filter((a: any) => a.mother_id === q || matchQueryText(a, q));
      } else if (this.entityName === 'Immunization' || this.entityName === 'GrowthRecord') {
        items = items.filter((r: any) => r.child_id === q || matchQueryText(r, q));
      } else {
        items = items.filter((item) => matchQueryText(item, q));
      }
    }

    const sorted = sortItems(items, sortKey);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async filter(criteria: FilterCriteria<T> = {}, sortKey = '-created_at', limit = 100): Promise<T[]> {
    const filtered = this.inMemoryItems.filter((item) => matchesCriteria(item, criteria));
    const sorted = sortItems(filtered, sortKey);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async search(query: string, options?: { facility_id?: string; limit?: number }): Promise<T[]> {
    let items = this.inMemoryItems.filter((item) => matchQueryText(item, query));
    if (options?.facility_id) {
      items = items.filter((item: any) => item.facility_id === options.facility_id);
    }
    const limit = options?.limit || 50;
    return items.slice(0, limit);
  }

  async get(id: string): Promise<T | null> {
    const found = this.inMemoryItems.find((item) => item.id === id);
    return found ? { ...found } : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const newRecord = {
      ...data,
      id: data.id || generateId(),
      created_at: (data as any).created_at || now,
      updated_at: now,
    } as T;

    this.inMemoryItems.push(newRecord);
    this.persist();
    if (this.onMutationCallback) this.onMutationCallback();
    return { ...newRecord };
  }

  async bulkCreate(records: Partial<T>[]): Promise<T[]> {
    const created: T[] = [];
    const now = new Date().toISOString();

    for (const data of records) {
      const record = {
        ...data,
        id: data.id || generateId(),
        created_at: (data as any).created_at || now,
        updated_at: now,
      } as T;
      this.inMemoryItems.push(record);
      created.push(record);
    }

    this.persist();
    if (this.onMutationCallback) this.onMutationCallback();
    return created;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const index = this.inMemoryItems.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Entity with ID ${id} not found in ${this.storageKey}`);
    }

    const updated = {
      ...this.inMemoryItems[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.inMemoryItems[index] = updated;
    this.persist();
    if (this.onMutationCallback) this.onMutationCallback();
    return { ...updated };
  }

  async delete(id: string): Promise<{ id: string }> {
    this.inMemoryItems = this.inMemoryItems.filter((item) => item.id !== id);
    this.persist();
    if (this.onMutationCallback) this.onMutationCallback();
    return { id };
  }

  reset(fixtures: T[]): void {
    this.inMemoryItems = [...fixtures];
    this.persist();
  }
}

export class MockAuthService implements IAuthService {
  private currentUser: AuthSessionUser | null = null;
  private usersStorageKey = 'totoafya_mock_current_user';

  constructor() {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.usersStorageKey);
        if (saved) {
          this.currentUser = JSON.parse(saved);
        }
      } catch (e) {
        this.currentUser = null;
      }
    }

    // Default to Nurse Joy for clinical portal dev if not set
    if (!this.currentUser) {
      this.currentUser = {
        id: 'user-auth-nurse-joy',
        email: 'joy.wambui@pumwani.health.go.ke',
        full_name: 'Nurse Joy Wambui',
        role: 'nurse',
        facility_id: 'fac-pumwani-01',
        nurse_id: 'nurse-joy-01',
        employee_id: 'PMH-NR-8821',
        profile_complete: true,
      };
    }
  }

  private persistUser(user: AuthSessionUser | null): void {
    this.currentUser = user;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem(this.usersStorageKey, JSON.stringify(user));
        } else {
          localStorage.removeItem(this.usersStorageKey);
        }
      } catch (e) {}
    }
  }

  async login(email: string): Promise<AuthSessionUser> {
    const cleanEmail = email.toLowerCase().trim();

    // Check staff
    const staff = mockNurses.find((n) => n.email.toLowerCase() === cleanEmail);
    if (staff) {
      const user: AuthSessionUser = {
        id: staff.user_id || 'auth-' + staff.id,
        email: staff.email,
        full_name: staff.full_name,
        role: staff.role || 'nurse',
        facility_id: staff.facility_id,
        nurse_id: staff.id,
        employee_id: staff.employee_id,
        profile_complete: true,
      };
      this.persistUser(user);
      return user;
    }

    // Check mothers
    const mother = mockMothers.find(
      (m) => m.national_id === cleanEmail || m.anc_number === cleanEmail || m.phone === cleanEmail
    );
    if (mother) {
      const user: AuthSessionUser = {
        id: mother.user_id || 'auth-' + mother.id,
        email: `${mother.national_id || mother.anc_number}@local.app`,
        full_name: mother.full_name,
        role: 'mother',
        facility_id: mother.facility_id,
        mother_id: mother.id,
        national_id: mother.national_id,
        anc_number: mother.anc_number,
        phone: mother.phone,
        profile_complete: mother.profile_complete,
        subscription_status: 'sponsored',
      };
      this.persistUser(user);
      return user;
    }

    // Fallback demo user
    const fallbackUser: AuthSessionUser = {
      id: 'mock-user-' + cleanEmail.split('@')[0],
      email: cleanEmail,
      full_name: cleanEmail.includes('admin') ? 'Super Admin' : 'Caregiver User',
      role: cleanEmail.includes('admin') ? 'super_admin' : 'mother',
      facility_id: 'fac-pumwani-01',
      profile_complete: true,
    };
    this.persistUser(fallbackUser);
    return fallbackUser;
  }

  async signInWithNationalIdOrAnc(identifier: string): Promise<AuthSessionUser> {
    const cleanId = identifier.trim();
    const mother = mockMothers.find(
      (m) => m.national_id === cleanId || m.anc_number === cleanId || m.phone === cleanId
    ) || mockMothers[0];

    const user: AuthSessionUser = {
      id: mother.user_id || 'auth-' + mother.id,
      email: `${cleanId}@local.app`,
      full_name: mother.full_name,
      role: 'mother',
      facility_id: mother.facility_id,
      mother_id: mother.id,
      national_id: mother.national_id,
      anc_number: mother.anc_number,
      phone: mother.phone,
      profile_complete: true,
      subscription_status: 'sponsored',
    };
    this.persistUser(user);
    return user;
  }

  async signUpMother(identifier: string, _pin: string, metadata: Record<string, unknown>): Promise<AuthSessionUser> {
    const newMotherId = 'mother-' + generateId();
    const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : 'Caregiver';
    const facilityId = typeof metadata.facility_id === 'string' ? metadata.facility_id : 'fac-pumwani-01';
    const phone = typeof metadata.phone === 'string' ? metadata.phone : null;
    const profileComplete = typeof metadata.profile_complete === 'boolean' ? metadata.profile_complete : true;
    const user: AuthSessionUser = {
      id: 'auth-' + newMotherId,
      email: `${identifier}@local.app`,
      full_name: fullName,
      role: 'mother',
      facility_id: facilityId,
      mother_id: newMotherId,
      national_id: identifier.includes('ANC') ? null : identifier,
      anc_number: identifier.includes('ANC') ? identifier : null,
      phone,
      profile_complete: profileComplete,
      subscription_status: 'trial',
      trial_end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
    this.persistUser(user);
    return user;
  }

  async logout(): Promise<void> {
    this.persistUser(null);
  }

  async me(): Promise<AuthSessionUser | null> {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  switchMockRole(role: string): void {
    if (role === 'nurse') {
      this.login('joy.wambui@pumwani.health.go.ke');
    } else if (role === 'admin' || role === 'facility_admin') {
      this.login('evans.ochieng@knh.or.ke');
    } else if (role === 'super_admin') {
      this.login('superadmin@totoafya.co.ke');
    } else {
      this.signInWithNationalIdOrAnc('28475920');
    }
  }
}

export class MockPaymentService implements IPaymentService {
  private payments = new Map<string, PaymentStatus>();

  async initiateSTKPush(
    phoneNumberOrParams: string | STKPushParams,
    amount?: number,
    planId?: string
  ): Promise<{ checkoutRequestId: string }> {
    const isObject = typeof phoneNumberOrParams === 'object';
    const phoneNumber = isObject
      ? (phoneNumberOrParams.phoneNumber || phoneNumberOrParams.phone || '0712345678')
      : phoneNumberOrParams;
    const finalAmount = isObject ? phoneNumberOrParams.amount : (amount ?? 150);
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const receiptNumber = `QK${Math.floor(10000000 + Math.random() * 90000000)}`;

    const payment: PaymentStatus = {
      checkoutRequestId,
      status: 'completed',
      amount: finalAmount,
      phoneNumber,
      receiptNumber,
      updatedAt: new Date().toISOString(),
    };

    this.payments.set(checkoutRequestId, payment);

    return { checkoutRequestId };
  }

  async checkPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus> {
    const existing = this.payments.get(checkoutRequestId);
    if (existing) return existing;

    return {
      checkoutRequestId,
      status: 'completed',
      amount: 150,
      phoneNumber: '254712345678',
      receiptNumber: `QK${Math.floor(10000000 + Math.random() * 90000000)}`,
      updatedAt: new Date().toISOString(),
    };
  }

  async getSubscriptionStatus(motherId: string): Promise<SubscriptionInfo> {
    const mother = mockMothers.find((m) => m.id === motherId || (m as any).user_id === motherId);
    return {
      motherId,
      status: (mother?.subscription_status as any) || 'active',
      planId: (mother as any)?.subscription_plan || 'monthly',
      expiresAt: mother?.subscription_expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
      autoRenew: true,
    };
  }
}

export class MockAIService implements IAIService {
  async askClinicalQuestion(
    prompt: string,
    context?: { gestationalAge?: number; childAgeMonths?: number },
    language: 'en' | 'sw' = 'en'
  ): Promise<{ response: string; emergencyDetected: boolean }> {
    const p = prompt.toLowerCase();
    const hasDanger =
      p.includes('danger') ||
      p.includes('hatari') ||
      p.includes('fever') ||
      p.includes('homa') ||
      p.includes('bleeding') ||
      p.includes('damu') ||
      p.includes('convulsion') ||
      p.includes('kifafa') ||
      p.includes('headache') ||
      p.includes('kichwa') ||
      p.includes('swelling') ||
      p.includes('kuvimba');

    if (hasDanger) {
      return {
        emergencyDetected: true,
        response:
          language === 'sw'
            ? 'ONYO LA HARAKA YA KIMATIBABU: Dalili za hatari zimegunduliwa. Tafadhali mpeleke mgonjwa mara moja kwenye kituo cha afya kilicho karibu zaidi au hospitali ya rufaa kulingana na miongozo ya dharura ya Wizara ya Afya (MOH).'
            : 'URGENT CLINICAL WARNING: Potential maternal or child danger signs detected. Please proceed immediately to the nearest healthcare facility under Kenya Ministry of Health emergency triage guidelines.',
      };
    }

    const isVaccine =
      p.includes('vaccine') ||
      p.includes('chanjo') ||
      p.includes('kepi') ||
      p.includes('immuniz');

    if (isVaccine) {
      return {
        emergencyDetected: false,
        response:
          language === 'sw'
            ? 'Mwongozo wa Chanjo ya KEPI (Wizara ya Afya): Hakikisha mtoto anapokea chanjo zote muhimu: BCG na Polio 0 wakati wa kuzaliwa; Penta, Polio, PCV na Rotavirus katika wiki 6, 10, na 14; na Surua/Rubella katika miezi 9 na 18.'
            : 'Kenya MOH KEPI Immunization Schedule: Ensure the child receives all scheduled vaccines: BCG and OPV 0 at birth; Pentavalent, OPV, PCV, and Rotavirus at 6, 10, and 14 weeks; Measles-Rubella at 9 and 18 months.',
      };
    }

    const isPregnancy =
      p.includes('pregnancy') ||
      p.includes('pregnant') ||
      p.includes('mimba') ||
      (context && context.gestationalAge !== undefined);

    if (isPregnancy) {
      const gaText = context?.gestationalAge ? ` (${context.gestationalAge} weeks)` : '';
      return {
        emergencyDetected: false,
        response:
          language === 'sw'
            ? `Mwongozo wa Ujauzito na Kliniki ya ANC${gaText}: Hudhuria angalau ziara 8 za kliniki ya wajawazito. Meza vidonge vya madini chuma na asidi ya foliki (IFAS) kila siku, na zingatia lishe bora na usafi.`
            : `Antenatal Care Guidance${gaText}: Attend at least 8 ANC contacts under Kenya MOH policy. Take daily Iron and Folic Acid Supplements (IFAS), sleep under an insecticide-treated net, and monitor fetal movements.`,
      };
    }

    return {
      emergencyDetected: false,
      response:
        language === 'sw'
          ? 'Ushauri wa Jumla wa Afya: Endelea na unyonyeshaji wa maziwa ya mama pekee kwa miezi 6 ya kwanza, fuatilia ukuaji wa mtoto kila mwezi kliniki, na unywe maji safi na salama.'
          : 'General Clinical Advisory: Continue exclusive breastfeeding for the first 6 months, monitor weight at monthly child welfare clinics, and ensure proper hydration and hygiene.',
    };
  }
}

export class MockNurseRepository extends MockRepository<Nurse> implements INurseRepository {
  async invite(dto: InviteStaffDTO): Promise<{ success: boolean; message?: string; nurse?: Nurse }> {
    const newNurse: Nurse = {
      id: generateId(),
      email: dto.email,
      full_name: dto.fullName,
      facility_id: dto.facilityId,
      role: (dto.role as any) || 'nurse',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await this.create(newNurse);
    return {
      success: true,
      message: `Staff invitation dispatched to ${dto.email} successfully.`,
      nurse: newNurse,
    };
  }
}

export class MockDataClient implements IDataClient {
  readonly mode = 'mock' as const;

  readonly mothers: MockRepository<Mother>;
  readonly children: MockRepository<Child>;
  readonly ancVisits: MockRepository<ANCVisit>;
  readonly immunizations: MockRepository<Immunization>;
  readonly growthRecords: MockRepository<GrowthRecord>;
  readonly facilities: MockRepository<Facility>;
  readonly nurses: MockNurseRepository;
  readonly milestones: MockRepository<Milestone>;
  readonly alerts: MockRepository<AIAlert>;
  readonly learningContents: MockRepository<LearningContent>;
  readonly auditLogs: MockRepository<AuditLog>;

  readonly auth: MockAuthService;
  readonly payments: MockPaymentService;
  readonly ai: MockAIService;
  readonly storage: StorageAdapter;

  private pendingMutations = 0;
  private syncListeners = new Set<SyncStatusListener>();

  constructor() {
    this.storage = new InMemoryStorageAdapter();
    const onMutation = () => {
      this.pendingMutations++;
      this.notifyListeners();
    };

    this.mothers = new MockRepository<Mother>('Mother', mockMothers, onMutation);
    this.children = new MockRepository<Child>('Child', mockChildren, onMutation);
    this.ancVisits = new MockRepository<ANCVisit>('ANCVisit', mockANCVisits, onMutation);
    this.immunizations = new MockRepository<Immunization>('Immunization', mockImmunizations, onMutation);
    this.growthRecords = new MockRepository<GrowthRecord>('GrowthRecord', mockGrowthRecords, onMutation);
    this.facilities = new MockRepository<Facility>('Facility', mockFacilities, onMutation);
    this.nurses = new MockNurseRepository('Nurse', mockNurses, onMutation);
    this.milestones = new MockRepository<Milestone>('Milestone', mockMilestones, onMutation);
    this.alerts = new MockRepository<AIAlert>('AIAlert', mockAlerts, onMutation);
    this.learningContents = new MockRepository<LearningContent>('LearningContent', mockLearningContents, onMutation);
    this.auditLogs = new MockRepository<AuditLog>('AuditLog', [], onMutation);

    this.auth = new MockAuthService();
    this.payments = new MockPaymentService();
    this.ai = new MockAIService();
  }

  async getFacilityCensus(facilityId: string): Promise<FacilityCensus> {
    const mothers = await this.mothers.filter({ facility_id: facilityId });
    const totalMothers = mothers.length;
    const activePregnancies = mothers.filter((m) => m.pregnancy_status === 'pregnant').length;

    const motherIds = new Set(mothers.map((m) => m.id));
    const allChildren = await this.children.list();
    const facilityChildren = allChildren.filter((c) => c.mother_id && motherIds.has(c.mother_id));
    const totalChildren = facilityChildren.length;

    const childIds = new Set(facilityChildren.map((c) => c.id));

    const todayDate = new Date().toISOString().split('T')[0];
    const allAnc = await this.ancVisits.list();
    const ancVisitsToday = allAnc.filter(
      (v) => (v.mother_id && motherIds.has(v.mother_id)) && (v.visit_date === todayDate || true)
    ).length;

    const allVax = await this.immunizations.list();
    const vaccinesToday = allVax.filter(
      (v) => (v.child_id && childIds.has(v.child_id)) && (v.given_date === todayDate || v.status === 'given')
    ).length;

    const allGrowth = await this.growthRecords.list();
    const facilityGrowth = allGrowth.filter((g) => g.child_id && childIds.has(g.child_id));

    let samCases = 0;
    let mamCases = 0;

    for (const g of facilityGrowth) {
      const muac = g.muac_cm;
      const waz = (g as any).weight_for_age_z ?? g.weight_for_age_zscore;
      if ((muac !== undefined && muac < 11.5) || (waz !== undefined && waz < -3)) {
        samCases++;
      } else if (
        (muac !== undefined && muac >= 11.5 && muac < 12.5) ||
        (waz !== undefined && waz >= -3 && waz < -2)
      ) {
        mamCases++;
      }
    }

    return {
      facilityId,
      totalMothers,
      activePregnancies,
      totalChildren,
      ancVisitsToday: Math.min(ancVisitsToday, totalMothers),
      vaccinesToday: Math.min(vaccinesToday, totalChildren * 3),
      samCases,
      mamCases,
    };
  }

  private notifyListeners(): void {
    const status: SyncStatus = this.pendingMutations > 0 ? 'pending' : 'synced';
    this.syncListeners.forEach((listener) => {
      try {
        listener(status, this.pendingMutations);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }

  async getSyncStatus(): Promise<SyncStatus> {
    return this.pendingMutations > 0 ? 'pending' : 'synced';
  }

  async getPendingMutationsCount(): Promise<number> {
    return this.pendingMutations;
  }

  async getPendingSyncCount(): Promise<number> {
    return this.pendingMutations;
  }

  onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.syncListeners.add(listener);
    // Notify immediately on registration
    listener(this.pendingMutations > 0 ? 'pending' : 'synced', this.pendingMutations);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  async sync(): Promise<SyncResult> {
    const count = this.pendingMutations;
    this.pendingMutations = 0;
    this.notifyListeners();

    return {
      success: true,
      syncedCount: count,
      timestamp: new Date().toISOString(),
    };
  }

  async triggerSync(): Promise<SyncResult> {
    return this.sync();
  }

  async invokeClinicalAI(prompt: string, _context?: Record<string, unknown>): Promise<ClinicalAIResponse> {
    const p = prompt.toLowerCase();
    const hasDanger =
      p.includes('danger') ||
      p.includes('hatari') ||
      p.includes('fever') ||
      p.includes('homa') ||
      p.includes('bleeding') ||
      p.includes('damu');

    return {
      emergencyDetected: hasDanger,
      risk_score: hasDanger ? 80 : 15,
      risk_level: hasDanger ? 'high' : 'low',
      summary: hasDanger
        ? 'Potential maternal/child danger signs detected. Immediate clinical assessment at the nearest health facility is advised under Kenya MOH guidelines.'
        : 'All reported indicators appear routine. Continue with standard breastfeeding and the Kenyan KEPI immunization schedule.',
      summary_sw: hasDanger
        ? 'Dalili za hatari zimegunduliwa. Tembelea kituo cha afya kilicho karibu mara moja kulingana na miongozo ya Wizara ya Afya.'
        : 'Viashiria vyote viko kawaida. Endelea na unyonyeshaji na ratiba ya chanjo ya KEPI.',
      action_required: hasDanger ? 'urgent_clinic_visit' : 'routine_monitoring',
      disclaimer: 'This guidance is an AI-assisted advisory and does not replace in-person consultation with a qualified healthcare worker.',
    };
  }
}
