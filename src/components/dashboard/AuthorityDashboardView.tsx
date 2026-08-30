import React, { useState, useEffect } from 'react';
import { Batch, AppUser, VerificationState } from '../../types';
import { traceService } from '../../services/traceService';
import { alertService } from '../../services/alertService';
import { StatusBadge } from '../common/StatusBadge';
import { RiskAlertCenter } from '../safety/RiskAlertCenter';
import { DataRecoveryHubModal } from '../integrity/DataRecoveryHubModal';
import { StakeholderFeedbackHub } from '../operations/StakeholderFeedbackHub';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Sparkles,
  RefreshCw,
  BellRing,
  Layers,
  Database,
} from 'lucide-react';

interface AuthorityDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const AuthorityDashboardView: React.FC<AuthorityDashboardViewProps> = ({
  user,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'ALL' | 'VERIFIED' | 'FLAGGED' | 'RECALLED'>('ALL');
  const [activeAuthorityTab, setActiveAuthorityTab] = useState<'batches' | 'risk_center'>('batches');
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Audit Modal
  const [auditBatch, setAuditBatch] = useState<Batch | null>(null);
  const [auditDecision, setAuditDecision] = useState<VerificationState>('VERIFIED');
  const [auditNotes, setAuditNotes] = useState('');
  const [contaminationSeverity, setContaminationSeverity] = useState<'LOW' | 'MEDIUM' | 'CRITICAL'>('MEDIUM');
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    loadData();
    const unsubscribe = (traceService as any).subscribe?.(() => {
      loadData();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await traceService.getAllBatches();
      setBatches(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditBatch) return;
    setIsAuditing(true);
    try {
      const notes = auditNotes || `Official Regulatory Audit executed by ${user.name}. Marked as ${auditDecision}.`;
      await traceService.verifyBatchAsAuthority(
        auditBatch.batchId,
        user.name,
        auditDecision,
        notes,
        contaminationSeverity
      );

      if (auditDecision === 'REJECTED') {
        await alertService.createRecall({
          batchCode: auditBatch.batchId,
          productName: auditBatch.productName,
          quantity: `${auditBatch.quantity} ${auditBatch.unit}`,
          reason: notes,
          severity: contaminationSeverity,
          initiatedByName: user.name,
          initiatedByRole: 'AUTHORITY',
          actionRequired: 'Quarantine and immediate retail recall enforcement.',
        });
      } else if (auditDecision === 'FLAGGED') {
        await alertService.createAlert({
          targetRole: 'RETAILER',
          batchCode: auditBatch.batchId,
          type: 'CONTAMINATION',
          severity: contaminationSeverity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          title: `Inspection Flag: ${auditBatch.productName}`,
          message: `Batch ${auditBatch.batchId} flagged during regulatory audit. ${notes}`,
        });
      }

      setAuditBatch(null);
      setAuditNotes('');
      loadData();
    } catch (err) {
      console.error('Audit submit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (filterState === 'VERIFIED' && b.contaminationFlag?.flagged) return false;
    if (filterState === 'FLAGGED' && (!b.contaminationFlag?.flagged || b.status === 'RECALLED')) return false;
    if (filterState === 'RECALLED' && b.status !== 'RECALLED') return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.batchId.toLowerCase().includes(q) ||
      b.productName.toLowerCase().includes(q) ||
      b.origin.toLowerCase().includes(q) ||
      b.currentOwner.toLowerCase().includes(q)
    );
  });

  const flaggedCount = batches.filter((b) => b.contaminationFlag?.flagged && b.status !== 'RECALLED').length;
  const recalledCount = batches.filter((b) => b.status === 'RECALLED').length;
  const compliantCount = batches.filter((b) => !b.contaminationFlag?.flagged && b.status !== 'RECALLED').length;

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Authority Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>State Food Safety & Ag-Compliance Inspectorate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Regulatory Audit & Safety Oversight
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Inspector: {user.name} · Department of Agriculture & Food Safety. Audit provenance evidence, verify laboratory parameters, flag anomalies, and enforce containment protocols.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Compliant</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">{compliantCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-center min-w-[100px]">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">Flagged</span>
              <span className="text-xl font-extrabold font-mono text-amber-300">{flaggedCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-center min-w-[100px]">
              <span className="text-[10px] text-rose-300 uppercase font-bold block">Recalled</span>
              <span className="text-xl font-extrabold font-mono text-rose-300">{recalledCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Switcher: Batches Audit vs Risk Alert Center */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAuthorityTab('batches')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeAuthorityTab === 'batches'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Batches Oversight ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveAuthorityTab('risk_center')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeAuthorityTab === 'risk_center'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Safety Risk Center & Recall Protocols</span>
        </button>

        <button
          onClick={() => setIsRecoveryModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-xs ml-auto cursor-pointer"
        >
          <Database className="w-4 h-4 text-blue-200" />
          <span>Data Resilience & Recovery Audit</span>
        </button>
      </div>

      {activeAuthorityTab === 'risk_center' ? (
        <RiskAlertCenter currentUser={user} onSelectBatch={onSelectBatch} />
      ) : (
        /* Filter & Search Bar */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Batch ID, Product, Origin..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'VERIFIED', 'FLAGGED', 'RECALLED'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterState(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterState === f
                    ? 'bg-white text-indigo-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Batches Table */}
        <div className="space-y-3">
          {filteredBatches.map((batch) => (
            <div
              key={batch.batchId}
              id={`authority-row-${batch.batchId}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                batch.status === 'RECALLED'
                  ? 'bg-rose-50/70 border-rose-300'
                  : batch.contaminationFlag?.flagged
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white border-slate-200/90 hover:border-indigo-400'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {batch.batchId}
                  </span>
                  <StatusBadge status={batch.status} size="sm" />
                  {batch.contaminationFlag?.flagged && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 rounded text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>{batch.contaminationFlag.severity} SEVERITY FLAG</span>
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelectBatch(batch.batchId)}
                  className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer"
                >
                  {batch.productName}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Origin: <strong className="text-slate-700">{batch.origin}</strong></span>
                  <span>Custodian: <strong className="text-slate-700">{batch.currentOwner}</strong></span>
                  <span>Score: <strong className="text-slate-900 font-mono">{batch.scoreBreakdown.totalScore}/100</strong></span>
                  <span>Evidence Proofs: <strong className="text-slate-700">{batch.evidences.length}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectBatch(batch.batchId)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Trace</span>
                </button>

                <button
                  id={`audit-btn-${batch.batchId}`}
                  type="button"
                  onClick={() => {
                    setAuditBatch(batch);
                    setAuditDecision(batch.contaminationFlag?.flagged ? 'REJECTED' : 'VERIFIED');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Audit / Flag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Regulatory Stakeholder Feedback & Audit Hub */}
      <StakeholderFeedbackHub
        user={user}
        role="AUTHORITY"
        batches={batches}
        onSelectBatch={onSelectBatch}
      />

      {/* Audit Decision Modal */}
      {auditBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-100 text-indigo-800">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Regulatory Batch Audit (SKH029)</h3>
                  <p className="text-xs text-slate-500 font-mono">{auditBatch.batchId}</p>
                </div>
              </div>
              <button
                onClick={() => setAuditBatch(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Inspection Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuditDecision('VERIFIED')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      auditDecision === 'VERIFIED'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VERIFIED</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditDecision('FLAGGED')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      auditDecision === 'FLAGGED'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500/30'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>FLAGGED</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditDecision('REJECTED')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      auditDecision === 'REJECTED'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500/30'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>RECALL LOT</span>
                  </button>
                </div>
              </div>

              {auditDecision !== 'VERIFIED' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Severity Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'CRITICAL'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setContaminationSeverity(sev)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          contaminationSeverity === sev
                            ? 'bg-rose-100 text-rose-900 border-rose-400'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Audit Observations & Regulatory Directives</label>
                <textarea
                  rows={3}
                  required
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="e.g. Lab residue screening passed pesticide threshold. Cold chain unbroken."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <button
                id="submit-authority-audit-btn"
                type="submit"
                disabled={isAuditing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAuditing ? 'Publishing Audit Decision...' : 'Commit Regulatory Audit Record'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <DataRecoveryHubModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onInspectBatch={onSelectBatch}
      />
    </div>
  );
};
