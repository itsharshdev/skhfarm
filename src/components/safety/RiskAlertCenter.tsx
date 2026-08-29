import React, { useState, useEffect } from 'react';
import { SafetyRiskAlert, AISeverity, Batch, AppUser } from '../../types';
import { aiService } from '../../services/aiService';
import { traceService } from '../../services/traceService';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  ArrowRight,
  Shield,
  Eye,
  RefreshCw,
  Flame,
  FileCheck,
} from 'lucide-react';

interface RiskAlertCenterProps {
  currentUser?: AppUser;
  onSelectBatch?: (batchId: string) => void;
}

export const RiskAlertCenter: React.FC<RiskAlertCenterProps> = ({ currentUser, onSelectBatch }) => {
  const [alerts, setAlerts] = useState<SafetyRiskAlert[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Recall / Quarantine Action Modal
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [recallReason, setRecallReason] = useState('Organophosphate pesticide residue screen above MRL threshold.');
  const [recallSeverity, setRecallSeverity] = useState<AISeverity>('CRITICAL');
  const [recallAction, setRecallAction] = useState('Quarantine entire lot at Nashik Yard 2. Lock downstream distribution.');
  const [isSubmittingRecall, setIsSubmittingRecall] = useState(false);

  // Resolution modal
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState<SafetyRiskAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribeAI = aiService.subscribe(() => {
      loadData();
    });
    const unsubscribeTrace = (traceService as any).subscribe?.(() => {
      loadData();
    });
    return () => {
      unsubscribeAI();
      if (unsubscribeTrace) unsubscribeTrace();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAlerts, allBatches] = await Promise.all([
        aiService.getAllSafetyAlerts(),
        traceService.getAllBatches(),
      ]);
      setAlerts(allAlerts);
      setBatches(allBatches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    setIsSubmittingRecall(true);

    try {
      const targetBatch = batches.find((b) => b.batchId === selectedBatchId);
      const inspectorName = currentUser ? currentUser.name : 'State Safety Inspector';

      // 1. Update batch in trace service as Authority
      await traceService.verifyBatchAsAuthority(
        selectedBatchId,
        inspectorName,
        'REJECTED',
        `EMERGENCY REGULATORY LOT RECALL: ${recallReason}. Directive: ${recallAction}`,
        recallSeverity === 'CRITICAL' ? 'CRITICAL' : recallSeverity === 'HIGH' ? 'MEDIUM' : 'LOW'
      );

      // 2. Create alert in AI Service
      await aiService.createAlert({
        batchId: selectedBatchId,
        productName: targetBatch ? targetBatch.productName : `Batch ${selectedBatchId}`,
        severity: recallSeverity,
        statusType: 'CONTAMINATION_FLAG',
        title: `Regulatory Lot Recall: ${selectedBatchId}`,
        description: recallReason,
        detectedBy: inspectorName,
        affectedLocations: [targetBatch?.currentLocation || 'Distribution Network'],
        downstreamBatchesAffected: targetBatch?.childBatchIds || ['Downstream Lineage Lots Locked'],
      });

      setIsRecallModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Recall creation failed', err);
    } finally {
      setIsSubmittingRecall(false);
    }
  };

  const handleResolveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForResolve) return;
    try {
      await aiService.resolveAlert(
        selectedAlertForResolve.id,
        resolutionNotes || 'Verified compliant after secondary laboratory culture re-test.'
      );
      setSelectedAlertForResolve(null);
      setResolutionNotes('');
      loadData();
    } catch (err) {
      console.error('Resolution failed', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.batchId.toLowerCase().includes(q) ||
      a.productName.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q)
    );
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length;
  const mediumCount = alerts.filter((a) => a.severity === 'MEDIUM' && !a.resolved).length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  return (
    <div
      id="safety-risk-alert-center"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6 animate-fadeIn"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
            </span>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Food Safety & Cold-Chain Quarantine Engine
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Safety Risk Center & Recall Protocols
          </h3>
          <p className="text-xs text-slate-500">
            Automated contamination flags, temperature excursions, and downstream lineage quarantine controls.
          </p>
        </div>

        {/* Issue Recall Button */}
        <button
          id="open-recall-modal-btn"
          onClick={() => {
            if (batches.length > 0 && !selectedBatchId) {
              setSelectedBatchId(batches[0].batchId);
            }
            setIsRecallModalOpen(true);
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Enact Regulatory Recall / Quarantine</span>
        </button>
      </div>

      {/* KPI Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Active Critical Alerts
            </span>
            <span className="text-2xl font-extrabold font-mono text-rose-900">{criticalCount}</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-500 opacity-75" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Moderate Excursions
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-900">{mediumCount}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 opacity-75" />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Resolved & Cleared
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-900">{resolvedCount}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-75" />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search risk alerts by Batch ID or Product..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'CRITICAL', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            id={`alert-card-${alert.id}`}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              alert.resolved
                ? 'bg-slate-50/60 border-slate-200/80 opacity-75'
                : alert.severity === 'CRITICAL'
                ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                : 'bg-amber-50/60 border-amber-300'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {alert.batchId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    alert.resolved
                      ? 'bg-emerald-100 text-emerald-800'
                      : alert.severity === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {alert.resolved ? 'RESOLVED' : `${alert.severity} SEVERITY`}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {alert.productName}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

              {alert.resolved && alert.resolutionNotes && (
                <div className="p-2 bg-emerald-100/60 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Resolution Record:</strong> {alert.resolutionNotes}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 font-mono">
                <span>Inspector: <strong className="text-slate-700">{alert.detectedBy}</strong></span>
                <span>Detected: {new Date(alert.detectedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              {onSelectBatch && (
                <button
                  type="button"
                  onClick={() => onSelectBatch(alert.batchId)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Batch</span>
                </button>
              )}

              {!alert.resolved && (
                <button
                  type="button"
                  onClick={() => setSelectedAlertForResolve(alert)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve Alert</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recall / Quarantine Action Modal */}
      {isRecallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/80">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-200 text-rose-900">
                  <ShieldAlert className="w-5 h-5 text-rose-700" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Enact Regulatory Lot Recall</h3>
                  <p className="text-xs text-slate-500">Lock batch & propagate downstream quarantine</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecallModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecall} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Target Batch Lot ID</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {batches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      {b.batchId} — {b.productName} ({b.origin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Quarantine Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setRecallSeverity(sev)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        recallSeverity === sev
                          ? 'bg-rose-100 text-rose-900 border-rose-400 ring-1 ring-rose-400/30'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Laboratory / Inspection Reason</label>
                <textarea
                  rows={2}
                  required
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  placeholder="e.g. Synthetic residue detected exceeding certified limits."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Enforcement Directive</label>
                <textarea
                  rows={2}
                  required
                  value={recallAction}
                  onChange={(e) => setRecallAction(e.target.value)}
                  placeholder="e.g. Quarantine lot at Nashik Yard 2. Lock downstream distribution."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Lineage Impact:</strong> This action instantly reduces the batch integrity score by 35 points and displays emergency recall banners to all consumer scans.
              </div>

              <button
                type="submit"
                disabled={isSubmittingRecall}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isSubmittingRecall ? 'Broadcasting Recall Order...' : 'Enforce Quarantine & Lock Batch'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Alert Modal */}
      {selectedAlertForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Resolve Safety Alert</h3>
              </div>
              <button
                onClick={() => setSelectedAlertForResolve(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveAlert} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Confirm re-inspection compliance for <strong>{selectedAlertForResolve.batchId}</strong>.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Resolution Observations</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Follow-up lab screen confirmed zero toxic residue. Storage setpoint restored."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                Clear Alert & Restore Safe Status
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
