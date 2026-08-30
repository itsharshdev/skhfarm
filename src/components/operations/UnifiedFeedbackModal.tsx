import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StakeholderRole, FeedbackCategory, FeedbackRecord } from '../../types';
import { traceService } from '../../services/traceService';
import {
  Award,
  Star,
  X,
  Check,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  Mic,
  MicOff,
  Camera,
  Paperclip,
  Sparkles,
  Tractor,
  Store,
  Warehouse,
  Factory,
  Truck,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface UnifiedFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBatchId?: string;
  fromRole: StakeholderRole;
  submittedBy: string;
  targetRole?: StakeholderRole;
  targetEntityName?: string;
  onFeedbackSubmitted?: (record: FeedbackRecord) => void;
}

const ROLE_TARGET_MAP: Record<StakeholderRole, StakeholderRole> = {
  FARMER: 'MANDI',
  MANDI: 'FARMER',
  WAREHOUSE: 'TRANSPORTER',
  PROCESSOR: 'MANDI',
  MANUFACTURER: 'PROCESSOR',
  FACTORY: 'PROCESSOR',
  TRANSPORTER: 'WAREHOUSE',
  DISTRIBUTOR: 'RETAILER',
  RETAILER: 'PROCESSOR',
  CONSUMER: 'FARMER',
  AUTHORITY: 'ADMIN',
  ADMIN: 'FARMER',
  CUSTOM: 'MANDI',
};

