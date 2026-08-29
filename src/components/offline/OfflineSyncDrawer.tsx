import React, { useState, useEffect } from 'react';
import { OfflineSyncQueueItem } from '../../types';
import { offlineSyncService } from '../../services/offlineSyncService';
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
} from 'lucide-react';

interface OfflineSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncDrawer: React.FC<OfflineSyncDrawerProps> = ({ isOpen, onClose }) => {
  const [queue, setQueue] = useState<OfflineSyncQueueItem[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    loadState();
    const unsubscribe = offlineSyncService.subscribe(() => {
      loadState();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const loadState = () => {
    setQueue(offlineSyncService.getQueue());
    setIsOffline(offlineSyncService.isOffline());
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
    }
  };

  const handleRemoveItem = (id: string) => {
    offlineSyncService.removeQueueItem(id);
  };

  const handleClearSynced = () => {
    offlineSyncService.clearSynced();
  };

  if (!isOpen) return null;

  const pendingCount = queue.filter((q) => q.status === 'PENDING_SYNC' || q.status === 'FAILED').length;
  const syncedCount = queue.filter((q) => q.status === 'SYNCED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl text-white ${
                isOffline ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Offline-First PWA Sync Engine</h3>
              <p className="text-xs text-slate-500">
                Local-first indexed state for low-connectivity farm environments
              </p>
            </div>
          </div>
          <button
            id="close-offline-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Simulated Offline Mode Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Simulate Field Offline Mode
              </span>
              <span className="text-[11px] text-slate-500 block">
                Toggle network state simulation to test offline record capture and sync queue
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
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Workflow Diagram */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Offline-First Architectural Flow
            </span>
            <div className="flex items-center justify-between text-center gap-1 font-mono text-[11px]">
              <div className="p-1.5 bg-slate-800 rounded-lg flex-1">
                <span className="text-amber-400 font-bold block">1. Offline</span>
                <span className="text-[9px] text-slate-400">Capture Proof</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="p-1.5 bg-slate-800 rounded-lg flex-1">
                <span className="text-blue-400 font-bold block">2. Local Save</span>
                <span className="text-[9px] text-slate-400">LocalStorage</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="p-1.5 bg-slate-800 rounded-lg flex-1">
                <span className="text-purple-400 font-bold block">3. Pending</span>
                <span className="text-[9px] text-slate-400">Queued</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="p-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-lg flex-1">
                <span className="text-emerald-300 font-bold block">4. Sync</span>
                <span className="text-[9px] text-emerald-400">Ledger Merge</span>
              </div>
            </div>
          </div>

          {/* Sync Result Banner */}
          {syncResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Synchronized {syncResult.success} events successfully to active traceability ledger.
                </span>
              </div>
            </div>
          )}

          {/* Queue Header & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pending Sync Queue ({pendingCount})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {syncedCount > 0 && (
                <button
                  onClick={handleClearSynced}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Clear Synced
                </button>
              )}

              <button
                id="sync-all-offline-btn"
                onClick={handleSyncAll}
                disabled={isSyncing || pendingCount === 0 || isOffline}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Queue...' : isOffline ? 'Cannot Sync Offline' : 'Sync All Pending'}</span>
              </button>
            </div>
          </div>

          {/* Queue Items */}
          {queue.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
              <Database className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Offline queue is empty</p>
              <p className="text-[11px] text-slate-400">All local records are synchronized.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                    item.status === 'SYNCED'
                      ? 'bg-slate-50/60 border-slate-200/80 opacity-75'
                      : item.status === 'SYNCING'
                      ? 'bg-blue-50/80 border-blue-300'
                      : 'bg-white border-amber-200/90 shadow-2xs'
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'SYNCED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'SYNCING'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'SYNCED'
                          ? 'Synchronized'
                          : item.status === 'SYNCING'
                          ? 'Syncing...'
                          : 'Pending Local Storage'}
                      </span>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete queue item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs">{item.notes}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
                    <span>Actor: {item.actor} ({item.actorRole})</span>
                    <span>Created: {new Date(item.createdOfflineAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
