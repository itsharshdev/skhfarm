import React, { useState } from 'react';
import { Batch, LineageNode, SupplyChainEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreRing } from '../common/ScoreRing';
import {
  X,
  ShieldCheck,
  Thermometer,
  Sun,
  Award,
  MessageSquare,
  Camera,
  ExternalLink,
  ChevronRight,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  Layers,
  FileText,
  BatteryCharging,
} from 'lucide-react';

interface BatchDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  selectedNode?: LineageNode | null;
  onSelectBatch?: (batchId: string) => void;
}

export const BatchDetailDrawer: React.FC<BatchDetailDrawerProps> = ({
  isOpen,
  onClose,
  batch,
  selectedNode,
  onSelectBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'provenance' | 'telemetry' | 'score' | 'evidence' | 'feedback' | 'certificates'>('provenance');

  if (!isOpen) return null;

  const nodeOrBatchTitle = selectedNode?.title || batch.productName;
  const nodeOrBatchId = selectedNode?.batchId || batch.batchId;
  const nodeOrBatchScore = selectedNode?.score || batch.scoreBreakdown.totalScore;
  const nodeOrBatchActor = selectedNode?.actor || batch.originFarmerName;
  const nodeOrBatchLocation = selectedNode?.location || batch.origin;
  const isContaminated = !!batch.contaminationFlag?.flagged || selectedNode?.riskFlag === 'CRITICAL_CONTAMINATION';

  return (
    <div
      id="batch-detail-slideover-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                LOT #{nodeOrBatchId}
              </span>
              <StatusBadge status={batch.status} size="sm" />
              {isContaminated && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/40">
                  RECALL PROTOCOL ACTIVE
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {nodeOrBatchTitle}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {nodeOrBatchActor}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {nodeOrBatchLocation}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
              <span className="font-mono text-lg font-extrabold text-emerald-400">
                {nodeOrBatchScore}/100
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Tabs Header */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('provenance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'provenance'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Provenance & Info
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'telemetry'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Solar & Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('score')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'score'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            100-Pt Breakdown
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'evidence'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidence ({batch.evidences.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'feedback'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Feedback ({batch.feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'certificates'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Certificates ({batch.certificates.length})
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROVENANCE */}
          {activeTab === 'provenance' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Product Category</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{batch.category}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Variety / Formulation</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{batch.variety || 'Standard Verified'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Batch Quantity</span>
                  <span className="font-bold text-slate-800 mt-0.5 block font-mono">{batch.quantity} {batch.unit}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Expiry Date</span>
                  <span className="font-bold text-slate-800 mt-0.5 block font-mono">{new Date(batch.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Node Notes */}
              {selectedNode?.notes && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 block">
                    Node Stage Notes
                  </span>
                  <p className="leading-relaxed">{selectedNode.notes}</p>
                </div>
              )}

              {/* Parent & Child Lineages */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Upstream Parent Ingredients
                </h4>
                {batch.parentBatchIds.length > 0 ? (
                  <div className="space-y-2">
                    {batch.parentBatchIds.map((pid) => (
                      <div
                        key={pid}
                        onClick={() => onSelectBatch && onSelectBatch(pid)}
                        className="cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/90 hover:border-emerald-300 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <GitFork className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-bold text-slate-800">{pid}</span>
                        </div>
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          Inspect Trace <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Primary root harvest lot (Origin farm level).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-sm">Solar Micro-Climate Metrics</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    SAFE CONDITIONS
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Temperature</span>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {selectedNode?.storageTelemetry?.temperature ?? batch.currentStorage?.temperature ?? 18.2}°C
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Humidity</span>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {selectedNode?.storageTelemetry?.humidity ?? batch.currentStorage?.humidity ?? 54}% RH
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Solar Power</span>
                    <span className="font-mono text-xl font-extrabold text-amber-400">
                      4.15 kW
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono">
                  <div>Battery Reserve: 94% (Grid-Free Clean Storage)</div>
                  <div>Sensor Node: SIMULATED_SKH030_MICRO_NODE</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCORE BREAKDOWN */}
          {activeTab === 'score' && (
            <div className="space-y-4 animate-fadeIn">
              <ScoreRing scoreBreakdown={batch.scoreBreakdown} />
            </div>
          )}

          {/* TAB 4: EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batch.evidences.map((ev) => (
                  <div
                    key={ev.evidenceId}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2"
                  >
                    <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden">
                      <img
                        src={ev.previewUrl}
                        alt="Evidence proof"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-800">{ev.capturedBy}</div>
                      <div className="text-slate-500 text-[11px]">{ev.captureLocation}</div>
                      {ev.metadata?.tamperProofHash && (
                        <div className="font-mono text-[9px] text-slate-400 truncate">
                          SHA: {ev.metadata.tamperProofHash}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-3 animate-fadeIn">
              {batch.feedbacks.map((fb) => (
                <div
                  key={fb.feedbackId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{fb.submittedBy}</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                      {fb.score}/100
                    </span>
                  </div>
                  <p className="text-slate-700 pt-1">{fb.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-3 animate-fadeIn">
              {batch.certificates.map((cert) => (
                <div
                  key={cert.certificateId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{cert.title}</span>
                    <StatusBadge status={cert.verificationStatus} size="sm" />
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Issuer: {cert.issuer} · Ref: {cert.documentRef}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {selectedNode?.batchId && selectedNode.batchId !== batch.batchId ? (
            <button
              onClick={() => {
                if (onSelectBatch) onSelectBatch(selectedNode.batchId);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Switch Full Trace To This Batch</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-mono">
              Batch: {nodeOrBatchId}
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
