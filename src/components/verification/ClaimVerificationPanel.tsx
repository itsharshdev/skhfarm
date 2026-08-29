import React, { useState, useEffect } from 'react';
import { Batch, Claim, VerificationStatus } from '../../types';
import { useAuthRole } from '../../context/AuthRoleContext';
import { claimVerificationService } from '../../services/claimVerificationService';
import { ClaimVerificationCard } from './ClaimVerificationCard';
import { EnvironmentalFactCheckCard } from './EnvironmentalFactCheckCard';
import { ClaimReviewWorkflowModal } from './ClaimReviewWorkflowModal';
import {
  ShieldCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Layers,
  Thermometer,
  Award,
  Send,
  Info,
} from 'lucide-react';

interface ClaimVerificationPanelProps {
  batch: Batch;
  onSelectEvent?: (eventId: string) => void;
  onInspectTrace?: () => void;
}

export const ClaimVerificationPanel: React.FC<ClaimVerificationPanelProps> = ({
  batch,
  onSelectEvent,
  onInspectTrace,
}) => {
  const { currentUser, isAuthenticated } = useAuthRole();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [reviewingClaim, setReviewingClaim] = useState<Claim | null>(null);
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimCategory, setNewClaimCategory] = useState<Claim['category']>('COLD_CHAIN_FAILURE');
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    loadClaims();
    const unsubscribe = claimVerificationService.subscribe(() => {
      loadClaims();
    });
    return () => unsubscribe();
  }, [batch.batchId]);

  const loadClaims = () => {
    const list = claimVerificationService.getClaimsForBatch(batch.batchId);
    setClaims(list);
  };

  const handleVerifyNewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim()) return;

    setIsEvaluating(true);
    await new Promise((r) => setTimeout(r, 600)); // Smooth evaluation transition
    claimVerificationService.submitClaimForVerification(batch, newClaimText.trim(), newClaimCategory);
    setNewClaimText('');
    setIsEvaluating(false);
    setIsSubmitFormOpen(false);
  };

  const categories = [
    'ALL',
    'COLD_CHAIN_FAILURE',
    'ORIGIN_MISREPRESENTATION',
    'CONTAMINATION',
    'QUALITY_DEFECT',
    'TRANSPORT_INTERRUPTION',
  ];

  const filteredClaims = claims.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.category === selectedCategory;
  });

  const contradictedCount = claims.filter((c) => c.status === 'CONTRADICTED_BY_RECORDS').length;
  const supportedCount = claims.filter((c) => c.status === 'SUPPORTED' || c.status === 'VERIFIED').length;
  const disputedCount = claims.filter((c) => c.status === 'DISPUTED').length;

  return (
    <div id="claim-verification-panel" className="space-y-6 animate-fadeIn">
      {/* Hero Header Explanation Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PS-2 Information & Claim Verification Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk',sans-serif]">
              Evidence-Grounded Fact-Checking
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Cross-references public inquiries and rumors against this batch's cryptographic telemetry, solar-powered cold chain logs, and NABL laboratory certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSubmitFormOpen(!isSubmitFormOpen)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start lg:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Fact-Check a Rumor or Inquiry</span>
          </button>
        </div>

        {/* Verification KPI Counters */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Assessed Inquiries</span>
            <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">{claims.length}</span>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-rose-300 uppercase font-bold block">Contradicted Rumors</span>
            <span className="text-xl font-extrabold font-mono text-rose-400 mt-0.5 block">{contradictedCount}</span>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Supported Facts</span>
            <span className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5 block">{supportedCount}</span>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">Disputed / In Review</span>
            <span className="text-xl font-extrabold font-mono text-amber-400 mt-0.5 block">{disputedCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Fact-Check Submission Modal/Card */}
      {isSubmitFormOpen && (
        <form
          onSubmit={handleVerifyNewClaim}
          className="p-6 rounded-3xl bg-white border border-emerald-300 shadow-lg space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Submit Statement for Instant Batch Verification
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmitFormOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Inquiry / Statement to Verify</label>
            <input
              type="text"
              required
              value={newClaimText}
              onChange={(e) => setNewClaimText(e.target.value)}
              placeholder="e.g. Rumor says batch experienced temperature excursion above 30°C in warehouse storage."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Claim Domain / Category</label>
              <select
                value={newClaimCategory}
                onChange={(e) => setNewClaimCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="COLD_CHAIN_FAILURE">Cold-Chain & Thermal Excursion</option>
                <option value="ORIGIN_MISREPRESENTATION">Origin & Geographic Representation</option>
                <option value="CONTAMINATION">Contamination & Chemical Residue</option>
                <option value="QUALITY_DEFECT">Quality Specification / Defect</option>
                <option value="TRANSPORT_INTERRUPTION">Transport Timeline & Handoff</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEvaluating ? 'Evaluating Evidence Records...' : 'Cross-Reference Telemetry & Verify'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Deep-Dive Cold-Chain & Solar Telemetry Fact-Check Section */}
      {(selectedCategory === 'ALL' || selectedCategory === 'COLD_CHAIN_FAILURE') && (
        <div className="space-y-2">
          <EnvironmentalFactCheckCard
            productCategory={batch.category}
            defaultMinTemp={batch.storageUnit?.safeTemperatureMin || 18.0}
            defaultMaxTemp={batch.storageUnit?.safeTemperatureMax || 24.0}
          />
        </div>
      )}

      {/* Verified Claims Cards List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No Claims in this Category</p>
            <p className="text-xs text-slate-500">All available batch telemetry logs remain verified compliant.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <ClaimVerificationCard
              key={claim.claimId}
              claim={claim}
              onSelectEvent={onSelectEvent}
              onInspectTrace={onInspectTrace}
              onOpenReviewModal={(c) => setReviewingClaim(c)}
              isStakeholder={isAuthenticated}
            />
          ))
        )}
      </div>

      {/* Stakeholder Claim Review Modal */}
      <ClaimReviewWorkflowModal
        claim={reviewingClaim}
        currentUser={
          currentUser || {
            id: 'demo-auditor',
            name: 'State Food Safety Inspector',
            role: 'AUTHORITY',
            email: 'inspector@maharashtra.gov.in',
            organization: 'Maharashtra Food Safety Inspectorate',
          }
        }
        isOpen={!!reviewingClaim}
        onClose={() => setReviewingClaim(null)}
        onSuccess={() => loadClaims()}
      />
    </div>
  );
};
