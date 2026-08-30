import React, { useState, useEffect } from 'react';
import { AppUser, Batch, FeedbackRecord, StakeholderRole } from '../../types';
import { traceService } from '../../services/traceService';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import {
  Star,
  MessageSquare,
  Award,
  Tractor,
  Store,
  Warehouse,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  Sparkles,
  Plus,
  Mic,
  ChevronRight,
  TrendingUp,
  Filter,
  Layers,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';

interface FarmerFeedbackHubProps {
  user: AppUser;
  batches: Batch[];
  onSelectBatch?: (batchId: string) => void;
}

export const FarmerFeedbackHub: React.FC<FarmerFeedbackHubProps> = ({ user, batches, onSelectBatch }) => {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [feedbacksReceived, setFeedbacksReceived] = useState<FeedbackRecord[]>([]);
  const [feedbacksGiven, setFeedbacksGiven] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetRole, setModalTargetRole] = useState<StakeholderRole>('MANDI');
  const [modalTargetEntity, setModalTargetEntity] = useState('Kopargaon APMC Mandi');
  const [modalBatchId, setModalBatchId] = useState(batches[0]?.batchId || 'BIS-2026-092');

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await traceService.getFeedbacksForRole('FARMER', user.name);
      setFeedbacksReceived(data.received);
      setFeedbacksGiven(data.given);
    } catch (e) {
      console.error('Farmer feedback load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
    const unsubscribe = traceService.subscribe(() => {
      loadFeedbacks();
    });
    return () => {
      unsubscribe();
    };
  }, [user.name]);

  const openFeedbackModal = (targetRole: StakeholderRole, targetEntity: string, batchId?: string) => {
    setModalTargetRole(targetRole);
    setModalTargetEntity(targetEntity);
    if (batchId) setModalBatchId(batchId);
    setIsModalOpen(true);
  };

  // Calculate statistics
  const totalReceived = feedbacksReceived.length;
  const avgReceivedScore =
    totalReceived > 0
      ? Math.round(feedbacksReceived.reduce((acc, f) => acc + f.score, 0) / totalReceived)
      : 96;
  const avgStars = Math.round((avgReceivedScore / 100) * 5 * 10) / 10;
  const positiveCount = feedbacksReceived.filter((f) => f.score >= 80).length;
  const positiveRate = totalReceived > 0 ? Math.round((positiveCount / totalReceived) * 100) : 100;

  const getRoleIcon = (role: StakeholderRole) => {
    switch (role) {
      case 'MANDI':
        return <Store className="w-4 h-4 text-teal-600" />;
      case 'WAREHOUSE':
        return <Warehouse className="w-4 h-4 text-blue-600" />;
      case 'TRANSPORTER':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'PROCESSOR':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'CONSUMER':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Tractor className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div
      id="farmer-feedback-hub"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6 animate-fadeIn"
    >
      {/* Top Banner: Farmer Voice & Reputation Link */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 rounded-2xl p-6 text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>FARMER VOICE & REPUTATION PLATFORM</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Producer Feedback & Stakeholder Trust Ledger
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Transparent two-way rating: Review your Mandi weighments, MSP settlements, and Cold Storage providers, while building your verified buyer reputation with each harvest.
            </p>
          </div>

          <button
            onClick={() => openFeedbackModal('MANDI', 'Kopargaon APMC Mandi')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Rate a Buyer / Mandi</span>
          </button>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Buyer Rating</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-white">{avgStars}</span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-slate-300">({avgReceivedScore}/100 Score)</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <span className="text-[10px] text-teal-300 uppercase font-bold block">Reviews Received</span>
            <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">{totalReceived}</span>
            <span className="text-[10px] text-slate-300">{positiveRate}% Positive Trust</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <span className="text-[10px] text-blue-300 uppercase font-bold block">My Feedback Given</span>
            <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">{feedbacksGiven.length}</span>
            <span className="text-[10px] text-slate-300">Mandi & Cold Hubs</span>
          </div>

          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Market Priority</span>
            <span className="text-xl font-extrabold font-mono text-emerald-200 mt-0.5 block">TIER-1</span>
            <span className="text-[10px] text-emerald-300">Top Auction Rank</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts for Farmers */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>One-Tap Rating Presets for Farmers</span>
          </span>
          <span className="text-[11px] text-slate-500">Fast 100-Point Audit</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => openFeedbackModal('MANDI', 'Kopargaon APMC Mandi')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Store className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">APMC</span>
            </div>
            <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">Rate Mandi Buyer</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Weighment & MSP Cash</span>
          </button>

          <button
            onClick={() => openFeedbackModal('WAREHOUSE', 'MahaAgro Solar Cool Vault #04')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Warehouse className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">Storage</span>
            </div>
            <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">Rate Cold Storage</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Solar Temperature Stability</span>
          </button>

          <button
            onClick={() => openFeedbackModal('TRANSPORTER', 'Kisan Express Reefer Logistics')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Truck className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">Logistics</span>
            </div>
            <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">Rate Transporter</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">On-time Gate Pickup</span>
          </button>

          <button
            onClick={() => openFeedbackModal('PROCESSOR', 'Maharashtra Flour Mills Ltd')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">Processor</span>
            </div>
            <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">Rate Mill Buyer</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Direct Contract Settlement</span>
          </button>
        </div>
      </div>

      {/* Tabs: Received by Farmer vs Given by Farmer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              Reviews Received by Me ({feedbacksReceived.length})
            </button>

            <button
              onClick={() => setActiveTab('given')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'given'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              Farmer Voice & Ratings Given ({feedbacksGiven.length})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {activeTab === 'received' ? 'Incoming Buyer Praise' : 'My Partner Evaluations'}
          </span>
        </div>

        {/* Tab 1: Received by Farmer */}
        {activeTab === 'received' && (
          <div className="space-y-3">
            {feedbacksReceived.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No reviews received yet.</p>
                <p className="text-[11px] text-slate-400">Buyers will submit quality ratings upon harvest lot handoff.</p>
              </div>
            ) : (
              feedbacksReceived.map((fb) => (
                <div
                  key={fb.feedbackId}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/80">
                        {getRoleIcon(fb.fromRole)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{fb.submittedBy}</span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase font-mono">
                            {fb.fromRole} Buyer
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Batch {fb.batchId} · Category: {fb.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              (fb.ratingStars || Math.round((fb.score / 100) * 5)) >= s
                                ? 'fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border ${
                          fb.score >= 90
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : fb.score >= 70
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {fb.score}/100 Pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    "{fb.comment}"
                  </p>

                  {/* Tags */}
                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fb.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
                    <span>Recorded: {new Date(fb.createdAt).toLocaleString()}</span>
                    {onSelectBatch && (
                      <button
                        onClick={() => onSelectBatch(fb.batchId)}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Batch DAG</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Given by Farmer */}
        {activeTab === 'given' && (
          <div className="space-y-3">
            {feedbacksGiven.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <Tractor className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">You have not submitted any stakeholder evaluations yet.</p>
                <button
                  onClick={() => openFeedbackModal('MANDI', 'Kopargaon APMC Mandi')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 cursor-pointer inline-flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rate Your First Mandi or Buyer</span>
                </button>
              </div>
            ) : (
              feedbacksGiven.map((fb) => (
                <div
                  key={fb.feedbackId}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        {getRoleIcon(fb.toRole)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {fb.targetEntityName || `${fb.toRole} Partner`}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase font-mono">
                            Target: {fb.toRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Batch {fb.batchId} · Category: {fb.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                        My Rating: {fb.score}/100 Pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    "{fb.comment}"
                  </p>

                  {/* Tags */}
                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fb.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
                    <span>Submitted on {new Date(fb.createdAt).toLocaleString()}</span>
                    <span className="text-emerald-700 font-bold">Stored in Supabase feedbacks & audit_logs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Embedded Modal Trigger for Farmer */}
      <UnifiedFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialBatchId={modalBatchId}
        fromRole="FARMER"
        submittedBy={user.name}
        targetRole={modalTargetRole}
        targetEntityName={modalTargetEntity}
        onFeedbackSubmitted={() => {
          loadFeedbacks();
        }}
      />
    </div>
  );
};
