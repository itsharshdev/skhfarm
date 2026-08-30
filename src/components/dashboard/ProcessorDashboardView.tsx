import React, { useState, useEffect } from 'react';
import { Batch, AppUser } from '../../types';
import { traceService } from '../../services/traceService';
import { CameraEvidenceCaptureModal } from '../operations/CameraEvidenceCaptureModal';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import { StakeholderFeedbackHub } from '../operations/StakeholderFeedbackHub';
import { TransferBatchModal } from '../operations/TransferBatchModal';
import { BatchQRModal } from '../operations/BatchQRModal';
import { StatusBadge } from '../common/StatusBadge';
import {
  Factory,
  Layers,
  GitMerge,
  Plus,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Sparkles,
  Camera,
  AlertCircle,
  Truck,
  Clock,
  ShieldCheck,
  MessageSquare,
  Award,
} from 'lucide-react';

interface ProcessorDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const ProcessorDashboardView: React.FC<ProcessorDashboardViewProps> = ({
  user,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform Modal State
  const [isTransformModalOpen, setIsTransformModalOpen] = useState(false);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [outputProductName, setOutputProductName] = useState('Milled Whole Sharbati Flour (5kg Retail Packs)');
  const [outputCategory, setOutputCategory] = useState('Milled Flour & Grain Products');
  const [outputVariety, setOutputVariety] = useState('Whole Sharbati Unbleached');
  const [outputQuantity, setOutputQuantity] = useState(400);
  const [outputUnit, setOutputUnit] = useState<'PACKS' | 'KG' | 'CRATES' | 'TONNES'>('PACKS');
  const [expiryDays, setExpiryDays] = useState(180);
  const [processingNotes, setProcessingNotes] = useState('Stone-ground cold milling at <38°C to preserve wheat germ & nutrient profile.');
  const [evidence, setEvidence] = useState<{ previewUrl: string; captureType: 'PHOTO' | 'VIDEO' } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer, QR & Feedback modals
  const [transferBatch, setTransferBatch] = useState<Batch | null>(null);
  const [qrBatch, setQrBatch] = useState<Batch | null>(null);
  const [feedbackBatch, setFeedbackBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadData();
    const unsubscribe = (traceService as any).subscribe?.(() => {
      loadData();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const myBatches = await traceService.getBatchesForUser('PROCESSOR', user.name, user.organizationName);
      const all = await traceService.getAllBatches();
      setBatches(myBatches);
      setAllBatches(all);
      // Pre-select raw batches if available
      const rawBatches = all.filter((b) => b.parentBatchIds.length === 0 && b.status !== 'RECALLED');
      if (rawBatches.length > 0 && selectedParentIds.length === 0) {
        setSelectedParentIds([rawBatches[0].batchId]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleParentSelection = (batchId: string) => {
    if (selectedParentIds.includes(batchId)) {
      setSelectedParentIds(selectedParentIds.filter((id) => id !== batchId));
    } else {
      setSelectedParentIds([...selectedParentIds, batchId]);
    }
  };

  const handleTransformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParentIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const transformedBatch = await traceService.transformBatch({
        parentBatchIds: selectedParentIds,
        productName: outputProductName,
        category: outputCategory,
        variety: outputVariety,
        quantity: outputQuantity,
        unit: outputUnit,
        processorName: user.name,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        location: `${user.location} Processing Line #2`,
        notes: processingNotes,
        expiryDays,
        evidence: evidence || undefined,
      });
      setIsTransformModalOpen(false);
      setEvidence(null);
      setQrBatch(transformedBatch);
      loadData();
    } catch (err) {
      console.error('Transform error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawAvailable = allBatches.filter((b) => b.category.toLowerCase().includes('raw') || b.parentBatchIds.length === 0);

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/80 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Factory className="w-3.5 h-3.5" />
              <span>SKH031 Lineage Transformation & Processing Unit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Operator: {user.name} · {user.location}. Convert raw farm harvests into value-added retail packaged goods while linking and carrying forward full origin provenance.
            </p>
          </div>

          <button
            id="processor-transform-btn"
            onClick={() => setIsTransformModalOpen(true)}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <GitMerge className="w-4 h-4" />
            <span>Transform / Derive New Batch</span>
          </button>
        </div>
      </div>

      {/* Processed Batches with Preserved Lineage */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Output Lineage Registry
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Manufactured Batches ({batches.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Every pack carries bidirectional parent trace</span>
        </div>

        {batches.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Factory className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No manufactured batches yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Transform / Derive New Batch&quot; above to select raw input lots and produce packaged goods.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.batchId}
                id={`processor-batch-card-${batch.batchId}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {batch.scoreBreakdown.totalScore}/100
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectBatch(batch.batchId)}
                    className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 cursor-pointer transition-colors"
                  >
                    {batch.productName}
                  </h3>

                  {batch.parentBatchIds.length > 0 && (
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-indigo-900 uppercase flex items-center gap-1">
                        <GitMerge className="w-3 h-3 text-indigo-600" />
                        <span>Derived from Parent Batch</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {batch.parentBatchIds.map((pId) => (
                          <span
                            key={pId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBatch(pId);
                            }}
                            className="font-mono text-[10px] font-bold text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200 cursor-pointer hover:bg-indigo-100"
                          >
                            {pId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yield Quantity:</span>
                      <span className="font-semibold text-slate-800">
                        {batch.quantity} {batch.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Custodian:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {batch.currentOwner}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <StatusBadge status={batch.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQrBatch(batch)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR</span>
                    </button>

                    <button
                      onClick={() => setFeedbackBatch(batch)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1 border border-amber-200/80 cursor-pointer"
                      title="Rate Raw Material Supplier / Mandi"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-700" />
                      <span>Rate</span>
                    </button>
                  </div>

                  <button
                    id={`processor-transfer-btn-${batch.batchId}`}
                    onClick={() => setTransferBatch(batch)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Transfer to Retail</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processor Feedback & Reputation Hub */}
      <StakeholderFeedbackHub
        user={user}
        role="PROCESSOR"
        batches={batches.length > 0 ? batches : allBatches}
        onSelectBatch={onSelectBatch}
      />

      {/* Transformation Modal */}
      {isTransformModalOpen && (
        <div
          id="transform-batch-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-100 text-indigo-800">
                  <GitMerge className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Transform / Process Raw Harvest (SKH031)</h3>
                  <p className="text-xs text-slate-500">Link source parent batches into manufactured product line</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransformModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransformSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Parent Batches Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Source / Parent Batch(es) to Transform:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {rawAvailable.map((raw) => {
                    const isSelected = selectedParentIds.includes(raw.batchId);
                    return (
                      <div
                        key={raw.batchId}
                        onClick={() => handleToggleParentSelection(raw.batchId)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="truncate">
                          <span className="font-mono text-[10px] text-indigo-800 block">{raw.batchId}</span>
                          <span className="truncate block">{raw.productName}</span>
                          <span className="text-[10px] text-slate-400">{raw.origin}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedParentIds.length === 0 && (
                  <p className="text-[11px] text-rose-600 font-semibold">Please select at least 1 parent batch.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Output Finished Product Name</label>
                <input
                  type="text"
                  required
                  value={outputProductName}
                  onChange={(e) => setOutputProductName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Finished Category</label>
                  <select
                    value={outputCategory}
                    onChange={(e) => setOutputCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="Milled Flour & Grain Products">Milled Flour & Grain Products</option>
                    <option value="Bakery & Value Added Snacks">Bakery & Value Added Snacks</option>
                    <option value="Pasteurized Dairy Goods">Pasteurized Dairy Goods</option>
                    <option value="Packaged Horticulture">Packaged Horticulture</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Product Specification</label>
                  <input
                    type="text"
                    value={outputVariety}
                    onChange={(e) => setOutputVariety(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Pack / Output Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={outputQuantity}
                    onChange={(e) => setOutputQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Unit</label>
                  <select
                    value={outputUnit}
                    onChange={(e) => setOutputUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="PACKS">PACKS</option>
                    <option value="KG">KG</option>
                    <option value="CRATES">CRATES</option>
                    <option value="TONNES">TONNES</option>
                  </select>
                </div>
              </div>

              {/* Camera Evidence */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-700" />
                    <span>Processing Line Proof (Camera Only)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-3 py-1 bg-white border border-slate-200 hover:border-indigo-500 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{evidence ? 'Retake Photo' : 'Capture Line Proof'}</span>
                  </button>
                </div>

                {evidence ? (
                  <div className="flex items-center gap-3 bg-indigo-100/70 p-2.5 rounded-xl text-xs text-indigo-950">
                    <img
                      src={evidence.previewUrl}
                      alt="Captured Milling Proof"
                      className="w-12 h-12 rounded-lg object-cover border border-indigo-300 shrink-0"
                    />
                    <div>
                      <span className="font-bold block">Live Camera Photo Captured</span>
                      <span className="text-[10px] text-indigo-800">
                        Line milling proof verified with SHA-256 seal
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Snap a photo of the milling run, sealing station, or batch packaging line.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Processing & Formulation Notes</label>
                <textarea
                  rows={2}
                  value={processingNotes}
                  onChange={(e) => setProcessingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <button
                id="submit-transform-batch-btn"
                type="submit"
                disabled={isSubmitting || selectedParentIds.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Generating Lineage...' : 'Execute Transformation & Generate QR'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <CameraEvidenceCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureComplete={(ev) => setEvidence(ev)}
        batchContextTitle="Milling Line Transformation"
        stageName="Processing & Packaging Line"
      />

      {transferBatch && (
        <TransferBatchModal
          isOpen={!!transferBatch}
          onClose={() => setTransferBatch(null)}
          batch={transferBatch}
          currentRole="PROCESSOR"
          currentUserName={user.name}
          onTransferComplete={loadData}
        />
      )}

      {qrBatch && (
        <BatchQRModal
          isOpen={!!qrBatch}
          onClose={() => setQrBatch(null)}
          batch={qrBatch}
          onInspectBatch={onSelectBatch}
        />
      )}

      {feedbackBatch && (
        <UnifiedFeedbackModal
          isOpen={!!feedbackBatch}
          onClose={() => setFeedbackBatch(null)}
          initialBatchId={feedbackBatch.batchId}
          fromRole="PROCESSOR"
          targetRole="MANDI"
          targetEntityName="Mandi Aggregation Hub"
          submittedBy={user.name}
          onFeedbackSubmitted={loadData}
        />
      )}
    </div>
  );
};
