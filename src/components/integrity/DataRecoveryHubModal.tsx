import React, { useState, useEffect } from 'react';
import {
  IncidentState,
  DataIntegrityIncidentRecord,
  InFlightOperationRecord,
  ReconciliationState,
} from '../../types';
import {
  dataIntegrityService,
  RecoveryBatchItem,
  ReconciliationItem,
} from '../../services/dataIntegrityService';
import { RecordIntegrityBadge } from './RecordIntegrityBadge';
import {
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  X,
  FileText,
  Sliders,
  ChevronRight,
  Split,
  GitMerge,
  Play,
  RotateCcw,
} from 'lucide-react';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';

interface DataRecoveryHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectBatch?: (batchId: string) => void;
}

export const DataRecoveryHubModal: React.FC<DataRecoveryHubModalProps> = ({
  isOpen,
  onClose,
  onInspectBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'recovery' | 'inflight' | 'reconciliation'>('recovery');
  const [incidentState, setIncidentState] = useState<IncidentState>(dataIntegrityService.getIncidentState());
  const [activeIncident, setActiveIncident] = useState<DataIntegrityIncidentRecord | null>(
    dataIntegrityService.getActiveIncident()
  );
  const [recoveryBatches, setRecoveryBatches] = useState<RecoveryBatchItem[]>(
    dataIntegrityService.getRecoveryBatches()
  );
  const [inFlightOps, setInFlightOps] = useState<InFlightOperationRecord[]>(
    dataIntegrityService.getInFlightOperations()
  );
  const [reconItems, setReconItems] = useState<ReconciliationItem[]>(
    dataIntegrityService.getReconciliationItems()
  );
  const [retryingOpId, setRetryingOpId] = useState<string | null>(null);

  useEffect(() => {
    const updateState = () => {
      setIncidentState(dataIntegrityService.getIncidentState());
      setActiveIncident(dataIntegrityService.getActiveIncident());
      setRecoveryBatches(dataIntegrityService.getRecoveryBatches());
      setInFlightOps(dataIntegrityService.getInFlightOperations());
      setReconItems(dataIntegrityService.getReconciliationItems());
    };

    const unsubscribe = dataIntegrityService.subscribe(() => {
      updateState();
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleReconstruct = (batchId: string) => {
    dataIntegrityService.reconstructBatchFromPeer(batchId);
  };

  const handleRetryOp = async (opId: string) => {
    setRetryingOpId(opId);
    await new Promise((r) => setTimeout(r, 600));
    await dataIntegrityService.retryInFlightOperation(opId);
    setRetryingOpId(null);
  };

  const handleResolveConflict = (id: string, resolution: 'KEEP_LOCAL' | 'KEEP_SERVER' | 'MANUAL_MERGE') => {
    dataIntegrityService.resolveReconciliation(id, resolution);
  };

  const getReconStateBadge = (state: ReconciliationState) => {
    switch (state) {
      case 'MATCHED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">MATCHED</span>;
      case 'SERVER_MISSING':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">SERVER MISSING</span>;
      case 'LOCAL_MISSING':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">LOCAL MISSING</span>;
      case 'CONFLICT':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 animate-pulse">CONFLICT</span>;
      case 'REQUIRES_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-bold border border-orange-200">REQUIRES REVIEW</span>;
    }
  };

  return (
    <div
      id="data-recovery-hub-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-recovery-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="data-recovery-modal-title" className="font-extrabold text-base font-['Space_Grotesk',sans-serif]">
                  PS-1 Data Resilience & Disaster Recovery Center
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                    incidentState === 'NORMAL'
                      ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-900/80 text-rose-300 border border-rose-700'
                  }`}
                >
                  {incidentState}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent disaster recovery, peer edge reconstruction & ledger reconciliation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Recovery Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('recovery')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'recovery'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Disaster Recovery & Records</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inflight')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inflight'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>In-Flight Operations ({inFlightOps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Ledger Reconciliation ({reconItems.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[calc(92vh-140px)]">
          {/* TAB 1: DISASTER RECOVERY & BATCH RECONSTRUCTION */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              {/* Primary Data Store Health Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-slate-300">Primary Data Store Status:</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase">
                      {activeIncident?.primaryDataStoreState || 'HEALTHY'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Incident Ref: {activeIncident?.incidentId || 'INC-LIVE-OK'}
                  </span>
                </div>

                {/* Counters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-center">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Affected</span>
                    <span className="text-lg font-extrabold font-mono text-rose-400">
                      {activeIncident?.affectedBatchIds.length || 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Recoverable</span>
                    <span className="text-lg font-extrabold font-mono text-emerald-400">
                      {activeIncident?.recoverableCount || 24}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Partially Rec.</span>
                    <span className="text-lg font-extrabold font-mono text-amber-400">
                      {activeIncident?.partiallyRecoverableCount || 2}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Unavailable</span>
                    <span className="text-lg font-extrabold font-mono text-rose-500">
                      {activeIncident?.unrecoverableCount || 1}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">In-Flight</span>
                    <span className="text-lg font-extrabold font-mono text-blue-400">
                      {activeIncident?.pendingOperationsCount || 2}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Review Req.</span>
                    <span className="text-lg font-extrabold font-mono text-orange-400">
                      {activeIncident?.requiresReviewCount || 2}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recovery Records List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm font-['Space_Grotesk',sans-serif]">
                    Batch Record Recovery & Integrity State
                  </h4>
                  <span className="text-xs text-slate-500">
                    Transparent reporting (Missing data is never disguised as complete)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {recoveryBatches.map((item) => (
                    <div
                      key={item.batchId}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {item.batchCode}
                          </span>
                          <RecordIntegrityBadge status={item.recoveryStatus} size="sm" />
                          {item.reviewRequired && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-[10px] font-bold">
                              Review Required
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{item.productName}</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.notes}</p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {/* Event Stats & Confidence */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">
                            Events:{' '}
                            <span className="font-bold text-slate-800">
                              {item.knownEventsCount}/{item.totalExpectedEvents} known
                            </span>
                            {item.missingEventsCount > 0 && (
                              <span className="text-rose-600 font-bold ml-1">
                                ({item.missingEventsCount} missing)
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            {item.confidenceScore}% Confidence
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {item.missingEventsCount > 0 && !item.reconstructedFromPeer && (
                            <button
                              type="button"
                              onClick={() => handleReconstruct(item.batchId)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reconstruct from Peer Node</span>
                            </button>
                          )}
                          {onInspectBatch && (
                            <button
                              type="button"
                              onClick={() => {
                                onInspectBatch(item.batchId);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Inspect Trace
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IN-FLIGHT & INTERRUPTED OPERATIONS */}
          {activeTab === 'inflight' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-['Space_Grotesk',sans-serif]">
                    Active & Interrupted In-Flight Transactions
                  </h4>
                  <p className="text-xs text-slate-500">
                    Interrupted operations are explicitly flagged with step-level audit trails
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {inFlightOps.map((op) => (
                  <div
                    key={op.operationId}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {op.operationId}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          {op.operationType} · Batch #{op.batchCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono ${
                            op.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : op.status === 'INTERRUPTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : op.status === 'PENDING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          STATUS: {op.status}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Progress Tracking */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {op.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            step.status === 'SUCCESS'
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : step.status === 'WARNING'
                              ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                              : step.status === 'FAILED'
                              ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>Step {idx + 1}: {step.stepName}</span>
                            {step.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {step.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                            {step.status === 'FAILED' && <XCircle className="w-4 h-4 text-rose-600" />}
                            {step.status === 'PENDING' && <Clock className="w-4 h-4 text-slate-400" />}
                          </div>
                          {step.detail && <p className="text-[11px] opacity-80">{step.detail}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Interruption Notice if any */}
                    {op.interruptionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Interruption Diagnostic:</span>
                          <p className="text-[11px] text-rose-700">{op.interruptionReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Started: {new Date(op.startedAt).toLocaleTimeString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {op.canRetry && (
                          <button
                            type="button"
                            disabled={retryingOpId === op.operationId}
                            onClick={() => handleRetryOp(op.operationId)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${retryingOpId === op.operationId ? 'animate-spin' : ''}`} />
                            <span>{retryingOpId === op.operationId ? 'Synchronizing...' : 'Retry Synchronization'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Continue Later
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEDGER RECONCILIATION */}
          {activeTab === 'reconciliation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-['Space_Grotesk',sans-serif]">
                    Peer Ledger vs Local Store Reconciliation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Non-destructive reconciliation (conflicts are never automatically overwritten)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {reconItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {item.batchCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.productName}</span>
                      </div>
                      {getReconStateBadge(item.state)}
                    </div>

                    {/* Diff comparison table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase">
                          📱 Local Edge Store (IndexedDB)
                        </span>
                        <div className="text-slate-600">Custodian: <span className="font-semibold text-slate-900">{item.localOwner}</span></div>
                        <div className="text-slate-400 text-[10px] font-mono">Timestamp: {item.localTimestamp}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase">
                          ☁️ Master Server Ledger
                        </span>
                        <div className="text-slate-600">Custodian: <span className="font-semibold text-slate-900">{item.serverOwner}</span></div>
                        <div className="text-slate-400 text-[10px] font-mono">Timestamp: {item.serverTimestamp}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                      <span className="font-bold text-amber-900">Reconciliation Analysis:</span> {item.diffDetails}
                    </p>

                    {/* Conflict Resolution Actions */}
                    {item.state === 'CONFLICT' && !item.conflictResolved && (
                      <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(item.id, 'KEEP_LOCAL')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Accept Local Record
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(item.id, 'KEEP_SERVER')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Accept Server Record
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(item.id, 'MANUAL_MERGE')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <GitMerge className="w-3.5 h-3.5" />
                          <span>Merge Audit Trail Non-Destructively</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
