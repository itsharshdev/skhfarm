import { OfflineSyncQueueItem, OfflineFileRecord, Batch } from '../types';

const DB_NAME = 'FarmTracer_OfflineStore_v1';
const DB_VERSION = 1;

export const STORES = {
  OFFLINE_QUEUE: 'offline_queue',
  OFFLINE_FILES: 'offline_files',
  CACHED_BATCHES: 'cached_batches',
} as const;

class IndexedDbService {
  private db: IDBDatabase | null = null;
  private isAvailable: boolean = typeof window !== 'undefined' && 'indexedDB' in window;

  /**
   * Initialize or open the native IndexedDB database
   */
  public async initDb(): Promise<IDBDatabase | null> {
    if (!this.isAvailable) {
      console.warn('IndexedDB is not supported on this browser environment.');
      return null;
    }

    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Offline Queue Store
          if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
            const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'id' });
            queueStore.createIndex('status', 'status', { unique: false });
            queueStore.createIndex('batchId', 'batchId', { unique: false });
            queueStore.createIndex('createdOfflineAt', 'createdOfflineAt', { unique: false });
          }

          // 2. Offline Media Files Store
          if (!db.objectStoreNames.contains(STORES.OFFLINE_FILES)) {
            const filesStore = db.createObjectStore(STORES.OFFLINE_FILES, { keyPath: 'id' });
            filesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            filesStore.createIndex('batchId', 'batchId', { unique: false });
            filesStore.createIndex('capturedAt', 'capturedAt', { unique: false });
          }

          // 3. Offline Cached Batches Store (for reading during outages)
          if (!db.objectStoreNames.contains(STORES.CACHED_BATCHES)) {
            const batchesStore = db.createObjectStore(STORES.CACHED_BATCHES, { keyPath: 'batchId' });
            batchesStore.createIndex('status', 'status', { unique: false });
            batchesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        };

        request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve(this.db);
        };

        request.onerror = (event: Event) => {
          console.warn('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB exception:', err);
        resolve(null);
      }
    });
  }

  // =========================================================================
  // 1. OFFLINE QUEUE (TRANSACTIONS & EVENTS)
  // =========================================================================

  public async saveQueueItem(item: OfflineSyncQueueItem): Promise<boolean> {
    const db = await this.initDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
        const store = tx.objectStore(STORES.OFFLINE_QUEUE);
        const req = store.put(item);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  public async getAllQueueItems(): Promise<OfflineSyncQueueItem[]> {
    const db = await this.initDb();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_QUEUE], 'readonly');
        const store = tx.objectStore(STORES.OFFLINE_QUEUE);
        const req = store.getAll();

        req.onsuccess = () => {
          const items: OfflineSyncQueueItem[] = req.result || [];
          // Sort newest first
          items.sort((a, b) => new Date(b.createdOfflineAt).getTime() - new Date(a.createdOfflineAt).getTime());
          resolve(items);
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  public async deleteQueueItem(id: string): Promise<boolean> {
    const db = await this.initDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
        const store = tx.objectStore(STORES.OFFLINE_QUEUE);
        const req = store.delete(id);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  public async clearSyncedQueueItems(): Promise<boolean> {
    const items = await this.getAllQueueItems();
    const synced = items.filter((i) => i.status === 'SYNCED');
    for (const item of synced) {
      await this.deleteQueueItem(item.id);
    }
    return true;
  }

  // =========================================================================
  // 2. OFFLINE MEDIA & EVIDENCE FILES
  // =========================================================================

  public async saveOfflineFile(fileRecord: OfflineFileRecord): Promise<boolean> {
    const db = await this.initDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_FILES], 'readwrite');
        const store = tx.objectStore(STORES.OFFLINE_FILES);
        const req = store.put(fileRecord);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  public async getAllOfflineFiles(): Promise<OfflineFileRecord[]> {
    const db = await this.initDb();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_FILES], 'readonly');
        const store = tx.objectStore(STORES.OFFLINE_FILES);
        const req = store.getAll();

        req.onsuccess = () => {
          const files: OfflineFileRecord[] = req.result || [];
          files.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
          resolve(files);
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  public async updateFileStatus(id: string, syncStatus: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED'): Promise<boolean> {
    const db = await this.initDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_FILES], 'readwrite');
        const store = tx.objectStore(STORES.OFFLINE_FILES);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const file = getReq.result as OfflineFileRecord;
          if (file) {
            file.syncStatus = syncStatus;
            store.put(file);
            resolve(true);
          } else {
            resolve(false);
          }
        };
        getReq.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  public async deleteOfflineFile(id: string): Promise<boolean> {
    const db = await this.initDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.OFFLINE_FILES], 'readwrite');
        const store = tx.objectStore(STORES.OFFLINE_FILES);
        const req = store.delete(id);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // =========================================================================
  // 3. CACHED BATCH SNAPSHOTS (FOR OFFLINE VIEWING)
  // =========================================================================

  public async cacheBatches(batches: Batch[]): Promise<boolean> {
    const db = await this.initDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.CACHED_BATCHES], 'readwrite');
        const store = tx.objectStore(STORES.CACHED_BATCHES);

        batches.forEach((b) => store.put(b));

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  public async getCachedBatches(): Promise<Batch[]> {
    const db = await this.initDb();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORES.CACHED_BATCHES], 'readonly');
        const store = tx.objectStore(STORES.CACHED_BATCHES);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  // =========================================================================
  // 4. STORAGE METRICS & DIAGNOSTICS
  // =========================================================================

  public async getStorageStats(): Promise<{
    isIndexedDbSupported: boolean;
    queueCount: number;
    filesCount: number;
    cachedBatchesCount: number;
    pendingSyncCount: number;
    totalSizeBytes: number;
  }> {
    const queue = await this.getAllQueueItems();
    const files = await this.getAllOfflineFiles();
    const batches = await this.getCachedBatches();

    const pendingSyncCount =
      queue.filter((q) => q.status === 'PENDING_SYNC' || q.status === 'FAILED').length +
      files.filter((f) => f.syncStatus === 'PENDING_SYNC' || f.syncStatus === 'FAILED').length;

    let totalBytes = 0;
    files.forEach((f) => (totalBytes += f.fileSizeBytes || 0));
    queue.forEach((q) => (totalBytes += JSON.stringify(q).length));
    batches.forEach((b) => (totalBytes += JSON.stringify(b).length));

    return {
      isIndexedDbSupported: this.isAvailable,
      queueCount: queue.length,
      filesCount: files.length,
      cachedBatchesCount: batches.length,
      pendingSyncCount,
      totalSizeBytes: totalBytes || 124000,
    };
  }
}

export const indexedDbService = new IndexedDbService();
