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

export type FilterValue = string | number | boolean | null | string[] | number[];

export type FilterCriteria<T> = {
  [K in keyof T]?: FilterValue;
} & {
  query?: string;
} & Record<string, any>;

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

export type SyncStatusListener = (status: SyncStatus, pendingCount: number) => void;

export interface SyncErrorItem {
  id: string;
  error: string;
  entity?: string;
  action?: string;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  errors?: SyncErrorItem[];
  timestamp: string;
}

export interface IRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  list(sortKey?: string, limit?: number, queryOrFilterId?: string): Promise<T[]>;
  filter(criteria: FilterCriteria<T>, sortKey?: string, limit?: number): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  bulkCreate(records: CreateDTO[]): Promise<T[]>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<{ id: string }>;
  search?(query: string, options?: { facility_id?: string; limit?: number }): Promise<T[]>;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  facility_id?: string | null;
  mother_id?: string | null;
  nurse_id?: string | null;
  employee_id?: string | null;
  national_id?: string | null;
  anc_number?: string | null;
  phone?: string | null;
  profile_complete?: boolean;
  subscription_status?: string;
  trial_end_date?: string | null;
}

export interface IAuthService {
  login(email: string, password?: string): Promise<AuthSessionUser>;
  signInWithNationalIdOrAnc(identifier: string, pin?: string, activationCode?: string | null): Promise<AuthSessionUser>;
  signUpMother(identifier: string, pin: string, metadata: Record<string, any>): Promise<AuthSessionUser>;
  logout(): Promise<void>;
  me(): Promise<AuthSessionUser | null>;
  isAuthenticated(): Promise<boolean>;
  switchMockRole?(role: string): void;
}

export interface PaymentStatus {
  checkoutRequestId: string;
  status: 'pending' | 'completed' | 'failed';
  amount?: number;
  phoneNumber?: string;
  receiptNumber?: string;
  failureReason?: string;
  updatedAt: string;
}

export interface SubscriptionInfo {
  motherId: string;
  status: 'active' | 'expired' | 'trial' | 'none';
  planId?: string;
  expiresAt?: string;
  autoRenew?: boolean;
}

export interface STKPushParams {
  phoneNumber?: string;
  phone?: string;
  amount: number;
  planId?: string;
  plan?: string;
  mother_id?: string;
}

export interface IPaymentService {
  initiateSTKPush(
    phoneNumberOrParams: string | STKPushParams,
    amount?: number,
    planId?: string
  ): Promise<{ checkoutRequestId: string }>;
  checkPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus>;
  getSubscriptionStatus(motherId: string): Promise<SubscriptionInfo>;
}

export interface IAIService {
  askClinicalQuestion(
    prompt: string,
    context?: { gestationalAge?: number; childAgeMonths?: number },
    language?: 'en' | 'sw'
  ): Promise<{ response: string; emergencyDetected: boolean }>;
}

export interface InviteStaffDTO {
  email: string;
  role: string;
  facilityId: string;
  fullName: string;
}

export interface INurseRepository extends IRepository<Nurse> {
  invite(dto: InviteStaffDTO): Promise<{ success: boolean; message?: string; nurse?: Nurse }>;
}

export interface IDataClient {
  readonly mode: 'mock' | 'live';
  
  // Primary Domain Repositories
  readonly mothers: IRepository<Mother>;
  readonly children: IRepository<Child>;
  readonly ancVisits: IRepository<ANCVisit>;
  readonly immunizations: IRepository<Immunization>;
  readonly growthRecords: IRepository<GrowthRecord>;
  readonly facilities: IRepository<Facility>;
  readonly nurses: INurseRepository;
  readonly milestones: IRepository<Milestone>;
  readonly alerts: IRepository<AIAlert>;
  readonly learningContents: IRepository<LearningContent>;
  readonly auditLogs: IRepository<AuditLog>;

  // Authentication Service
  readonly auth: IAuthService;

  // Payments & Subscription
  readonly payments: IPaymentService;

  // AI & Clinical Decision Support
  readonly ai: IAIService;

  // Facility Operational Telemetry & Census
  getFacilityCensus(facilityId: string): Promise<FacilityCensus>;

  // Offline Synchronization & Concurrency
  getSyncStatus(): Promise<SyncStatus>;
  sync(): Promise<SyncResult>;
  triggerSync(): Promise<SyncResult>;
  getPendingMutationsCount(): Promise<number>;
  getPendingSyncCount(): Promise<number>;
  onSyncStatusChange(listener: SyncStatusListener): () => void;

  // AI & Clinical Decision Support (Legacy / Direct)
  invokeClinicalAI(prompt: string, context?: Record<string, any>): Promise<any>;
}