export const UnifiedFeedbackModal: React.FC<UnifiedFeedbackModalProps> = ({
  isOpen,
  onClose,
  initialBatchId = 'BIS-2026-092',
  fromRole,
  submittedBy,
  targetRole: defaultTargetRole,
  targetEntityName: defaultEntityName = '',
  onFeedbackSubmitted,
}) => {
  const [batchId, setBatchId] = useState(initialBatchId);
  const [toRole, setToRole] = useState<StakeholderRole>(defaultTargetRole || ROLE_TARGET_MAP[fromRole] || 'MANDI');
  const [targetEntityName, setTargetEntityName] = useState(defaultEntityName);
  const [category, setCategory] = useState<FeedbackCategory>('QUALITY');
  const [score, setScore] = useState<number>(95);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
    if (defaultTargetRole) setToRole(defaultTargetRole);
    if (defaultEntityName) setTargetEntityName(defaultEntityName);
  }, [initialBatchId, defaultTargetRole, defaultEntityName, isOpen]);

  // Voice recording timer simulation
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleStartVoice = () => {
    setIsRecordingVoice(true);
    setVoiceDuration(0);
  };

  const handleStopVoice = () => {
    setIsRecordingVoice(false);
    setHasVoiceNote(true);
    if (!comment) {
      if (fromRole === 'FARMER') {
        setComment('Voice note recorded: Kopargaon mandi electronic weighment matched our digital farm tally exactly. Payment settled instantly with zero disputes.');
      } else {
        setComment('Voice observation attached: Verified produce physical parameters and cold-chain compliance before handoff.');
      }
    }
  };

  const handleAttachMockSlip = () => {
    setAttachedImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsToSave = [...selectedTags];
      const commentToSave =
        comment.trim() ||
        `Verified ${category.toLowerCase()} handoff assessment: ${score}/100 points recorded on blockchain-ready ledger.`;

      const record = await traceService.submitFeedback(batchId, {
        fromRole,
        toRole,
        category,
        score,
        comment: commentToSave,
        submittedBy,
        targetEntityName: targetEntityName.trim() || undefined,
        tags: tagsToSave,
        attachmentUrl: attachedImage || undefined,
        voiceNoteDurationSec: hasVoiceNote ? voiceDuration || 14 : undefined,
      });

      setShowSuccessToast(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted(record);

      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Farmer specific smart tags
  const getSmartTagsForRole = () => {
    if (fromRole === 'FARMER') {
      return [
        { label: 'Fair MSP Rate Paid', score: 100 },
        { label: 'Instant Cash/UPI Settlement', score: 98 },
        { label: 'Accurate Weighbridge Match', score: 95 },
        { label: 'Solar Storage Preserved Moisture', score: 96 },
        { label: 'On-Time Reefer Pickup', score: 94 },
        { label: 'Gentle Handling of Crates', score: 92 },
        { label: 'Zero Moisture Dispute', score: 95 },
        { label: 'Delayed Settlement', score: 45 },
        { label: 'Weighbridge Discrepancy', score: 40 },
      ];
    }
    if (fromRole === 'MANDI') {
      return [
        { label: 'Grade A+ Clean Grain', score: 98 },
        { label: 'Moisture within 12% standard', score: 95 },
        { label: 'Zero Chemical Residue', score: 100 },
        { label: 'Clean Jute Bagging with QR', score: 96 },
        { label: 'Prompt Delivery to Yard', score: 92 },
        { label: 'Excess Foreign Matter', score: 50 },
      ];
    }
    if (fromRole === 'WAREHOUSE') {
      return [
        { label: 'Optimal Solar Cooling Preserved', score: 98 },
        { label: 'No Thermal Shock on Intake', score: 95 },
        { label: 'Sealed Reefer Handoff', score: 96 },
        { label: 'Intact Batch QR Seal', score: 94 },
      ];
    }
    if (fromRole === 'PROCESSOR') {
      return [
        { label: 'High Milling Extraction Yield', score: 97 },
        { label: 'Lab Test Certificate Verified', score: 99 },
        { label: 'Zero Insect Infestation', score: 98 },
        { label: 'Clean Trace Lineage DAG', score: 95 },
      ];
    }
    if (fromRole === 'TRANSPORTER') {
      return [
        { label: 'Quick Loading at Farm Gate', score: 95 },
        { label: 'Stable Pre-cooled Cargo', score: 96 },
        { label: 'Rapid Dock Turnaround', score: 92 },
      ];
    }
    return [
      { label: 'Exceptional Freshness & Aroma', score: 98 },
      { label: '100% Traceable to Farmer', score: 100 },
      { label: 'Clean Tamper-Proof Packaging', score: 95 },
      { label: 'Direct Producer Support', score: 97 },
    ];
  };

  const smartTags = getSmartTagsForRole();

  const categories: { id: FeedbackCategory; label: string; desc: string }[] = [
    { id: 'QUALITY', label: 'Produce Quality', desc: 'Grade, moisture, chemical purity, organic standard' },
    { id: 'WEIGHMENT', label: 'Weighbridge Accuracy', desc: 'Accurate weight, zero deduction calibration' },
    { id: 'PAYMENT_SPEED', label: 'Payment Settlement', desc: 'Instant bank/UPI transfer at agreed MSP rate' },
    { id: 'PRICE_TRANSPARENCY', label: 'Fair MSP & Pricing', desc: 'Transparent mandi bidding with zero cuts' },
    { id: 'CONDITION', label: 'Solar Cold Preservation', desc: 'Temperature bounds & solar humidity stability' },
    { id: 'PACKAGING', label: 'Packaging & QR Barcode', desc: 'Clean crates, tamper proof seals & QR tags' },
    { id: 'HANDLING', label: 'Transport Care', desc: 'Vehicle hygiene, gentle loading & route speed' },
    { id: 'TIMELINESS', label: 'Handoff Punctuality', desc: 'On-time pickup/delivery within scheduled ETA' },
    { id: 'TRACEABILITY', label: 'Digital Ledger Records', desc: 'Complete camera evidence and geo-tagged proof' },
    { id: 'OVERALL', label: 'Overall Stakeholder Trust', desc: 'End-to-end partnership & transparency rating' },
  ];

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="unified-feedback-modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {fromRole === 'FARMER' ? 'Farmer Voice & Stakeholder Rating' : 'Stakeholder Feedback & 100-Pt Rating'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase font-mono">
                  Ledger Sync
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged as <span className="font-bold text-white">{submittedBy}</span> ({fromRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast Overlay */}
        {showSuccessToast && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Feedback Stored in Backend Ledger!</h4>
            <p className="text-xs text-slate-600 max-w-sm">
              Rating of <strong>{score}/100</strong> permanently recorded for Batch {batchId}. 100-point explainable score updated dynamically.
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Target Stakeholder & Batch Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Batch ID to Rate
              </label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                placeholder="e.g. BIS-2026-092"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stakeholder Being Rated (To Role)
              </label>
              <select
                value={toRole}
                onChange={(e) => setToRole(e.target.value as StakeholderRole)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="FARMER">Farmer / Producer Origin</option>
                <option value="MANDI">Mandi / APMC Aggregation Hub</option>
                <option value="WAREHOUSE">Solar Cold Storage Facility</option>
                <option value="PROCESSOR">Flour Mill / Processing Plant</option>
                <option value="TRANSPORTER">Refrigerated Logistics Carrier</option>
                <option value="RETAILER">Retailer / Supermarket</option>
                <option value="CONSUMER">Public Consumers</option>
                <option value="AUTHORITY">Food Safety Regulator</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Organization / Entity Name (Optional)
              </label>
              <input
                type="text"
                value={targetEntityName}
                onChange={(e) => setTargetEntityName(e.target.value)}
                placeholder="e.g. Kopargaon APMC Mandi Yard, MahaAgro Solar Cool Vault #04..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 0–100 Point Score Slider & 5-Star Visual Sync */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-slate-50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  Integrity & Quality Score
                </label>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 cursor-pointer transition-transform hover:scale-110 ${
                        score >= star * 20 - 10
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                      onClick={() => setScore(star * 20)}
                    />
                  ))}
                  <span className="text-xs text-slate-500 font-medium ml-1">
                    ({Math.round((score / 100) * 5 * 10) / 10} / 5 Stars)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xl font-black font-mono px-3.5 py-1 rounded-xl border shadow-xs inline-block ${
                    score >= 90
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : score >= 75
                      ? 'bg-teal-100 text-teal-900 border-teal-300'
                      : score >= 60
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}
                >
                  {score} <span className="text-xs font-normal">/100</span>
                </span>
                <span className="block text-[10px] font-bold text-slate-500 mt-0.5">
                  {score >= 90
                    ? 'Exceptional Standard'
                    : score >= 75
                    ? 'Good Quality'
                    : score >= 60
                    ? 'Acceptable / Marginal'
                    : 'Dispute / Critical Issue'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 (Major Dispute)</span>
              <span>50 (Marginal)</span>
              <span>80 (Certified)</span>
              <span>100 (Flawless)</span>
            </div>
          </div>

          {/* Quick Smart Tag Presets (Especially Farmer First) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>One-Tap Quality Tags ({fromRole})</span>
              </label>
              <span className="text-[10px] text-slate-400">Click to attach to feedback</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {smartTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      handleToggleTag(tag.label);
                      if (!isSelected && tag.score) {
                        setScore(tag.score);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{tag.label}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assessment Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Assessment Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                    category === cat.id
                      ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                  }`}
                >
                  <span className="font-bold text-slate-900">{cat.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Observations & Farmer Voice Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Detailed Comments & Observations
              </label>

              {/* Farmer Voice Button */}
              <div className="flex items-center gap-1.5">
                {!isRecordingVoice ? (
                  <button
                    type="button"
                    onClick={handleStartVoice}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition-colors cursor-pointer"
                    title="Record voice note in Marathi/Hindi/English"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Farmer Voice Note</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopVoice}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition-colors animate-pulse cursor-pointer"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Recording ({voiceDuration}s)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAttachMockSlip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach Slip</span>
                </button>
              </div>
            </div>

            {hasVoiceNote && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-emerald-600 text-white">
                    <Mic className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-mono font-bold">Voice Note ({voiceDuration || 14}s audio attached)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasVoiceNote(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {attachedImage && (
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Weighbridge / Receipt Slip (receipt_weighment_proof.jpg)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Moisture levels verified at 11.8%, weighbridge slip matches electronic tally, solar pre-cooling maintained quality..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>

          {/* Ledger Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              This feedback permanently stores in the Supabase backend `feedbacks` and `audit_logs` tables and recalculates the explainable 100-point trace score.
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving to Backend...' : 'Submit 100-Point Feedback to Ledger'}</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
