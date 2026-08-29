import React, { useState } from 'react';
import { Batch, LineageNode } from '../../types';
import { ScoreRing } from '../common/ScoreRing';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import {
  Calendar,
  MapPin,
  User,
  Building,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitFork,
  Map,
  Clock,
  Award,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Camera,
  ChevronRight,
  Send,
  Star,
  Info,
  ShieldAlert,
  Flame,
  Sun,
} from 'lucide-react';
import { DEMO_LINEAGE_NODES, DEMO_LINEAGE_LINKS } from '../../data/mockData';
import { traceService } from '../../services/traceService';
import { DemoScenarioBar } from './DemoScenarioBar';
import { LineageDAGGraph } from './LineageDAGGraph';
import { CurrentStorageConditionCard } from './CurrentStorageConditionCard';
import { MultiParentLineageCard } from './MultiParentLineageCard';
import { SupplyChainRouteMap } from './SupplyChainRouteMap';
import { EventTimelineView } from './EventTimelineView';
import { BatchDetailDrawer } from './BatchDetailDrawer';
import { AIInsightsPanel } from '../ai/AIInsightsPanel';

interface PublicTraceViewProps {
  batch: Batch;
  onSelectBatch?: (batchId: string) => void;
}

export const PublicTraceView: React.FC<PublicTraceViewProps> = ({
  batch,
  onSelectBatch,
}) => {
  const { t } = useLanguage();
  const { setScannerOpen } = useAuthRole();
  const [activeTab, setActiveTab] = useState<'lineage' | 'timeline' | 'ai' | 'map' | 'certificates' | 'feedback'>('lineage');

  // Selected node for slide-over drawer
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Consumer Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState<'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TRACEABILITY' | 'OVERALL'>('OVERALL');
  const [feedbackScore, setFeedbackScore] = useState(92);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await traceService.submitConsumerFeedback(batch.batchId, {
      category: feedbackCategory,
      score: feedbackScore,
      comment: feedbackComment || 'Consumer verification confirmed via public QR scan.',
      submittedBy: 'Public Consumer (Verified QR)',
    });
    setFeedbackSubmitted(true);
    setFeedbackComment('');
    setTimeout(() => setFeedbackSubmitted(false), 4000);
  };

  const handleNodeClick = (nodeId: string, nodeBatchId?: string) => {
    const foundNode = DEMO_LINEAGE_NODES.find((n) => n.id === nodeId) || null;
    setSelectedNode(foundNode);
    setIsDrawerOpen(true);
  };

  const isMultiParent = batch.batchId === 'BIS-2026-092';
  const isContaminated = !!batch.contaminationFlag?.flagged || batch.status === 'RECALLED';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Top Quick Switcher for Test Scenarios */}
      <DemoScenarioBar
        currentBatchId={batch.batchId}
        onSelectBatch={(bId) => {
          if (onSelectBatch) onSelectBatch(bId);
        }}
      />

      {/* 2. Critical Contamination / Recall Alert Banner if applicable */}
      {isContaminated && (
        <div
          id="critical-contamination-banner"
          className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-500/80 shadow-md text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-subtle"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-rose-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 text-xs font-black uppercase tracking-wider">
                  Critical Contamination Alert
                </span>
                <span className="text-xs font-mono text-rose-700 font-bold">
                  Penalty: -30 Pts Applied
                </span>
              </div>
              <h3 className="text-base font-bold text-rose-900">
                {batch.contaminationFlag?.reason || 'Lot recalled due to laboratory non-compliance.'}
              </h3>
              <p className="text-xs text-rose-700">
                {batch.contaminationFlag?.actionRequired || 'Enforced by State Food Safety Authority. Do not distribute or consume.'}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                setSelectedNode(null);
                setIsDrawerOpen(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Inspect Lab Quarantine</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Product Hero Header Card */}
      <div
        id="product-trace-header-card"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                BATCH #{batch.batchId}
              </span>
              <StatusBadge status={batch.status} size="sm" />
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {batch.events.length} Verified Handoffs
              </span>
              {isMultiParent && (
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  Multi-Parent Recipe (Wheat + Sugar + Dairy)
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {batch.productName}
            </h1>

            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {batch.variety ? `${batch.variety} · ` : ''}
              {batch.category}. Harvested and monitored through end-to-end solar storage, quality grading, and certified transformation.
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Origin Location</span>
                <span className="font-semibold text-slate-800 mt-0.5 line-clamp-1">{batch.origin}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Primary Farmer/FPO</span>
                <span className="font-semibold text-slate-800 mt-0.5 line-clamp-1">{batch.originFarmerName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Current Custodian</span>
                <span className="font-semibold text-slate-800 mt-0.5 line-clamp-1">{batch.currentOwner}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Best Before / Expiry</span>
                <span className="font-semibold text-slate-800 mt-0.5">{new Date(batch.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* QR Code & Scan Trigger */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Product QR</span>
                <span className="font-mono text-xs font-bold text-slate-800">{batch.batchId}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Tamper-Proof Trace</span>
              </div>
            </div>

            <button
              onClick={() => setScannerOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan Item QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Two Main Pillars: 100-Point Score + Super-PS Solar Cold Storage Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pillar 1: 100-Point Trace & Quality Score */}
        <div className="lg:col-span-5">
          <ScoreRing scoreBreakdown={batch.scoreBreakdown} />
        </div>

        {/* Pillar 2: "Is it safe right now?" Solar Storage Monitor */}
        <div className="lg:col-span-7">
          <CurrentStorageConditionCard
            storageCondition={batch.currentStorage}
            storageUnit={batch.storageUnit}
            productCategory={batch.category}
          />
        </div>
      </div>

      {/* 5. Multi-Parent Raw Ingredient Provenance (for multi-ingredient batches) */}
      {isMultiParent && (
        <MultiParentLineageCard
          currentBatchId={batch.batchId}
          onSelectBatch={(bId) => {
            if (onSelectBatch) onSelectBatch(bId);
          }}
        />
      )}

      {/* 6. Deep-Dive Section: Tab Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Complete End-to-End Verification
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
              “Where has this batch been?”
            </h2>
          </div>

          {/* Tab Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              id="tab-btn-lineage"
              onClick={() => setActiveTab('lineage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'lineage'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Interactive DAG</span>
            </button>

            <button
              id="tab-btn-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline ({batch.events.length})</span>
            </button>

            <button
              id="tab-btn-ai"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Guard & Predictions</span>
            </button>

            <button
              id="tab-btn-map"
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Route Corridor</span>
            </button>

            <button
              id="tab-btn-certificates"
              onClick={() => setActiveTab('certificates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'certificates'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificates ({batch.certificates.length})</span>
            </button>

            <button
              id="tab-btn-feedback"
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'feedback'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reviews ({batch.feedbacks.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE LINEAGE DAG */}
        {activeTab === 'lineage' && (
          <LineageDAGGraph
            batch={batch}
            selectedNodeId={selectedNode?.id}
            onSelectNode={(nodeId, nodeBatchId) => handleNodeClick(nodeId, nodeBatchId)}
            onSelectBatch={(bId) => {
              if (onSelectBatch) onSelectBatch(bId);
            }}
          />
        )}

        {/* TAB 2: CHRONOLOGICAL TIMELINE */}
        {activeTab === 'timeline' && (
          <EventTimelineView
            batch={batch}
            selectedEventId={selectedEventId}
            onSelectEvent={(eId) => {
              setSelectedEventId(eId);
              const ev = batch.events.find((e) => e.eventId === eId);
              if (ev) {
                // Open drawer with event details
                setIsDrawerOpen(true);
              }
            }}
          />
        )}

        {/* TAB 2.5: AI INSIGHTS & ANOMALY GUARD */}
        {activeTab === 'ai' && (
          <AIInsightsPanel
            batchId={batch.batchId}
            productName={batch.productName}
          />
        )}

        {/* TAB 3: SUPPLY CHAIN ROUTE CORRIDOR MAP */}
        {activeTab === 'map' && (
          <SupplyChainRouteMap
            batch={batch}
            onSelectWaypoint={(idx, name) => {
              // Synchronize waypoint selection
            }}
          />
        )}

        {/* TAB 4: CERTIFICATES & LAB AUDITS */}
        {activeTab === 'certificates' && (
          <div id="certificates-tab-content" className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batch.certificates.map((cert) => (
                <div
                  key={cert.certificateId}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:bg-white transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <Award className="w-5 h-5" />
                    </div>
                    <StatusBadge status={cert.verificationStatus} size="sm" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cert.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{cert.issuer}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1 font-mono">
                    <div>Ref: {cert.documentRef}</div>
                    <div>Valid Until: {cert.expiryDate}</div>
                  </div>

                  <div className="text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded font-medium">
                    Prototype Verification Seal · Non-Regulatory Demo
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONSUMER FEEDBACK & REVIEWS */}
        {activeTab === 'feedback' && (
          <div id="feedback-tab-content" className="space-y-6 animate-fadeIn">
            {/* Reviews List */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Stakeholder & Consumer Review Trail
              </h4>
              <div className="space-y-3">
                {batch.feedbacks.map((fb) => (
                  <div
                    key={fb.feedbackId}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {fb.submittedBy} ({fb.fromRole} → {fb.toRole})
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-xs">
                        {fb.score}/100 Score
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Category: {fb.category} · {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-slate-700 leading-relaxed pt-1">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Feedback Form */}
            <form onSubmit={handleFeedbackSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Submit Direct Consumer Feedback</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Feedback Category
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e: any) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="OVERALL">Overall Trace Transparency</option>
                    <option value="QUALITY">Product Freshness & Taste</option>
                    <option value="PACKAGING">Packaging Condition & QR Clarity</option>
                    <option value="CONDITION">Storage Condition Integrity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Integrity Rating ({feedbackScore} / 100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={feedbackScore}
                    onChange={(e) => setFeedbackScore(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Comments / Observations
                </label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share feedback on packaging seals, QR clarity, product freshness..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {feedbackSubmitted && (
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Feedback recorded locally and added to batch review ledger!</span>
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit 100-Point Feedback</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 7. Slide-over Batch / Node Detail Drawer */}
      <BatchDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        batch={batch}
        selectedNode={selectedNode}
        onSelectBatch={(bId) => {
          if (onSelectBatch) onSelectBatch(bId);
        }}
      />
    </div>
  );
};
