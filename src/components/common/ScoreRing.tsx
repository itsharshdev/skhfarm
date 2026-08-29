import React, { useState } from 'react';
import { TraceScoreBreakdown } from '../../types';
import { ShieldCheck, Info, ChevronDown, ChevronUp, AlertCircle, Award } from 'lucide-react';

interface ScoreRingProps {
  scoreBreakdown: TraceScoreBreakdown;
  size?: 'lg' | 'md' | 'sm';
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ scoreBreakdown, size = 'lg' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totalScore } = scoreBreakdown;

  // Determine score color palette
  const getScoreTheme = (score: number) => {
    if (score >= 85) {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        stroke: '#059669',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'High Integrity Trace',
      };
    }
    if (score >= 70) {
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        stroke: '#d97706',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Moderate Trace Integrity',
      };
    }
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      stroke: '#e11d48',
      badge: 'bg-rose-100 text-rose-800',
      label: 'Attention / Integrity Flags',
    };
  };

  const theme = getScoreTheme(totalScore);
  const strokeDashoffset = 283 - (283 * Math.min(Math.max(totalScore, 0), 100)) / 100;

  return (
    <div
      id="score-ring-card"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:p-6 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Ring & Score Number */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="9"
              />
              {/* Animated/Value Stroke */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                stroke={theme.stroke}
                strokeWidth="9"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * totalScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${theme.text}`}>
                {totalScore}
              </span>
              <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                {theme.label}
              </span>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                Prototype Model
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 inline" />
              Trace & Quality Score
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Transparent 100-point weighted supply-chain integrity rating.
            </p>
          </div>
        </div>

        {/* Toggle breakdown button */}
        <button
          id="toggle-score-breakdown-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-semibold transition-colors self-end sm:self-center"
        >
          <span>{isExpanded ? 'Hide Breakdown' : 'Explain Score'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Breakdown Drawer */}
      {isExpanded && (
        <div id="score-breakdown-panel" className="mt-5 pt-5 border-t border-slate-100 text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Weighted Dimension Breakdown
            </span>
            <span className="text-xs text-slate-600 italic">No 5-star approximations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs md:text-sm">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Handoff Integrity</span>
                <span className="text-emerald-700">{scoreBreakdown.handoffScore}/{scoreBreakdown.handoffMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.handoffScore / scoreBreakdown.handoffMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Verified chain transfers</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Trace Completeness</span>
                <span className="text-emerald-700">{scoreBreakdown.completenessScore}/{scoreBreakdown.completenessMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.completenessScore / scoreBreakdown.completenessMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">All required event fields</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Verification Integrity</span>
                <span className="text-emerald-700">{scoreBreakdown.verificationScore}/{scoreBreakdown.verificationMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.verificationScore / scoreBreakdown.verificationMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Audited org certificates</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Product Quality</span>
                <span className="text-emerald-700">{scoreBreakdown.qualityScore}/{scoreBreakdown.qualityMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.qualityScore / scoreBreakdown.qualityMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Moisture & grade tests</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Evidence Camera Proof</span>
                <span className="text-emerald-700">{scoreBreakdown.evidenceScore}/{scoreBreakdown.evidenceMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.evidenceScore / scoreBreakdown.evidenceMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Device-camera photos</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Feedback Reliability</span>
                <span className="text-emerald-700">{scoreBreakdown.feedbackScore}/{scoreBreakdown.feedbackMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.feedbackScore / scoreBreakdown.feedbackMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Stakeholder reviews</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Freshness State</span>
                <span className="text-emerald-700">{scoreBreakdown.freshnessScore}/{scoreBreakdown.freshnessMax}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(scoreBreakdown.freshnessScore / scoreBreakdown.freshnessMax) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Shelf-life validity</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Penalties Applied</span>
                <span className={scoreBreakdown.penalties.expiryPenalty > 0 || scoreBreakdown.penalties.contaminationPenalty > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                  -{scoreBreakdown.penalties.expiryPenalty + scoreBreakdown.penalties.contaminationPenalty + scoreBreakdown.penalties.anomalyPenalty + scoreBreakdown.penalties.missingEvidencePenalty} pts
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-rose-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min((scoreBreakdown.penalties.expiryPenalty + scoreBreakdown.penalties.contaminationPenalty) * 5, 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {scoreBreakdown.penalties.expiryPenalty > 0 ? 'Expiry warning deduction' : 'Zero active anomalies'}
              </span>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Prototype Scoring Model:</strong> Weights are calculated transparently across verified handoffs, camera proof, and storage compliance. It is not an official regulatory certification.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
