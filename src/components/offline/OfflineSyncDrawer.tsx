import React, { useState, useEffect } from 'react';
import { OfflineSyncQueueItem, OfflineFileRecord } from '../../types';
import { offlineSyncService } from '../../services/offlineSyncService';
import { indexedDbService } from '../../services/indexedDbService';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
  Database,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  FileText,
  Camera,
  Video,
  Layers,
  Sparkles,
  HardDrive,
  Check,
  Plus,
  Info,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface OfflineSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncDrawer: React.FC<OfflineSyncDrawerProps> = ({ isOpen, onClose }) => {
  const [queue, setQueue] = useState<OfflineSyncQueueItem[]>([]);
  const [offlineFiles, setOfflineFiles] = useState<OfflineFileRecord[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'files' | 'diagnostics'>('events');
  const [storageStats, setStorageStats] = useState<any>(null);
  const [previewingFile, setPreviewingFile] = useState<OfflineFileRecord | null>(null);

  useEffect(() => {
    loadState();
    const unsubscribe = offlineSyncService.subscribe(() => {
      loadState();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const loadState = async () => {
    setQueue(offlineSyncService.getQueue());
    setOfflineFiles(offlineSyncService.getOfflineFiles());
    setIsOffline(offlineSyncService.isOffline());

    try {
      const stats = await indexedDbService.getStorageStats();
      setStorageStats(stats);
    } catch (e) {}
  };

  const handleToggleOffline = () => {
    const newState = offlineSyncService.toggleSimulatedOffline();
    setIsOffline(newState);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await offlineSyncService.syncAll();
      setSyncResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      loadState();
    }
  };

  const handleRemoveItem = async (id: string) => {
    await offlineSyncService.removeQueueItem(id);
  };

  const handleRemoveFile = async (id: string) => {
    await offlineSyncService.removeOfflineFile(id);
  };

  const handleClearSynced = async () => {
    await offlineSyncService.clearSynced();
  };

  const handleAddSampleOfflineEvent = async () => {
    const sampleEvent = {
      batchId: 'WHT-MH-2026-001',
      eventType: 'STORED' as any,
      actor: 'Ganesh Kute (Cold Vault Operator)',
      actorRole: 'WAREHOUSE' as any,
      location: 'Shirdi Solar Smart Storage Hub',
      quantity: '120 QUINTAL',
      notes: `SKH030 Solar storage vault telemetry logged during grid power outage. Vault condition: 18.2°C (Solar battery 94%).`,
      evidencePreviewUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    };
    await offlineSyncService.addOfflineEvent(sampleEvent);
    setActiveTab('events');
  };

  const handleAddSampleOfflinePhoto = async () => {
    const samplePhotos = [
      { url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', name: 'harvest_grain_quality_proof.jpg' },
      { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', name: 'solar_vault_telemetry_hud.png' },
      { url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80', name: 'mandi_weighbridge_slip.jpg' },
    ];
    const chosen = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    const uniqueSuffix = Date.now().toString().slice(-4);
    const fileName = `${chosen.name.replace(/\.[^/.]+$/, '')}_${uniqueSuffix}.jpg`;

    await offlineSyncService.saveOfflineFile({
      batchId: 'WHT-MH-2026-001',
      fileName,
      fileType: 'PHOTO',
      fileSizeBytes: 420000,
      dataUrl: chosen.url,
      capturedBy: 'Ramesh Patil (Field Custodian)',
      captureLocation: 'Kopargaon Field Plot 4B (Offline Zone)',
      tamperProofHash: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    });
    setActiveTab('files');
  };

  if (!isOpen) return null;

  const pendingEventsCount = queue.filter((q) => q.status === 'PENDING_SYNC' || q.status === 'FAILED').length;
  const pendingFilesCount = offlineFiles.filter((f) => f.syncStatus === 'PENDING_SYNC' || f.syncStatus === 'FAILED').length;
  const totalPending = pendingEventsCount + pendingFilesCount;

  return (
    <div
      id="offline-sync-drawer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-drawer-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl text-white shadow-2xs ${
                isOffline ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="offline-drawer-title" className="font-bold text-slate-900 text-base font-['Space_Grotesk',sans-serif]">
                  IndexedDB Local Offline Storage & Sync Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-200">
                  IndexedDB Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Resilient local storage for rural farm sheds & power outage scenarios
              </p>
            </div>
          </div>
          <button
            id="close-offline-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex gap-4 bg-white">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transactions Queue ({queue.length})</span>
            {pendingEventsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                {pendingEventsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Offline Files & Proofs ({offlineFiles.length})</span>
            {pendingFilesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                {pendingFilesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>IndexedDB Diagnostics</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-190px)]">
          {/* Simulated Offline Mode Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Simulate Field Network Outage (Offline Mode)
              </span>
              <span className="text-[11px] text-slate-500 block">
                Toggle network state to test storing transactions and media files in IndexedDB before synchronization
              </span>
            </div>

            <button
              id="toggle-offline-simulation-btn"
              onClick={handleToggleOffline}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOffline ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sync Result Feedback Banner */}
          {syncResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Synchronized {syncResult.success} offline events & files to active chain ledger.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: TRANSACTIONS & EVENTS QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'events' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Queued Transactions ({queue.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSampleOfflineEvent}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Test Event</span>
                  </button>
                  <button
                    onClick={handleClearSynced}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Clear Synced
                  </button>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <Database className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">IndexedDB Queue is empty</p>
                  <p className="text-[11px] text-slate-400">All local records are synchronized with live chain.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all text-xs space-y-3 ${
                        item.status === 'SYNCED'
                          ? 'bg-slate-50/70 border-slate-200/80 opacity-85'
                          : item.status === 'SYNCING'
                          ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30'
                          : 'bg-white border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {item.batchId}
                          </span>
                          <span className="font-bold text-slate-700 uppercase">{item.eventType}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'SYNCED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : item.status === 'SYNCING'
                                ? 'bg-blue-100 text-blue-800 animate-pulse border border-blue-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold'
                            }`}
                          >
                            {item.status === 'SYNCED'
                              ? 'SYNCED (Live Chain)'
                              : item.status === 'SYNCING'
                              ? 'SYNCING...'
                              : 'PENDING_SYNC (IndexedDB)'}
                          </span>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed">{item.notes}</p>

                      {/* Attached Photo Preview */}
                      {item.evidencePreviewUrl && (
                        <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                          <img
                            src={item.evidencePreviewUrl}
                            alt="Attached Proof"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="text-[11px] text-slate-600">
                            <span className="font-bold text-slate-800 block">📷 Attached Offline Photo Proof</span>
                            <span className="text-[10px] text-slate-400 font-mono">Stored in IndexedDB local storage</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 font-mono">
                        <span>Actor: {item.actor}</span>
                        <span>Recorded: {new Date(item.createdOfflineAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: OFFLINE FILES & PROOFS */}
          {/* ========================================================================= */}
          {activeTab === 'files' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Offline Evidence Media ({offlineFiles.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSampleOfflinePhoto}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Test Photo</span>
                  </button>
                  <button
                    onClick={handleClearSynced}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Clear Synced
                  </button>
                </div>
              </div>

              {offlineFiles.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No offline files stored</p>
                  <p className="text-[11px] text-slate-400">Captured evidence photos and videos will be saved in IndexedDB.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offlineFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`p-4 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        file.syncStatus === 'SYNCED'
                          ? 'bg-slate-50/70 border-slate-200/80 opacity-85'
                          : file.syncStatus === 'SYNCING'
                          ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30'
                          : 'bg-white border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Clickable Image Thumbnail */}
                        <div
                          onClick={() => setPreviewingFile(file)}
                          className="relative cursor-pointer group shrink-0"
                          title="Click to Enlarge Photo"
                        >
                          <img
                            src={file.dataUrl}
                            alt={file.fileName}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        {/* File Details with Full Name & Hash */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4
                              onClick={() => setPreviewingFile(file)}
                              className="font-bold text-slate-900 text-xs hover:text-emerald-700 cursor-pointer break-all"
                            >
                              {file.fileName}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                              ~{(file.fileSizeBytes / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Batch: {file.batchId}
                            </span>
                            <span className="text-slate-500">
                              {file.capturedBy}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-full" title={file.tamperProofHash}>
                            {file.tamperProofHash}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            file.syncStatus === 'SYNCED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : file.syncStatus === 'SYNCING'
                              ? 'bg-blue-100 text-blue-800 animate-pulse border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold'
                          }`}
                        >
                          {file.syncStatus === 'SYNCED'
                            ? 'SYNCED'
                            : file.syncStatus === 'SYNCING'
                            ? 'SYNCING...'
                            : 'PENDING_SYNC (IndexedDB)'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewingFile(file)}
                            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                            title="Preview photo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-[10px]">View</span>
                          </button>

                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                            title="Delete file from IndexedDB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: INDEXED-DB DIAGNOSTICS */}
          {/* ========================================================================= */}
          {activeTab === 'diagnostics' && storageStats && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">
                  Local IndexedDB Database Metrics
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Queued Events</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{storageStats.queueCount}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Offline Files</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{storageStats.filesCount}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Pending Sync Total</span>
                    <span className="text-lg font-bold font-mono text-amber-600">{totalPending}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Estimated Storage</span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {(storageStats.totalSizeBytes / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Engine Status</span>
                    <span className="text-xs font-bold text-emerald-700">HTML5 IndexedDB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Total Pending: </span>
            <strong className="text-amber-700 font-mono font-bold text-sm">{totalPending} assets</strong>
          </div>

          <button
            id="sync-all-offline-btn"
            onClick={handleSyncAll}
            disabled={isSyncing || totalPending === 0 || isOffline}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing All...' : isOffline ? 'Cannot Sync Offline' : 'Sync All Pending to Chain'}</span>
          </button>
        </div>
      </div>

      {/* Full Photo Preview Modal */}
      {previewingFile && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewingFile(null)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 text-white rounded-3xl p-5 space-y-4 border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white break-all">{previewingFile.fileName}</h4>
                <span className="text-[11px] text-slate-400">Batch {previewingFile.batchId} · {(previewingFile.fileSizeBytes / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={() => setPreviewingFile(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img
              src={previewingFile.dataUrl}
              alt={previewingFile.fileName}
              className="w-full max-h-80 object-cover rounded-2xl border border-slate-800"
            />

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Engine:</span>
                <span className="text-emerald-400 font-bold">HTML5 IndexedDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sync Status:</span>
                <span className="text-amber-400 font-bold">{previewingFile.syncStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Captured By:</span>
                <span className="text-slate-300">{previewingFile.capturedBy}</span>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 break-all">
                {previewingFile.tamperProofHash}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
