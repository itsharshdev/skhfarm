import React, { useState } from 'react';
import { Claim, VerificationStatus, VerificationRelationship } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Thermometer,
  Sun,
  MapPin,
  Camera,
  ExternalLink,
  Award,
  Layers,
  Edit3,
  UserCheck,
  Lock,
  Eye,
} from 'lucide-react';

interface ClaimVerificationCardProps {
  claim: Claim;
  onSelectEvent?: (eventId: string) => void;
  onInspectTrace?: () => void;
  onOpenReviewModal?: (claim: Claim) => void;
  isStakeholder?: boolean;
}

export const ClaimVerificationCard: React.FC<ClaimVerificationCardProps> = ({
  claim,
  onSelectEvent,
  onInspectTrace,
  onOpenReviewModal,
  isStakeholder = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'CONTRADICTED_BY_RECORDS':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>CONTRADICTED BY AVAILABLE RECORDS</span>
          </span>
        );
      case 'SUPPORTED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>SUPPORTED BY RECORDS</span>
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>DISPUTED / DISCREPANCY DETECTED</span>
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-700 border border-slate-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>INSUFFICIENT EVIDENCE</span>
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 border border-teal-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>VERIFIED COMPLIANT</span>
          </span>
        );
      case 'UNVERIFIED':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const getRelationshipBadge = (rel: VerificationRelationship) => {
    switch (rel) {
      case 'CONTRADICTS_CLAIM':
        return <span className="text-[10px] font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">CONTRADICTS CLAIM</span>;
      case 'SUPPORTS_CLAIM':
        return <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">SUPPORTS CLAIM</span>;
      case 'CONTEXT_ONLY':
        return <span className="text-[10px] font-bold font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">CONTEXT ONLY</span>;
      case 'INCONCLUSIVE':
      default:
        return <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">INCONCLUSIVE</span>;
    }
  };

  return (
    <div
      id={`claim-card-${claim.claimId}`}
      className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all"
    >
      {/* Top Header: Category & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
            {claim.category.replace(/_/g, ' ')}
          </span>
          <span className="text-slate-400 text-xs">·</span>
          <span className="font-mono text-xs text-slate-500">Ref: {claim.claimId}</span>
          {claim.isHumanReviewed && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono text-[10px] font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Stakeholder Reviewed</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(claim.status)}
          {onOpenReviewModal && (
            <button
              type="button"
              onClick={() => onOpenReviewModal(claim)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Review & Resolve Disputed Claim"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Claim Statement */}
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 text-base font-['Space_Grotesk',sans-serif]">
          {claim.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 italic leading-relaxed">
          "{claim.claimStatement}"
        </p>
      </div>

      {/* Verification Reason / Objective Assessment */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Evidence-Based Fact-Check Analysis</span>
        </div>
        <p className="text-slate-200 leading-relaxed text-xs">{claim.reason}</p>
      </div>

      {/* Factor Impact Summary Chips */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Factor Relationship Impact:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">
            {claim.factorSummary.contradictingCount} Contradicting
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            {claim.factorSummary.supportingCount} Supporting
          </span>
          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800">
            {claim.factorSummary.contextOnlyCount} Context Only
          </span>
          {claim.factorSummary.unavailableCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {claim.factorSummary.unavailableCount} Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Missing Evidence List if present */}
      {claim.missingEvidenceList && claim.missingEvidenceList.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
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

      {/* Human Stakeholder Review Decision Notes (if reviewed) */}
      {claim.isHumanReviewed && claim.reviewerNotes && (
        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Stakeholder Review Directive · {claim.reviewerName} ({claim.reviewerRole})</span>
            </span>
            <span className="text-[10px] font-mono text-blue-700">
              {claim.reviewedAt ? new Date(claim.reviewedAt).toLocaleDateString() : 'Verified'}
            </span>
          </div>
          {claim.isReviewerNotesPublic ? (
            <p className="text-blue-900 text-[11px] leading-relaxed pt-0.5">
              {claim.reviewerNotes}
            </p>
          ) : (
            <p className="text-slate-500 italic text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Internal audit observations preserved for regulatory compliance.</span>
            </p>
          )}
        </div>
      )}

      {/* Records Checked & Evidence Available Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Records Checked:{' '}
            <strong className="text-slate-800">{claim.factors.length} Telemetry Sources</strong>
          </span>
          <span>·</span>
          <span>
            Last Verified:{' '}
            <strong className="text-slate-800 font-mono">
              {new Date(claim.lastVerifiedAt).toLocaleDateString()}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Factor Breakdown' : 'Inspect Evaluated Factors'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Factor-by-Factor Breakdown */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Corroborating Evidence & Sensor Records
          </span>

          <div className="space-y-2.5">
            {claim.factors.map((factor) => (
              <div
                key={factor.factorId}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {factor.category === 'TEMPERATURE' && <Thermometer className="w-3.5 h-3.5 text-rose-600" />}
                    {factor.category === 'SOLAR_ENVIRONMENT' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    {factor.category === 'TIMELINE' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
                    {factor.category === 'CERTIFICATE' && <Award className="w-3.5 h-3.5 text-purple-600" />}
                    {factor.category === 'EVIDENCE' && <Camera className="w-3.5 h-3.5 text-emerald-600" />}
                    {factor.category === 'ROUTE' && <MapPin className="w-3.5 h-3.5 text-teal-600" />}
                    <span>{factor.name}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        factor.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {factor.isAvailable ? '✓ Available' : '⚠ Unavailable'}
                    </span>
                    {getRelationshipBadge(factor.relationship)}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed pl-5 text-[11px] sm:text-xs">
                  {factor.observation}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
            {onOpenReviewModal && (
              <button
                type="button"
                onClick={() => onOpenReviewModal(claim)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Stakeholder Review Action</span>
              </button>
            )}

            {onInspectTrace && (
              <button
                type="button"
                onClick={onInspectTrace}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Batch Timeline</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
