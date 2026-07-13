// Offline Synchronization Engine for TotoAfya Digital PWA

const DB_NAME = 'totoafya_offline_db';
const DB_VERSION = 1;

export function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Store local mutations to sync to Supabase
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }

      // Local encrypted data cache (Mother profile, Child profile, ANC visits)
      if (!db.objectStoreNames.contains('encrypted_cache')) {
        db.createObjectStore('encrypted_cache', { keyPath: 'key' });
      }

      // Offline audit logs queue
      if (!db.objectStoreNames.contains('audit_logs_queue')) {
        db.createObjectStore('audit_logs_queue', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Queue an action to sync later
export async function queueMutation(action, entity, recordId, payload) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    const record = {
      action, // 'create' | 'update' | 'delete'
      entity, // 'Mother' | 'Child' | 'ANCVisit' | 'Immunization'
      recordId,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    const request = store.add(record);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Queue an audit log offline
export async function queueAuditLog(operatorId, role, action, affectedRecordId, details = {}) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audit_logs_queue'], 'readwrite');
    const store = transaction.objectStore('audit_logs_queue');

    const logRecord = {
      operator_id: operatorId,
      operator_role: role,
      action,
      affected_record_id: affectedRecordId,
      new_value: details,
      created_at: new Date().toISOString()
    };

    const request = store.add(logRecord);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Sync local modifications with Supabase cloud database
export async function processSyncQueue(supabase) {
  if (!navigator.onLine || !supabase) return;

  const db = await openIndexedDB();
  
  // 1. Process Audit Logs Queue first (guarantee audit trails are flushed first)
  await syncAuditLogs(db, supabase);

  // 2. Process Data Mutations Queue
  const queue = await getSyncQueueItems(db);
  if (queue.length === 0) return;

  for (const item of queue) {
    try {
      const table = mapEntityToTable(item.entity);
      if (!table) {
        await deleteQueueItem(db, item.id);
        continue;
      }

      // Check conflict status on server
      const { data: serverRecord } = await supabase
        .from(table)
        .select('*')
        .eq('id', item.recordId)
        .maybeSingle();

      let shouldApply = true;

      // Conflict resolution rules
      if (serverRecord) {
        const isClinical = ['anc_visits', 'immunizations'].includes(table);

        if (isClinical) {
          // Rule: Clinicians/Nurses take precedence over caregiver edits
          // If server record has been modified by a nurse, discard caregiver update
          if (serverRecord.updated_by_role === 'nurse' || serverRecord.updated_by_role === 'admin') {
            console.warn(`Clinical sync conflict on table ${table} for ID ${item.recordId}. Server clinical version wins. Discarding client edit.`);
            shouldApply = false;
            
            // Log clinical sync exception to database
            await supabase.from('system_errors').insert([{
              error_code: 'SYNC_CLINICAL_CONFLICT_DISCARD',
              message: `Conflict on clinical table ${table} for ID ${item.recordId}. Nurse-precedence policy applied. Caregiver changes discarded.`,
              device_info: { timestamp: item.timestamp, browser: navigator.userAgent }
            }]);
          }
        } else {
          // Rule: Caregivers - Last-Write-Wins (LWW) based on client timestamp
          const serverUpdateDate = new Date(serverRecord.updated_at || serverRecord.created_at);
          const clientUpdateDate = new Date(item.timestamp);
          
          if (clientUpdateDate < serverUpdateDate) {
            console.log(`Sync conflict resolved by LWW (Server is newer). Discarding client update.`);
            shouldApply = false;
          }
        }
      }

      if (shouldApply) {
        let resultError = null;

        if (item.action === 'create') {
          const { error } = await supabase.from(table).insert([item.payload]);
          resultError = error;
        } else if (item.action === 'update') {
          const { error } = await supabase.from(table).update(item.payload).eq('id', item.recordId);
          resultError = error;
        } else if (item.action === 'delete') {
          const { error } = await supabase.from(table).delete().eq('id', item.recordId);
          resultError = error;
        }

        if (resultError) throw resultError;
      }

      // Successfully processed, remove from queue
      await deleteQueueItem(db, item.id);
      
      // Log successful sync
      await supabase.from('system_logs').insert([{
        log_type: 'sync',
        message: `Synced entity ${item.entity} (${item.action}) for record ID ${item.recordId}`,
        payload: { record_id: item.recordId, client_timestamp: item.timestamp }
      }]);

    } catch (err) {
      console.error(`Sync failed for item ${item.id}:`, err);
      // Increment attempts
      await updateQueueItemAttempts(db, item.id, item.attempts + 1);
      
      // Report exception to database
      try {
        await supabase.from('system_errors').insert([{
          error_code: 'SYNC_EXCEPTION_RETRY',
          message: err.message || 'Unknown sync error occurred',
          stack_trace: err.stack || null,
          device_info: { item_id: item.id, attempts: item.attempts + 1 }
        }]);
      } catch (logErr) {
        console.error("Failed to log sync exception to database:", logErr);
      }
      
      break; // Pause processing until next connection cycle
    }
  }
}

// Helpers for IndexedDB interaction
function getSyncQueueItems(db) {
  return new Promise((resolve) => {
    const transaction = db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

function deleteQueueItem(db, id) {
  return new Promise((resolve) => {
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
  });
}

function updateQueueItemAttempts(db, id, attempts) {
  return new Promise((resolve) => {
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const getReq = store.get(id);
    
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.attempts = attempts;
        store.put(record);
      }
      resolve(true);
    };
  });
}

// Flush local audit logs to the cloud database
async function syncAuditLogs(db, supabase) {
  const transaction = db.transaction(['audit_logs_queue'], 'readonly');
  const store = transaction.objectStore('audit_logs_queue');
  
  const logs = await new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });

  if (logs.length === 0) return;

  for (const log of logs) {
    try {
      const { id, ...logPayload } = log;
      const { error } = await supabase.from('audit_logs').insert([logPayload]);
      if (error) throw error;
      
      // Delete from IndexedDB queue
      const delTx = db.transaction(['audit_logs_queue'], 'readwrite');
      delTx.objectStore('audit_logs_queue').delete(id);
    } catch (err) {
      console.error("Failed to sync audit log entry:", err);
      break;
    }
  }
}

// Map client entity name to Database Table
function mapEntityToTable(entity) {
  const mapping = {
    'Mother': 'mothers',
    'Child': 'children',
    'ANCVisit': 'anc_visits',
    'Immunization': 'immunizations',
    'Milestone': 'milestones',
    'Alert': 'ai_alerts',
    'Message': 'messages'
  };
  return mapping[entity] || null;
}
