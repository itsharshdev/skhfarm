import React, { useState, useEffect } from 'react';
import { AppUser, Batch, FeedbackRecord, StakeholderRole } from '../../types';
import { traceService } from '../../services/traceService';
import { UnifiedFeedbackModal } from './UnifiedFeedbackModal';
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
  Building2,
  Factory,
  ShoppingBag,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

interface StakeholderFeedbackHubProps {
  user: AppUser | { name: string; role: StakeholderRole; organizationName?: string; location?: string };
  role: StakeholderRole;
  batches?: Batch[];
  onSelectBatch?: (batchId: string) => void;
}

export const StakeholderFeedbackHub: React.FC<StakeholderFeedbackHubProps> = ({
  user,
  role,
  batches = [],
  onSelectBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [feedbacksReceived, setFeedbacksReceived] = useState<FeedbackRecord[]>([]);
  const [feedbacksGiven, setFeedbacksGiven] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetRole, setModalTargetRole] = useState<StakeholderRole>('MANDI');
  const [modalTargetEntity, setModalTargetEntity] = useState('Partner Facility');
  const [modalBatchId, setModalBatchId] = useState(batches[0]?.batchId || 'BIS-2026-092');

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await traceService.getFeedbacksForRole(role, user.name);
      setFeedbacksReceived(data.received);
      setFeedbacksGiven(data.given);
    } catch (e) {
      console.error('Stakeholder feedback load error:', e);
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
  }, [user.name, role]);

  const openFeedbackModal = (targetRole: StakeholderRole, targetEntity: string, batchId?: string) => {
    setModalTargetRole(targetRole);
    setModalTargetEntity(targetEntity);
    if (batchId) setModalBatchId(batchId);
    else if (batches[0]) setModalBatchId(batches[0].batchId);
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
  const positiveRate = totalReceived > 0 ? Math.round((positiveCount / totalReceived) * 100) : 98;

  const getRoleIcon = (r: StakeholderRole) => {
    switch (r) {
      case 'FARMER':
        return <Tractor className="w-4 h-4 text-emerald-600" />;
      case 'MANDI':
        return <Store className="w-4 h-4 text-teal-600" />;
      case 'WAREHOUSE':
        return <Warehouse className="w-4 h-4 text-blue-600" />;
      case 'PROCESSOR':
      case 'FACTORY':
      case 'MANUFACTURER':
        return <Factory className="w-4 h-4 text-purple-600" />;
      case 'TRANSPORTER':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'RETAILER':
        return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      case 'CONSUMER':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'AUTHORITY':
        return <ShieldAlert className="w-4 h-4 text-indigo-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getRoleTheme = () => {
    switch (role) {
      case 'FARMER':
        return {
          bannerGrad: 'from-emerald-950 via-teal-950 to-slate-950',
          accentBadge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
          title: 'Farmer Voice & Reputation Trust Ledger',
          desc: 'Transparent two-way rating: Review your Mandi weighments, MSP settlements, and Cold Storage providers, while building your verified buyer reputation.',
          actionBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          presets: [
            { targetRole: 'MANDI' as StakeholderRole, name: 'Kopargaon APMC Mandi', label: 'Rate Mandi Weighment & MSP', icon: Store },
            { targetRole: 'WAREHOUSE' as StakeholderRole, name: 'MahaAgro Solar Vault #04', label: 'Rate Cold Storage Preservation', icon: Warehouse },
            { targetRole: 'TRANSPORTER' as StakeholderRole, name: 'Reefer Fleet #MH-17', label: 'Rate Transport Carrier', icon: Truck },
            { targetRole: 'PROCESSOR' as StakeholderRole, name: 'Sahyadri Bio-Milling Hub', label: 'Rate Mill Buyer Settlement', icon: Factory },
          ],
        };
      case 'MANDI':
        return {
          bannerGrad: 'from-teal-950 via-slate-900 to-slate-950',
          accentBadge: 'bg-teal-500/20 border-teal-500/30 text-teal-300',
          title: 'Mandi Quality Grading & Trade Reputation Ledger',
          desc: 'Evaluate incoming harvest lot cleanliness, moisture calibrations, and carrier turnaround to maintain APMC trade credibility.',
          actionBtn: 'bg-teal-600 hover:bg-teal-500 text-white',
          presets: [
            { targetRole: 'FARMER' as StakeholderRole, name: 'Farmer Producer Lots', label: 'Rate Farmer Harvest Quality', icon: Tractor },
            { targetRole: 'WAREHOUSE' as StakeholderRole, name: 'Solar Cold Storage Vault', label: 'Rate Storage Vault Intake', icon: Warehouse },
            { targetRole: 'TRANSPORTER' as StakeholderRole, name: 'Logistics Fleet', label: 'Rate Reefer Dispatch Speed', icon: Truck },
          ],
        };
      case 'WAREHOUSE':
        return {
          bannerGrad: 'from-blue-950 via-slate-900 to-slate-950',
          accentBadge: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
          title: 'Solar Cold Storage & Transit Integrity Review Hub',
          desc: 'Rate incoming carrier temperatures and container seals while sharing thermal holding compliance with processors and mandis.',
          actionBtn: 'bg-blue-600 hover:bg-blue-500 text-white',
          presets: [
            { targetRole: 'TRANSPORTER' as StakeholderRole, name: 'Inbound Reefer Carrier', label: 'Rate Carrier Temperature Custody', icon: Truck },
            { targetRole: 'MANDI' as StakeholderRole, name: 'Mandi Sourcing Yard', label: 'Rate Mandi Moisture & Pre-cool', icon: Store },
            { targetRole: 'PROCESSOR' as StakeholderRole, name: 'Processing Mill', label: 'Rate Mill Outflow Handoff', icon: Factory },
          ],
        };
      case 'PROCESSOR':
      case 'FACTORY':
      case 'MANUFACTURER':
        return {
          bannerGrad: 'from-indigo-950 via-slate-900 to-slate-950',
          accentBadge: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
          title: 'Milling, Processing & Supplier Quality Review Hub',
          desc: 'Score raw grain purity and farmer origin standards, and review distributor transit handling for packaged shelf batches.',
          actionBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          presets: [
            { targetRole: 'FARMER' as StakeholderRole, name: 'Farmer Producer', label: 'Rate Raw Harvest Purity', icon: Tractor },
            { targetRole: 'MANDI' as StakeholderRole, name: 'APMC Aggregator', label: 'Rate Mandi Lot Sorting', icon: Store },
            { targetRole: 'RETAILER' as StakeholderRole, name: 'Retail Chain Partner', label: 'Rate Retail Shelf Distribution', icon: ShoppingBag },
          ],
        };
      case 'TRANSPORTER':
        return {
          bannerGrad: 'from-amber-950 via-slate-900 to-slate-950',
          accentBadge: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
          title: 'Cold-Chain Transit & Gate Turnaround Ratings',
          desc: 'Rate loading gate efficiency at farms and mandis, and log cold storage intake handoff turnaround.',
          actionBtn: 'bg-amber-600 hover:bg-amber-500 text-white',
          presets: [
            { targetRole: 'WAREHOUSE' as StakeholderRole, name: 'Solar Storage Terminal', label: 'Rate Cold Storage Dock Speed', icon: Warehouse },
            { targetRole: 'MANDI' as StakeholderRole, name: 'APMC Mandi Gate', label: 'Rate Loading Bay Turnaround', icon: Store },
            { targetRole: 'FARMER' as StakeholderRole, name: 'Farm Gate Depot', label: 'Rate Farm Gate Packaging Prep', icon: Tractor },
          ],
        };
      case 'RETAILER':
        return {
          bannerGrad: 'from-rose-950 via-slate-900 to-slate-950',
          accentBadge: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
          title: 'Retail Shelf & Supplier Freshness Trust Ledger',
          desc: 'Review processor packaging condition, QR code scan clarity, and cold storage integrity for shoppers.',
          actionBtn: 'bg-rose-600 hover:bg-rose-500 text-white',
          presets: [
            { targetRole: 'PROCESSOR' as StakeholderRole, name: 'Packaged Brand Processor', label: 'Rate Packaging & Expiry Integrity', icon: Factory },
            { targetRole: 'WAREHOUSE' as StakeholderRole, name: 'Regional Cold Hub', label: 'Rate Cold-Chain Freshness', icon: Warehouse },
            { targetRole: 'FARMER' as StakeholderRole, name: 'Direct Farm Producer', label: 'Rate Direct Farmer Quality', icon: Tractor },
          ],
        };
      case 'CONSUMER':
        return {
          bannerGrad: 'from-emerald-950 via-slate-900 to-slate-950',
          accentBadge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
          title: 'Direct Consumer Appreciation & Produce Ratings',
          desc: 'Rate produce taste, freshness, and organic authenticity directly to the farmers who grew it.',
          actionBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          presets: [
            { targetRole: 'FARMER' as StakeholderRole, name: 'Origin Farm Producer', label: 'Rate Farmer Freshness & Taste', icon: Tractor },
            { targetRole: 'RETAILER' as StakeholderRole, name: 'Storefront Shelf', label: 'Rate Retail Display & QR Clarity', icon: ShoppingBag },
          ],
        };
      default:
        return {
          bannerGrad: 'from-slate-900 via-slate-950 to-emerald-950',
          accentBadge: 'bg-slate-500/20 border-slate-500/30 text-slate-300',
          title: 'Platform Stakeholder Feedback & Audit Ledger',
          desc: 'Monitor cross-role evaluations, dispute logs, and reputation ratings stored on the immutable ledger.',
          actionBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
          presets: [
            { targetRole: 'FARMER' as StakeholderRole, name: 'Farmer Producer', label: 'Submit Farmer Quality Audit', icon: Tractor },
            { targetRole: 'MANDI' as StakeholderRole, name: 'Mandi Hub', label: 'Submit APMC Weighment Audit', icon: Store },
            { targetRole: 'WAREHOUSE' as StakeholderRole, name: 'Cold Storage Vault', label: 'Submit Thermal Sensor Audit', icon: Warehouse },
          ],
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div
      id={`${role.toLowerCase()}-feedback-hub`}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6 animate-fadeIn"
    >
      {/* Top Banner */}
      <div className={`bg-gradient-to-br ${theme.bannerGrad} rounded-2xl p-6 text-white space-y-4 shadow-md`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono ${theme.accentBadge}`}>
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{role} FEEDBACK & REPUTATION ENGINE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {theme.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {theme.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openFeedbackModal(theme.presets[0]?.targetRole || 'MANDI', theme.presets[0]?.name || 'Partner Facility')}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${theme.actionBtn}`}
            >
              <Plus className="w-4 h-4" />
              <span>Give New Feedback</span>
            </button>
          </div>
        </div>

        {/* Quick One-Tap Rating Presets */}
        <div className="pt-2 border-t border-white/10">
          <span className="text-[11px] text-slate-300 uppercase tracking-wider font-bold block mb-2">
            One-Tap Evaluations:
          </span>
          <div className="flex flex-wrap gap-2">
            {theme.presets.map((preset, idx) => {
              const IconComponent = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => openFeedbackModal(preset.targetRole, preset.name)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <IconComponent className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Reputation Rating
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
              {avgStars}
            </span>
            <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-800 font-medium">
            <span>Score: {avgReceivedScore}/100</span>
            <span>·</span>
            <span>{totalReceived} ratings</span>
          </div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Positive Trust
            </span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-800 font-mono">
              {positiveRate}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            ≥ 80-pt Positive Evaluations
          </span>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 to-teal-100/40 border border-teal-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Feedback Given
            </span>
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-teal-900 font-mono">
              {feedbacksGiven.length}
            </span>
          </div>
          <span className="text-[11px] text-teal-700 font-medium block">
            Partner evaluations logged
          </span>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ledger State
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm md:text-base font-extrabold text-slate-900 font-mono">
              Supabase DB
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            feedbacks & audit_logs sync
          </span>
        </div>
      </div>

      {/* Dual Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'received'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>Ratings Received</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'received' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {feedbacksReceived.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('given')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'given'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>Feedback Given by You</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'given' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {feedbacksGiven.length}
            </span>
          </button>
        </div>

        <button
          onClick={loadFeedbacks}
          disabled={loading}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Feedbacks Content List */}
      <div className="space-y-3">
        {activeTab === 'received' ? (
          feedbacksReceived.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Feedback Received Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                As transactions and handoffs occur on the platform, evaluations from Mandis, Processors, and Consumers will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacksReceived.map((fb) => (
                <div
                  key={fb.feedbackId}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-400 hover:bg-white hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header line */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          {getRoleIcon(fb.fromRole)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">{fb.submittedBy}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-mono font-bold uppercase">
                              {fb.fromRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Batch: <span className="font-bold text-slate-700">{fb.batchId}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold border ${
                            fb.score >= 90
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : fb.score >= 70
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {fb.score}/100
                        </span>
                        <div className="flex items-center gap-0.5 justify-end mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.round((fb.score / 100) * 5)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                      Category: {fb.category}
                    </div>

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 italic">
                      "{fb.comment}"
                    </p>

                    {/* Tags */}
                    {fb.tags && fb.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
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
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    {onSelectBatch && (
                      <button
                        onClick={() => onSelectBatch(fb.batchId)}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Trace Batch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          feedbacksGiven.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Feedback Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click any of the one-tap presets above or the "Give New Feedback" button to evaluate Mandis, Storage Vaults, or Transporters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacksGiven.map((fb) => (
                <div
                  key={fb.feedbackId}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-teal-400 hover:bg-white hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          {getRoleIcon(fb.toRole)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {fb.targetEntityName || fb.toRole}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono font-bold uppercase">
                              Target: {fb.toRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Batch: <span className="font-bold text-slate-700">{fb.batchId}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold border ${
                            fb.score >= 90
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : fb.score >= 70
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {fb.score}/100
                        </span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                      Category: {fb.category}
                    </div>

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 italic">
                      "{fb.comment}"
                    </p>

                    {/* Tags */}
                    {fb.tags && fb.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {fb.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold"
                          >
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    <span className="text-emerald-700 font-bold">Supabase Stored</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Embedded Modal Trigger */}
      {isModalOpen && (
        <UnifiedFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialBatchId={modalBatchId}
          fromRole={role}
          submittedBy={user.name}
          targetRole={modalTargetRole}
          targetEntityName={modalTargetEntity}
          onFeedbackSubmitted={() => {
            loadFeedbacks();
          }}
        />
      )}
    </div>
  );
};
