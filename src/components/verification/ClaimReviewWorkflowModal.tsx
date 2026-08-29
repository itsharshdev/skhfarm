import React, { useState } from 'react';
import { Claim, VerificationStatus, AppUser } from '../../types';
import { claimVerificationService } from '../../services/claimVerificationService';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  X,
  FileText,
  Lock,
  Eye,
  Camera,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ClaimReviewWorkflowModalProps {
  claim: Claim | null;
  currentUser: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClaimReviewWorkflowModal: React.FC<ClaimReviewWorkflowModalProps> = ({
  claim,
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !claim) return null;

  const [decision, setDecision] = useState<VerificationStatus>(claim.status);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [evidenceRef, setEvidenceRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      setErrorMessage('Review notes are strictly mandatory before resolving this claim audit.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 500));
      claimVerificationService.resolveClaimReview(
        claim.claimId,
        decision,
        reviewNotes.trim(),
        isPublic,
        currentUser.name,
        currentUser.role,
        evidenceRef ? [evidenceRef.trim()] : undefined
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="claim-review-workflow-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-review-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="claim-review-title" className="font-extrabold text-base font-['Space_Grotesk',sans-serif]">
                Stakeholder Claim Review & Audit Resolution
              </h3>
              <p className="text-xs text-slate-400">
                Reviewer: {currentUser.name} ({currentUser.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmitReview} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Claim Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-500">Claim ID: {claim.claimId}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold font-mono text-[10px]">
                {claim.category.replace(/_/g, ' ')}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{claim.title}</h4>
            <p className="text-slate-700 italic">"{claim.claimStatement}"</p>
          </div>

          {/* Missing Evidence Warning if any */}
          {claim.missingEvidenceList && claim.missingEvidenceList.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Missing Evidence Discovered During Audit:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-800">
                {claim.missingEvidenceList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Review Decision Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              1. Review Audit Decision
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDecision('CONTRADICTED_BY_RECORDS')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  decision === 'CONTRADICTED_BY_RECORDS'
                    ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">CONFIRM CONTRADICTED</span>
                  <span className="text-[10px] opacity-75 font-normal">Available records prove statement false</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('SUPPORTED')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  decision === 'SUPPORTED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">CONFIRM SUPPORTED</span>
                  <span className="text-[10px] opacity-75 font-normal">Evidence verifies claim as true</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('DISPUTED')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  decision === 'DISPUTED'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">MARK DISPUTED</span>
                  <span className="text-[10px] opacity-75 font-normal">Discrepancy requires stakeholder arbitration</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('INSUFFICIENT_EVIDENCE')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  decision === 'INSUFFICIENT_EVIDENCE'
                    ? 'bg-slate-200 border-slate-400 text-slate-900 font-bold ring-2 ring-slate-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">INSUFFICIENT EVIDENCE</span>
                  <span className="text-[10px] opacity-75 font-normal">Data gap prevents verification</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mandatory Review Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              2. Reviewer Audit Observations & Rationale <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Cross-referenced GPS telemetry logs with warehouse physical dock manifest. Cold chain integrity intact with zero recorded thermal anomalies."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
            <span className="text-[11px] text-slate-400">
              * Required by regulatory protocol. Auto-resolution without notes is strictly prohibited.
            </span>
          </div>

          {/* Attach Corroborating Evidence Reference */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              3. Attach Corroborating Reference / Certificate ID (Optional)
            </label>
            <input
              type="text"
              value={evidenceRef}
              onChange={(e) => setEvidenceRef(e.target.value)}
              placeholder="e.g. NABL-CERT-2026-992 / IOT-REEFER-LOG-881"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Public vs Internal Notes Privacy Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                {isPublic ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                <span>{isPublic ? 'Publish Review Notes on Public Trace' : 'Keep Review Notes Internal Only'}</span>
              </span>
              <p className="text-[11px] text-slate-500">
                {isPublic
                  ? 'Notes will be visible to consumers on the Digital Passport.'
                  : 'Notes remain restricted to authorized stakeholders and regulators.'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Audit Resolution...' : 'Commit Claim Resolution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
