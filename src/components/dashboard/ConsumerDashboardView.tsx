import React, { useState } from 'react';
import { User, Batch } from '../../types';
import { useAuthRole } from '../../context/AuthRoleContext';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import { StakeholderFeedbackHub } from '../operations/StakeholderFeedbackHub';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  History,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Layers,
  ArrowRight,
  Search,
  ExternalLink,
  MessageSquare,
  Wheat,
  Apple,
  Award,
  Plus,
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../trace/DemoScenarioBar';

interface ConsumerDashboardViewProps {
  user: User;
  onSelectBatch: (batchId: string) => void;
}

export const ConsumerDashboardView: React.FC<ConsumerDashboardViewProps> = ({
  user,
  onSelectBatch,
}) => {
  const { setScannerOpen } = useAuthRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackBatchId, setFeedbackBatchId] = useState<string | null>(null);

  const recentScans = [
    {
      batchId: 'BIS-2026-092',
      productName: 'Organic Whole Wheat Digestive Biscuits',
      date: 'Today, 10:45 AM',
      score: 92,
      status: 'VERIFIED_SAFE',
      farmer: 'Ramesh Patil (Kopargaon)',
      facility: 'MahaAgro Solar Cool Unit #04',
    },
    {
      batchId: 'ORG-APL-2026-044',
      productName: 'Himachal Royal Delicious Apples',
      date: 'Yesterday, 4:20 PM',
      score: 97,
      status: 'VERIFIED_SAFE',
      farmer: 'Sunil Verma (Kotkhai)',
      facility: 'Shimla Solar Vault #12',
    },
    {
      batchId: 'APL-KSH-109',
      productName: 'Kashmir Red Delicious (Quarantine Lot)',
      date: 'Aug 27, 2026',
      score: 26,
      status: 'RECALLED_FLAGGED',
      farmer: 'Tariq Lone (Shopian)',
      facility: 'Quarantine Bay #3',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Consumer Welcome Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              CONSUMER PORTAL
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100-Point Public Verification Enabled
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user.name}
          </h1>

          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Verify where your food came from, inspect real-time solar storage conditions, review lab purity certificates, and leave feedback directly on the producer ledger.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => setFeedbackBatchId('BIS-2026-092')}
            className="w-full sm:w-auto px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs md:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Rate a Product / Farmer</span>
          </button>

          <button
            onClick={() => setScannerOpen(true)}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs md:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Product QR</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for Consumer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scanned Verifications
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">14</span>
            <span className="text-xs font-bold text-emerald-700">100% Traceable</span>
          </div>
          <p className="text-[11px] text-slate-500">All scanned items verified against open ledger.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Trace Score
            </span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">94.8</span>
            <span className="text-xs font-bold text-slate-500">/100</span>
          </div>
          <p className="text-[11px] text-slate-500">High provenance, safe solar cold storage.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Solar Clean Storage
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sun className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">100%</span>
            <span className="text-xs font-bold text-amber-700">Solar Monitored</span>
          </div>
          <p className="text-[11px] text-slate-500">Zero food spoilage from farm to fork.</p>
        </div>
      </div>

      {/* Featured Test Scenarios Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Explore Demo Produce Lineages
            </h3>
            <p className="text-xs text-slate-500">
              Click any scenario to see interactive DAG lineage, solar storage telemetry, and multi-parent ingredient merges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {DEMO_SCENARIOS.slice(0, 6).map((sc) => (
            <div
              key={sc.id}
              onClick={() => onSelectBatch(sc.batchId)}
              className="cursor-pointer p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all space-y-2.5 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  {sc.icon}
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {sc.score}/100
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {sc.label}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {sc.subLabel}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">{sc.batchId}</span>
                <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                  Open Trace <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scan History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Your Recent Scans</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">3 Saved Sessions</span>
        </div>

        <div className="space-y-3">
          {recentScans.map((scan) => (
            <div
              key={scan.batchId}
              onClick={() => onSelectBatch(scan.batchId)}
              className="cursor-pointer p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {scan.batchId}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{scan.date}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{scan.productName}</h4>
                <div className="text-xs text-slate-500">
                  <span>Farmer: {scan.farmer}</span> · <span>Storage: {scan.facility}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded-xl ${
                    scan.score >= 90
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {scan.score}/100 Score
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFeedbackBatchId(scan.batchId);
                  }}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  title="Rate Farmer & Product Quality"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rate</span>
                </button>

                <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 text-xs font-bold text-slate-700 rounded-xl transition-colors cursor-pointer">
                  View DAG
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Consumer Appreciation & Reviews Hub */}
      <StakeholderFeedbackHub
        user={user}
        role="CONSUMER"
        onSelectBatch={onSelectBatch}
      />

      {feedbackBatchId && (
        <UnifiedFeedbackModal
          isOpen={!!feedbackBatchId}
          onClose={() => setFeedbackBatchId(null)}
          initialBatchId={feedbackBatchId}
          fromRole="CONSUMER"
          targetRole="FARMER"
          targetEntityName="Farmer & Producer Origin"
          submittedBy={user.name}
        />
      )}
    </div>
  );
};
