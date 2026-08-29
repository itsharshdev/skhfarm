import { OfflineSyncQueueItem, StakeholderRole, EventType } from '../types';
import { traceService } from './traceService';

const STORAGE_KEY = 'farm_tracer_offline_sync_queue_v1';
const SIMULATED_OFFLINE_KEY = 'farm_tracer_simulated_offline_mode';

class OfflineSyncService {
  private queue: OfflineSyncQueueItem[] = [];
  private listeners: (() => void)[] = [];
  private simulatedOffline: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.simulatedOffline = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';

    // Auto-listen to window online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notify();
      });
      window.addEventListener('offline', () => {
        this.notify();
      });
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      } else {
        // Seed with a sample pending sync item for hackathon demonstration if empty
        this.queue = [
          {
            id: 'OFFLINE-SYNC-DEMO-01',
            batchId: 'WHT-MH-2026-001',
            eventType: 'INSPECTED',
            actor: 'Ramesh Patil (Farmer Field Test)',
            actorRole: 'FARMER',
            location: 'Field Plot 4B, Kopargaon (Low Connectivity Zone)',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            quantity: '120 QUINTAL',
            notes: 'Field moisture sensor reading: 11.6%. Recorded in offline mode at deep farm shed.',
            evidencePreviewUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80',
            status: 'PENDING_SYNC',
            retryCount: 0,
            createdOfflineAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
        ];
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Could not read offline queue from localStorage', e);
      this.queue = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Could not persist offline queue', e);
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getQueue(): OfflineSyncQueueItem[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((q) => q.status === 'PENDING_SYNC' || q.status === 'FAILED').length;
  }

  public isOffline(): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    return this.simulatedOffline;
  }

  public toggleSimulatedOffline(): boolean {
    this.simulatedOffline = !this.simulatedOffline;
    try {
      localStorage.setItem(SIMULATED_OFFLINE_KEY, this.simulatedOffline ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
    this.notify();
    return this.simulatedOffline;
  }

  public addOfflineEvent(eventData: {
    batchId: string;
    eventType: EventType;
    actor: string;
    actorRole: StakeholderRole;
    location: string;
    quantity?: string;
    notes?: string;
    evidencePreviewUrl?: string;
  }): OfflineSyncQueueItem {
    const newItem: OfflineSyncQueueItem = {
      id: `OFFLINE-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: eventData.batchId,
      eventType: eventData.eventType,
      actor: eventData.actor,
      actorRole: eventData.actorRole,
      location: eventData.location,
      timestamp: new Date().toISOString(),
      quantity: eventData.quantity,
      notes: eventData.notes,
      evidencePreviewUrl: eventData.evidencePreviewUrl,
      status: 'PENDING_SYNC',
      retryCount: 0,
      createdOfflineAt: new Date().toISOString(),
    };

    this.queue.unshift(newItem);
    this.saveToStorage();
    this.notify();
    return newItem;
  }

  public async syncAll(): Promise<{ success: number; failed: number }> {
    const pending = this.queue.filter((item) => item.status === 'PENDING_SYNC' || item.status === 'FAILED');
    if (pending.length === 0) {
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      item.status = 'SYNCING';
      this.notify();

      // Simulate network sync latency
      await new Promise((res) => setTimeout(res, 600));

      try {
        // Integrate into live batch ledger
        if (item.eventType === 'RECEIVED') {
          await traceService.receiveBatch(
            item.batchId,
            item.actor,
            item.actorRole,
            item.actor,
            item.location,
            `[SYNCED FROM OFFLINE QUEUE] ${item.notes || 'Field event synchronized.'}`
          );
        } else if (item.eventType === 'TRANSFERRED') {
          await traceService.transferBatch(
            item.batchId,
            item.actor,
            item.actorRole,
            'PROCESSOR',
            'Downstream Processing Unit',
            item.location,
            `[SYNCED FROM OFFLINE QUEUE] ${item.notes || 'Field event synchronized.'}`
          );
        } else {
          // Add evidence or audit record
          await traceService.addEvidenceToBatch(item.batchId, {
            previewUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=600',
            captureType: 'PHOTO',
            capturedBy: item.actor,
            captureLocation: item.location,
            notes: `[OFFLINE SYNC RECORD] ${item.notes || 'Offline transaction synced to live chain.'}`,
          });
        }

        item.status = 'SYNCED';
        successCount++;
      } catch (err: any) {
        item.status = 'FAILED';
        item.retryCount += 1;
        item.errorMessage = err?.message || 'Sync failed due to transient timeout.';
        failedCount++;
      }

      this.saveToStorage();
      this.notify();
    }

    return { success: successCount, failed: failedCount };
  }

  public removeQueueItem(id: string) {
    this.queue = this.queue.filter((q) => q.id !== id);
    this.saveToStorage();
    this.notify();
  }

  public clearSynced() {
    this.queue = this.queue.filter((q) => q.status !== 'SYNCED');
    this.saveToStorage();
    this.notify();
  }
}

export const offlineSyncService = new OfflineSyncService();
