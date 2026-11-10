/**
 * TotoAfya Digital — Non-Blocking Transactional Mutation Queue Processor
 * Task Directive TD-3.4: Transactional Mutation Outbox & Offline Reconciliation
 * 
 * Provides:
 * 1. Non-blocking asynchronous processing of pending outbox mutations.
 * 2. Transient status transitions: marks status 'in_flight' during network dispatch.
 * 3. Head-of-Line Blocking elimination: individual mutation failures are caught,
 *    logged, retry_count is incremented, and processing continues to the next mutation.
 * 4. Automatic dead-letter quarantine: transitions to 'dead_letter' once retry_count >= 5.
 * 5. Real-time status event broadcasting: emits 'synced' | 'syncing' | 'pending' | 'dead_letter'
 *    with pending, in-flight, and dead-letter item counts to registered listeners.
 * 6. Browser online event auto-triggering when running in browser environments.
 */

import type {
  StorageAdapter,
  MutationRecord,
} from '@totoafya/types';

export type QueueSyncStatus = 'synced' | 'syncing' | 'pending' | 'dead_letter';

export interface QueueStatusEvent {
  readonly status: QueueSyncStatus;
  readonly pendingCount: number;
  readonly inFlightCount: number;
  readonly deadLetterCount: number;
  readonly lastError?: string;
  readonly timestamp: string;
}

export type QueueStatusListener = (
  status: QueueSyncStatus,
  pendingCount: number,
  event: QueueStatusEvent
) => void;

export interface ProcessQueueResult {
  readonly processed: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly deadLettered: number;
  readonly remainingPending: number;
  readonly status: QueueSyncStatus;
}

export type MutationSyncHandler = (mutation: MutationRecord) => Promise<unknown>;

export interface MutationQueueProcessorOptions {
  readonly storage: StorageAdapter;
  readonly syncMutation?: MutationSyncHandler;
  readonly autoSyncOnOnline?: boolean;
}

export class MutationQueueProcessor {
  private readonly storage: StorageAdapter;
  private readonly syncMutation?: MutationSyncHandler;
  private readonly listeners = new Set<QueueStatusListener>();
  private isProcessing = false;
  private currentStatus: QueueSyncStatus = 'synced';
  private unbindOnlineListener?: () => void;

  constructor(options: MutationQueueProcessorOptions) {
    this.storage = options.storage;
    this.syncMutation = options.syncMutation;

    if (
      options.autoSyncOnOnline !== false &&
      typeof window !== 'undefined' &&
      typeof window.addEventListener === 'function'
    ) {
      const handleOnline = () => {
        this.processQueue().catch((err) => {
          console.warn('[MutationQueueProcessor] Auto-sync failed on online event:', err);
        });
      };
      window.addEventListener('online', handleOnline);
      this.unbindOnlineListener = () => {
        window.removeEventListener('online', handleOnline);
      };
    }
  }

  /**
   * Registers a status listener.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: QueueStatusListener): () => void {
    this.listeners.add(listener);
    this.emitCurrentStatus(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Alias for subscribe to match standard event listener naming.
   */
  public onStatusChange(listener: QueueStatusListener): () => void {
    return this.subscribe(listener);
  }

  /**
   * Returns the number of currently registered status listeners.
   */
  public getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Returns whether the processor is actively executing a synchronization pass.
   */
  public isBusy(): boolean {
    return this.isProcessing;
  }

  /**
   * Inspects current outbox state and returns a complete status event.
   */
  public async getStatus(): Promise<QueueStatusEvent> {
    const [pending, deadLetters] = await Promise.all([
      this.storage.getPendingMutations(),
      this.storage.getDeadLetterMutations(),
    ]);

    const status = this.deriveStatus(pending.length, deadLetters.length, this.isProcessing);
    this.currentStatus = status;

    return {
      status,
      pendingCount: pending.length,
      deadLetterCount: deadLetters.length,
      inFlightCount: this.isProcessing
        ? pending.filter((m) => m.sync_status === 'in_flight').length
        : 0,
      timestamp: new Date().toISOString(),
    };
  }

  private deriveStatus(
    pendingCount: number,
    deadLetterCount: number,
    isProcessing: boolean
  ): QueueSyncStatus {
    if (isProcessing) {
      return 'syncing';
    }
    if (pendingCount > 0) {
      return 'pending';
    }
    if (deadLetterCount > 0) {
      return 'dead_letter';
    }
    return 'synced';
  }

