import { OfflineSyncQueueItem, OfflineFileRecord, StakeholderRole, EventType, Batch } from '../types';
import { indexedDbService } from './indexedDbService';
import { traceService } from './traceService';

const LOCALSTORAGE_BACKUP_KEY = 'farm_tracer_offline_sync_queue_backup_v1';
const SIMULATED_OFFLINE_KEY = 'farm_tracer_simulated_offline_mode';

class OfflineSyncService {
  private queue: OfflineSyncQueueItem[] = [];
  private offlineFiles: OfflineFileRecord[] = [];
  private listeners: (() => void)[] = [];
  private simulatedOffline: boolean = false;
  private isSyncing: boolean = false;

  constructor() {
    this.simulatedOffline = typeof localStorage !== 'undefined' && localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
    this.initAsyncState();

    // Auto-listen to window online/offline events for real network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineSync] Network connection recovered.');
        this.notify();
        if (!this.isOffline()) {
          this.syncAll();
        }
      });
      window.addEventListener('offline', () => {
        console.log('[OfflineSync] Network lost. Operating in IndexedDB local-first mode.');
        this.notify();
      });
    }
  }

  private async initAsyncState() {
    try {
      await indexedDbService.initDb();
      await this.reloadFromStorage();

      // If empty on first boot, seed with realistic offline items
      if (this.queue.length === 0 && this.offlineFiles.length === 0) {
        const seedEvent: OfflineSyncQueueItem = {
          id: 'OFFLINE-SYNC-DEMO-01',
          batchId: 'WHT-MH-2026-001',
          eventType: 'INSPECTED',
          actor: 'Ramesh Patil (Farmer Field Inspection)',
          actorRole: 'FARMER',
          location: 'Field Plot 4B, Kopargaon (Low Connectivity Zone)',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          quantity: '120 QUINTAL',
          notes: 'Field moisture sensor reading: 11.6%. Stored in local IndexedDB storage during grid outage.',
          evidencePreviewUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
          status: 'PENDING_SYNC',
          retryCount: 0,
          createdOfflineAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        };

        const seedFile: OfflineFileRecord = {
          id: 'OFFLINE-FILE-DEMO-01',
          batchId: 'WHT-MH-2026-001',
          fileName: 'harvest_grain_quality_proof.jpg',
          fileType: 'PHOTO',
          fileSizeBytes: 420000,
          dataUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
          capturedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          capturedBy: 'Ramesh Patil',
          captureLocation: 'Kopargaon Field Plot 4B',
          tamperProofHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          syncStatus: 'PENDING_SYNC',
          storageEngine: 'INDEXED_DB',
        };

        await this.addOfflineEvent(seedEvent);
        await this.saveOfflineFile(seedFile);
      }
    } catch (e) {
      console.warn('Error initializing offline state from IndexedDB:', e);
    }
  }

  public async reloadFromStorage() {
    try {
      const dbQueue = await indexedDbService.getAllQueueItems();
      const dbFiles = await indexedDbService.getAllOfflineFiles();

      if (dbQueue.length > 0) {
        this.queue = dbQueue;
      } else {
        const localBackup = localStorage.getItem(LOCALSTORAGE_BACKUP_KEY);
        if (localBackup) this.queue = JSON.parse(localBackup);
      }

      this.offlineFiles = dbFiles;
      this.notify();
    } catch (e) {
      console.warn('Could not reload from storage:', e);
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

  public getOfflineFiles(): OfflineFileRecord[] {
    return [...this.offlineFiles];
  }

  public getPendingCount(): number {
    const pendingEvents = this.queue.filter((q) => q.status === 'PENDING_SYNC' || q.status === 'FAILED').length;
    const pendingFiles = this.offlineFiles.filter((f) => f.syncStatus === 'PENDING_SYNC' || f.syncStatus === 'FAILED').length;
    return pendingEvents + pendingFiles;
  }

  public isOffline(): boolean {
    if (this.simulatedOffline) return true;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    return false;
  }

  public toggleSimulatedOffline(): boolean {
    this.simulatedOffline = !this.simulatedOffline;
    try {
      localStorage.setItem(SIMULATED_OFFLINE_KEY, this.simulatedOffline ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
    this.notify();

    // If switched back online, automatically trigger synchronization
    if (!this.simulatedOffline) {
      this.syncAll();
    }

    return this.simulatedOffline;
  }

  // =========================================================================
  // 1. ADD / MANAGE OFFLINE TRANSACTIONS & EVENTS
  // =========================================================================

  public async addOfflineEvent(eventData: Partial<OfflineSyncQueueItem> & {
    batchId: string;
    eventType: EventType;
    actor: string;
    actorRole: StakeholderRole;
    location: string;
    quantity?: string;
    notes?: string;
    evidencePreviewUrl?: string;
  }): Promise<OfflineSyncQueueItem> {
    const newItem: OfflineSyncQueueItem = {
      id: eventData.id || `OFFLINE-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: eventData.batchId,
      eventType: eventData.eventType,
      actor: eventData.actor,
      actorRole: eventData.actorRole,
      location: eventData.location,
      timestamp: eventData.timestamp || new Date().toISOString(),
      quantity: eventData.quantity,
      notes: eventData.notes,
      evidencePreviewUrl: eventData.evidencePreviewUrl,
      status: (eventData.status as any) || 'PENDING_SYNC',
      retryCount: 0,
      createdOfflineAt: eventData.createdOfflineAt || new Date().toISOString(),
    };

    // Store in IndexedDB
    await indexedDbService.saveQueueItem(newItem);
    this.queue = [newItem, ...this.queue.filter((q) => q.id !== newItem.id)];

    // Keep LocalStorage backup
    try {
      localStorage.setItem(LOCALSTORAGE_BACKUP_KEY, JSON.stringify(this.queue));
    } catch (e) {}

    this.notify();
    return newItem;
  }

  // =========================================================================
  // 2. ADD / MANAGE OFFLINE MEDIA & EVIDENCE FILES
  // =========================================================================

  public async saveOfflineFile(fileInput: {
    id?: string;
    batchId: string;
    fileName: string;
    fileType: 'PHOTO' | 'VIDEO' | 'CERTIFICATE' | 'DOCUMENT';
    fileSizeBytes?: number;
    dataUrl: string;
    capturedBy: string;
    captureLocation?: string;
    tamperProofHash?: string;
  }): Promise<OfflineFileRecord> {
    const newFile: OfflineFileRecord = {
      id: fileInput.id || `OFFLINE-FILE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: fileInput.batchId,
      fileName: fileInput.fileName,
      fileType: fileInput.fileType,
      fileSizeBytes: fileInput.fileSizeBytes || Math.round(fileInput.dataUrl.length * 0.75),
      dataUrl: fileInput.dataUrl,
      capturedAt: new Date().toISOString(),
      capturedBy: fileInput.capturedBy,
      captureLocation: fileInput.captureLocation || 'Field Facility',
      tamperProofHash: fileInput.tamperProofHash || `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      syncStatus: 'PENDING_SYNC',
      storageEngine: 'INDEXED_DB',
    };

    await indexedDbService.saveOfflineFile(newFile);
    this.offlineFiles = [newFile, ...this.offlineFiles.filter((f) => f.id !== newFile.id)];
    this.notify();
    return newFile;
  }

  public async removeOfflineFile(id: string): Promise<void> {
    await indexedDbService.deleteOfflineFile(id);
    this.offlineFiles = this.offlineFiles.filter((f) => f.id !== id);
    this.notify();
  }

  public async removeQueueItem(id: string): Promise<void> {
    await indexedDbService.deleteQueueItem(id);
    this.queue = this.queue.filter((q) => q.id !== id);
    try {
      localStorage.setItem(LOCALSTORAGE_BACKUP_KEY, JSON.stringify(this.queue));
    } catch (e) {}
    this.notify();
  }

  public async clearSynced(): Promise<void> {
    await indexedDbService.clearSyncedQueueItems();
    this.queue = this.queue.filter((q) => q.status !== 'SYNCED');
    
    // Also clear synced files from memory
    const pendingOnlyFiles = this.offlineFiles.filter((f) => f.syncStatus !== 'SYNCED');
    const syncedFiles = this.offlineFiles.filter((f) => f.syncStatus === 'SYNCED');
    for (const sf of syncedFiles) {
      await indexedDbService.deleteOfflineFile(sf.id);
    }
    this.offlineFiles = pendingOnlyFiles;

    try {
      localStorage.setItem(LOCALSTORAGE_BACKUP_KEY, JSON.stringify(this.queue));
    } catch (e) {}
    this.notify();
  }

  // =========================================================================
  // 3. SYNCHRONIZATION ENGINE (OUTAGE RECOVERY & LEDGER MERGE)
  // =========================================================================

  public async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || this.isOffline()) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notify();

    const pendingQueue = this.queue.filter((item) => item.status === 'PENDING_SYNC' || item.status === 'FAILED');
    const pendingFiles = this.offlineFiles.filter((f) => f.syncStatus === 'PENDING_SYNC' || f.syncStatus === 'FAILED');

    let successCount = 0;
    let failedCount = 0;

    // 1. Sync Offline Files First
    for (const file of pendingFiles) {
      file.syncStatus = 'SYNCING';
      await indexedDbService.updateFileStatus(file.id, 'SYNCING');
      this.notify();

      await new Promise((res) => setTimeout(res, 400));

      try {
        await traceService.addEvidenceToBatch(file.batchId, {
          previewUrl: file.dataUrl,
          captureType: file.fileType === 'VIDEO' ? 'VIDEO' : 'PHOTO',
          capturedBy: file.capturedBy,
          captureLocation: file.captureLocation,
          notes: `[INDEXED-DB SYNCED ASSET] ${file.fileName} synchronized from local storage.`,
        });

        file.syncStatus = 'SYNCED';
        await indexedDbService.updateFileStatus(file.id, 'SYNCED');
        successCount++;
      } catch (err: any) {
        file.syncStatus = 'FAILED';
        await indexedDbService.updateFileStatus(file.id, 'FAILED');
        failedCount++;
      }
      this.notify();
    }

    // 2. Sync Offline Events & Transactions
    for (const item of pendingQueue) {
      item.status = 'SYNCING';
      await indexedDbService.saveQueueItem(item);
      this.notify();

      await new Promise((res) => setTimeout(res, 500));

      try {
        if (item.eventType === 'RECEIVED') {
          await traceService.receiveBatch(
            item.batchId,
            item.actor,
            item.actorRole,
            item.actor,
            item.location,
            `[SYNCED FROM INDEXED-DB QUEUE] ${item.notes || 'Field transaction merged.'}`
          );
        } else if (item.eventType === 'TRANSFERRED') {
          await traceService.transferBatch(
            item.batchId,
            item.actor,
            item.actorRole,
            'PROCESSOR',
            'Downstream Processing Facility',
            item.location,
            `[SYNCED FROM INDEXED-DB QUEUE] ${item.notes || 'Field handoff merged.'}`
          );
        } else {
          await traceService.addEvidenceToBatch(item.batchId, {
            previewUrl: item.evidencePreviewUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=600',
            captureType: 'PHOTO',
            capturedBy: item.actor,
            captureLocation: item.location,
            notes: `[OFFLINE SYNC RECORD] ${item.notes || 'Transaction synced to chain.'}`,
          });
        }

        item.status = 'SYNCED';
        await indexedDbService.saveQueueItem(item);
        successCount++;
      } catch (err: any) {
        item.status = 'FAILED';
        item.retryCount += 1;
        item.errorMessage = err?.message || 'Sync failed due to transient timeout.';
        await indexedDbService.saveQueueItem(item);
        failedCount++;
      }

      this.notify();
    }

    try {
      localStorage.setItem(LOCALSTORAGE_BACKUP_KEY, JSON.stringify(this.queue));
    } catch (e) {}

    this.isSyncing = false;
    this.notify();
    return { success: successCount, failed: failedCount };
  }
}

export const offlineSyncService = new OfflineSyncService();
