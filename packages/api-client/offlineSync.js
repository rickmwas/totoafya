/**
 * @deprecated Legacy Offline Synchronization Forwarder
 * Task Directive TD-3.4: Replaced by IndexedDBStorageAdapter and MutationQueueProcessor.
 * Retained exclusively for backward compatibility with legacy calls.
 */

import { IndexedDBStorageAdapter, OUTBOX_DB_NAME, OUTBOX_DB_VERSION } from './src/storage/IndexedDBStorageAdapter';
import { MutationQueueProcessor } from './src/storage/MutationQueueProcessor';

// Shared singleton modern adapter for backward-compatible outbox operations
const defaultAdapter = new IndexedDBStorageAdapter();

/**
 * @deprecated Use IndexedDBStorageAdapter directly.
 */
export function openIndexedDB() {
  if (typeof indexedDB === 'undefined' && typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    try {
      const request = (typeof window !== 'undefined' ? window.indexedDB : indexedDB).open(
        OUTBOX_DB_NAME,
        OUTBOX_DB_VERSION
      );
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * @deprecated Use defaultAdapter.enqueueMutation() or DataClient transactional outbox.
 */
export async function queueMutation(action, entity, recordId, payload) {
  try {
    await defaultAdapter.enqueueMutation({
      entity,
      action,
      payload: { ...payload, id: recordId },
      base_version: 1,
      user_id: payload?.user_id || 'system-offline-user',
      operator_id: payload?.operator_id || 'system-offline-operator',
      facility_id: payload?.facility_id || 'default-facility',
    });
    return true;
  } catch (err) {
    console.warn('[offlineSync] queueMutation forwarder error:', err);
    return false;
  }
}

/**
 * @deprecated Use DataClient auditLogs.create() or standard audit logger.
 */
export async function queueAuditLog(operatorId, role, action, affectedRecordId, details = {}) {
  try {
    await defaultAdapter.enqueueMutation({
      entity: 'Milestone', // fallback entity
      action: 'create',
      payload: {
        operator_id: operatorId,
        operator_role: role,
        action,
        affected_record_id: affectedRecordId,
        new_value: details,
        is_audit_log: true,
      },
      base_version: 1,
      user_id: operatorId,
      operator_id: operatorId,
      facility_id: details?.facility_id || 'default-facility',
    });
    return true;
  } catch (err) {
    console.warn('[offlineSync] queueAuditLog forwarder error:', err);
    return false;
  }
}

/**
 * @deprecated Use MutationQueueProcessor.processQueue() with DataClient.
 */
export async function processSyncQueue(supabase) {
  if (!supabase) return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };

  const processor = new MutationQueueProcessor({
    storage: defaultAdapter,
    syncMutation: async (mutation) => {
      const table = mapEntityToTable(mutation.entity);
      if (!table) return;

      if (mutation.action === 'create') {
        const { error } = await supabase.from(table).insert([mutation.payload]);
        if (error) throw error;
      } else if (mutation.action === 'update') {
        const { error } = await supabase
          .from(table)
          .update(mutation.payload)
          .eq('id', mutation.payload?.id || mutation.id);
        if (error) throw error;
      } else if (mutation.action === 'delete') {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', mutation.payload?.id || mutation.id);
        if (error) throw error;
      }
    },
  });

  return processor.processQueue();
}

/**
 * @deprecated Query defaultAdapter.getPendingMutations()
 */
export async function getSyncQueueItems() {
  return defaultAdapter.getPendingMutations();
}

/**
 * @deprecated Use defaultAdapter.removeMutation(id)
 */
export async function deleteQueueItem(db, id) {
  await defaultAdapter.removeMutation(id);
  return true;
}

/**
 * @deprecated Use defaultAdapter.incrementRetryCount(id)
 */
export async function updateQueueItemAttempts(db, id, attempts) {
  await defaultAdapter.incrementRetryCount(id, `Manual attempt bump to ${attempts}`);
  return true;
}

/**
 * @deprecated Handled by unified outbox processor
 */
export async function syncAuditLogs() {
  return true;
}

/**
 * Maps entity name to database table
 */
export function mapEntityToTable(entity) {
  const mapping = {
    Mother: 'mothers',
    Child: 'children',
    ANCVisit: 'anc_visits',
    Immunization: 'immunizations',
    GrowthRecord: 'growth_records',
    Milestone: 'milestones',
    Alert: 'ai_alerts',
    Message: 'messages',
  };
  return mapping[entity] || null;
}