  private async notifyListeners(status: QueueSyncStatus, lastError?: string): Promise<void> {
    this.currentStatus = status;
    const [pending, deadLetters] = await Promise.all([
      this.storage.getPendingMutations(),
      this.storage.getDeadLetterMutations(),
    ]);

    const event: QueueStatusEvent = {
      status,
      pendingCount: pending.length,
      deadLetterCount: deadLetters.length,
      inFlightCount: pending.filter((m) => m.sync_status === 'in_flight').length,
      lastError,
      timestamp: new Date().toISOString(),
    };

    for (const listener of this.listeners) {
      try {
        listener(status, event.pendingCount, event);
      } catch (err) {
        console.error('[MutationQueueProcessor] Error in status listener:', err);
      }
    }
  }

  private emitCurrentStatus(listener: QueueStatusListener): void {
    this.getStatus()
      .then((event) => {
        try {
          listener(event.status, event.pendingCount, event);
        } catch (err) {
          console.error('[MutationQueueProcessor] Error in initial status listener invocation:', err);
        }
      })
      .catch(() => {});
  }

  /**
   * Executes a non-blocking synchronization loop across all pending mutations.
   * If a syncMutation handler throws an error for a given mutation:
   * 1. The error is caught.
   * 2. incrementRetryCount is called.
   * 3. An error is logged to console.warn.
   * 4. The loop continues to the next mutation (zero Head-of-Line Blocking).
   */
  public async processQueue(): Promise<ProcessQueueResult> {
    if (this.isProcessing) {
      const status = await this.getStatus();
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        deadLettered: 0,
        remainingPending: status.pendingCount,
        status: 'syncing',
      };
    }

    this.isProcessing = true;
    let succeeded = 0;
    let failed = 0;
    let deadLettered = 0;
    let lastError: string | undefined;

    try {
      const pending = await this.storage.getPendingMutations();

      if (pending.length === 0) {
        const deadLetters = await this.storage.getDeadLetterMutations();
        const finalStatus = this.deriveStatus(0, deadLetters.length, false);
        await this.notifyListeners(finalStatus);
        return {
          processed: 0,
          succeeded: 0,
          failed: 0,
          deadLettered: 0,
          remainingPending: 0,
          status: finalStatus,
        };
      }

      // Transition to 'syncing' and notify listeners
      await this.notifyListeners('syncing');

      // Sequential non-blocking loop over all pending mutations
      for (const mutation of pending) {
        try {
          // Mark in_flight
          await this.storage.updateMutationStatus(mutation.id, 'in_flight');

          // Execute remote sync handler if provided
          if (this.syncMutation) {
            await this.syncMutation(mutation);
          }

          // Successful synchronization: remove from outbox
          await this.storage.removeMutation(mutation.id);
          succeeded++;
        } catch (err) {
          failed++;
          const errorMessage = err instanceof Error ? err.message : String(err);
          lastError = errorMessage;

          console.warn(
            `[MutationQueueProcessor] Mutation ${mutation.id} (${mutation.entity}:${mutation.action}) sync failed: ${errorMessage}`
          );

          // Increment retry count; automatically quarantines to 'dead_letter' if attempts reach 5
          const updated = await this.storage.incrementRetryCount(mutation.id, errorMessage);
          if (updated?.sync_status === 'dead_letter') {
            deadLettered++;
          }
          // Intentionally do NOT break; loop continues to allow subsequent valid mutations to sync
        }
      }

      // Re-evaluate pending and dead-letter queues after processing
      const [remainingPending, remainingDeadLetters] = await Promise.all([
        this.storage.getPendingMutations(),
        this.storage.getDeadLetterMutations(),
      ]);

      const finalStatus = this.deriveStatus(
        remainingPending.length,
        remainingDeadLetters.length,
        false
      );

      await this.notifyListeners(finalStatus, lastError);

      return {
        processed: pending.length,
        succeeded,
        failed,
        deadLettered,
        remainingPending: remainingPending.length,
        status: finalStatus,
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Alias for processQueue()
   */
  public async process(): Promise<ProcessQueueResult> {
    return this.processQueue();
  }

  /**
   * Cleanup listeners and window events upon unmount/teardown.
   */
  public destroy(): void {
    if (this.unbindOnlineListener) {
      this.unbindOnlineListener();
      this.unbindOnlineListener = undefined;
    }
    this.listeners.clear();
  }
}
