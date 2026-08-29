import React, { useState } from 'react';
import { StakeholderRole } from '../../types';
import { traceService } from '../../services/traceService';
import { Award, Star, X, Check, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';

interface HandoffFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  fromRole: StakeholderRole;
  toRole: StakeholderRole;
  submittedBy: string;
  onFeedbackSubmitted?: () => void;
}

export const HandoffFeedbackModal: React.FC<HandoffFeedbackModalProps> = ({
  isOpen,
  onClose,
  batchId,
  fromRole,
  toRole,
  submittedBy,
  onFeedbackSubmitted,
}) => {
  const [category, setCategory] = useState<
    'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TIMELINESS' | 'CONDITION' | 'TRACEABILITY' | 'OVERALL'
  >('QUALITY');
  const [score, setScore] = useState<number>(90);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await traceService.submitFeedback(batchId, {
        fromRole,
        toRole,
        category,
        score,
        comment: comment.trim() || `Verified ${category.toLowerCase()} handoff compliance score: ${score}/100.`,
        submittedBy,
      });
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onClose();
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { id: typeof category; label: string; desc: string }[] = [
    { id: 'QUALITY', label: 'Product Quality', desc: 'Grade, moisture, purity, freshness' },
    { id: 'CONDITION', label: 'Storage Condition', desc: 'Temperature bounds & cold preservation' },
    { id: 'ACCURACY', label: 'Quantity & Weight', desc: 'Calibrated weighbridge & tally match' },
    { id: 'PACKAGING', label: 'Packaging & Seals', desc: 'Tamper proofing & crate cleanliness' },
    { id: 'HANDLING', label: 'Logistics Handling', desc: 'Careful transit & vehicle hygiene' },
    { id: 'TIMELINESS', label: 'Handoff Timeliness', desc: 'On-time delivery within ETA bounds' },
    { id: 'TRACEABILITY', label: 'Record Accuracy', desc: 'Complete camera evidence & data logs' },
  ];

  return (
    <div
      id="handoff-feedback-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Handoff Feedback & Rating</h3>
              <p className="text-xs text-slate-500 font-mono">
                {fromRole} → {toRole} · Batch {batchId}
              </p>
            </div>
          </div>
          <button
            id="close-feedback-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* 0–100 Point Score Slider */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Integrity Score (0–100 Points)
              </label>
              <span
                className={`text-lg font-black font-mono px-3 py-0.5 rounded-xl border ${
                  score >= 85
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : score >= 65
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {score} / 100
              </span>
            </div>

            <input
              id="feedback-score-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 (Critical Issue)</span>
              <span>50 (Marginal)</span>
              <span>80 (Good)</span>
              <span>100 (Flawless)</span>
            </div>
          </div>

          {/* Assessment Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Assessment Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                    category === cat.id
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                  }`}
                >
                  <span className="font-bold text-slate-900">{cat.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observations Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Field Observations / Quality Notes</label>
            <textarea
              id="feedback-comment-input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Moisture levels verified at 11.8%, temperature log steady at 18°C, tamper seal tag intact..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>

          {/* Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>This rating attaches permanently to the batch ledger and updates the explainable 100-pt trace score.</span>
          </div>

          {/* Submit Action */}
          <button
            id="submit-feedback-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Feedback...' : 'Submit 100-Point Assessment'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
