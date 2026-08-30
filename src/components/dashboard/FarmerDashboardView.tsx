import React, { useState, useEffect } from 'react';
import { Batch, AppUser } from '../../types';
import { traceService, CreateBatchInput } from '../../services/traceService';
import { CameraEvidenceCaptureModal } from '../operations/CameraEvidenceCaptureModal';
import { TransferBatchModal } from '../operations/TransferBatchModal';
import { BatchQRModal } from '../operations/BatchQRModal';
import { StatusBadge } from '../common/StatusBadge';
import { FarmerReputationHub } from '../farmer/FarmerReputationHub';
import { FarmerFeedbackHub } from '../farmer/FarmerFeedbackHub';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import {
  Tractor,
  Plus,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Camera,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Truck,
  TrendingUp,
  MapPin,
  FileCheck,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  MessageSquare,
  X,
} from 'lucide-react';

interface FarmerDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const FarmerDashboardView: React.FC<FarmerDashboardViewProps> = ({ user, onSelectBatch }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatchForTransfer, setSelectedBatchForTransfer] = useState<Batch | null>(null);
  const [selectedBatchForQR, setSelectedBatchForQR] = useState<Batch | null>(null);
  const [selectedBatchForFeedback, setSelectedBatchForFeedback] = useState<Batch | null>(null);

  // Form State
  const [productName, setProductName] = useState('Raw Sharbati Organic Wheat (Bulk)');
  const [category, setCategory] = useState('Raw Agricultural Commodity');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState(120);
  const [unit, setUnit] = useState<'KG' | 'QUINTAL' | 'TONNES' | 'PACKS' | 'CRATES'>('QUINTAL');
  const [origin, setOrigin] = useState(user.location || 'Kopargaon, Ahmednagar District');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDays, setExpiryDays] = useState(365);
  const [notes, setNotes] = useState('Harvested at 11.8% moisture. Verified organic practices.');
  const [evidence, setEvidence] = useState<{ previewUrl: string; captureType: 'PHOTO' | 'VIDEO' } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lab Test Certificate State (Required to unlock Variety/Grade selection)
  const [labCertificate, setLabCertificate] = useState<{
    certificateId: string;
    title: string;
    issuer: string;
    documentRef: string;
    pesticidePpm: string;
    fileUrl?: string;
  } | null>(null);

  useEffect(() => {
    loadFarmerBatches();
    const unsubscribe = (traceService as any).subscribe?.(() => {
      loadFarmerBatches();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user.name, user.organizationName]);

  const loadFarmerBatches = async () => {
    setLoading(true);
    try {
      const data = await traceService.getBatchesForUser('FARMER', user.name, user.organizationName);
      setBatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachDefaultLabCertificate = () => {
    const certCode = `NABL-MH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setLabCertificate({
      certificateId: certCode,
      title: 'NABL Accredited Soil & Pesticide Residue Test Certificate',
      issuer: 'AgriTest Laboratories NABL #4912',
      documentRef: `DOC-${certCode}`,
      pesticidePpm: '0.00 ppm (Zero Chemical Residue)',
      fileUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
    });
    if (!variety) {
      setVariety('Sharbati Gold Grade A+ (Export Quality - Zero Residue)');
    }
  };

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labCertificate) {
      alert('Please upload/attach a Lab Test Certificate to certify crop grade and variety before generating the batch QR.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBatch = await traceService.createBatch({
        productName,
        category,
        variety: variety || 'Sharbati Gold Grade A+ (Certified)',
        quantity,
        unit,
        origin,
        originFarmerId: user.userId,
        originFarmerName: user.name,
        harvestDate: new Date(harvestDate).toISOString(),
        expiryDays,
        notes,
        evidence: evidence || undefined,
        labCertificate: labCertificate || undefined,
      });

      setIsCreateModalOpen(false);
      // Reset form
      setEvidence(null);
      setLabCertificate(null);
      setVariety('');
      
      // Reload batches and immediately open QR Modal
      await loadFarmerBatches();
      setSelectedBatchForQR(newBatch);
    } catch (err) {
      console.error('Batch creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Farmer metrics
  const avgQualityScore =
    batches.length > 0
      ? Math.round(batches.reduce((acc, b) => acc + (b.scoreBreakdown?.qualityScore || 19), 0) / batches.length)
      : 20;
  const avgTraceScore =
    batches.length > 0
      ? Math.round(batches.reduce((acc, b) => acc + (b.scoreBreakdown?.totalScore || 95), 0) / batches.length)
      : 98;
  const verifiedCount = batches.filter((b) => b.events?.some((e) => e.verificationState === 'VERIFIED')).length;
  const successfulHandoffs = batches.reduce(
    (acc, b) => acc + (b.events?.filter((e) => e.eventType === 'TRANSFERRED' || e.eventType === 'RECEIVED').length || 0),
    0
  );

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Producer Hero Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/80 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Tractor className="w-3.5 h-3.5" />
              <span>Farmer / Producer Origin Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk',sans-serif]">
              {user.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {user.organizationName || 'Organic Grower Collective'} · {user.location || 'Kopargaon, Ahmednagar'}
            </p>
          </div>

          {/* Primary Action: Create Harvest Batch */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="farmer-create-batch-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Harvest Batch</span>
            </button>
          </div>
        </div>

        {/* Farmer Top Metrics Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-emerald-900/60">
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Trace Score</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-extrabold font-mono text-white">{avgTraceScore}</span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Quality Score</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-extrabold font-mono text-emerald-400">{avgQualityScore}</span>
              <span className="text-xs text-slate-500">/20</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Batches</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-extrabold font-mono text-white">{batches.length}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Handoffs</span>
              <Truck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-extrabold font-mono text-amber-300">{successfulHandoffs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Reputation & Badges Loop */}
      <FarmerReputationHub user={user} batches={batches} />

      {/* Farmer Voice & Multi-Stakeholder Feedback Hub */}
      <FarmerFeedbackHub user={user} batches={batches} onSelectBatch={onSelectBatch} />

      {/* Batches Registered by this Farmer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Harvest Lot Registry
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">My Registered Produce Batches</h2>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Harvest Batch</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading farmer produce records...</div>
        ) : batches.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Tractor className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">No Harvest Lots Registered Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Register your first agricultural batch with live camera evidence and NABL lab certificate to generate instant public QR codes.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              + Register Your First Harvest Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch) => (
              <div
                key={batch.batchId}
                id={`farmer-batch-card-${batch.batchId}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {batch.scoreBreakdown?.totalScore || 96}/100
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectBatch(batch.batchId)}
                    className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {batch.productName}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Variety/Grade:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[130px]">{batch.variety || 'Certified Grade A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Harvest Yield:</span>
                      <span className="font-bold text-slate-800">
                        {batch.quantity} {batch.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Current Status:</span>
                      <StatusBadge status={batch.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`view-qr-btn-${batch.batchId}`}
                      type="button"
                      onClick={() => setSelectedBatchForQR(batch)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR</span>
                    </button>

                    <button
                      id={`rate-batch-btn-${batch.batchId}`}
                      type="button"
                      onClick={() => setSelectedBatchForFeedback(batch)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Rate Mandi Buyer or Storage for this Batch"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                      <span>Rate</span>
                    </button>
                  </div>

                  {batch.currentOwnerRole === 'FARMER' ? (
                    <button
                      id={`transfer-batch-btn-${batch.batchId}`}
                      type="button"
                      onClick={() => setSelectedBatchForTransfer(batch)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Transfer to Mandi</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectBatch(batch.batchId)}
                      className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Inspect Trace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Creation Modal */}
      {isCreateModalOpen && (
        <div
          id="create-batch-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk',sans-serif]">
                    Register New Harvest Batch
                  </h3>
                  <p className="text-xs text-slate-500">Enter harvest specs, attach NABL lab report, and capture camera proof</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* 1. Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Product / Crop Name</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Raw Sharbati Organic Wheat (Bulk)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* 2. Commodity Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Commodity Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Raw Agricultural Commodity">Raw Agricultural Commodity</option>
                  <option value="Fresh Horticulture & Fruit">Fresh Horticulture & Fruit</option>
                  <option value="Perishable Dairy">Perishable Dairy</option>
                  <option value="Pulses & Legumes">Pulses & Legumes</option>
                </select>
              </div>

              {/* 3. MANDATORY LAB TEST CERTIFICATE SECTION (Unlocks Variety / Grade) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    <span>Lab Test Certificate (Soil & Residue Analysis)</span>
                  </span>
                  {labCertificate ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Unlocked Grade Selection</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Required to Select Grade</span>
                    </span>
                  )}
                </div>

                {labCertificate ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">{labCertificate.title}</span>
                      <button
                        type="button"
                        onClick={() => setLabCertificate(null)}
                        className="text-rose-600 hover:text-rose-800 p-1 text-[11px] font-semibold"
                        title="Remove Certificate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-emerald-800 font-mono">
                      <span>Ref: {labCertificate.documentRef}</span>
                      <span>·</span>
                      <span>{labCertificate.issuer}</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700">
                      Pesticide Residue: {labCertificate.pesticidePpm}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500">
                      Upload or attach an accredited NABL lab test certificate verifying chemical residue & moisture content to certify variety quality.
                    </p>
                    <button
                      type="button"
                      onClick={handleAttachDefaultLabCertificate}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Attach NABL Certified Residue Report (Unlocks Grade Selection)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Crop Variety & Quality Grade (LOCKED UNTIL LAB CERTIFICATE IS ATTACHED) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    {labCertificate ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>Crop Variety / Grade Quality Classification</span>
                  </label>
                  {!labCertificate && (
                    <span className="text-[10px] font-bold text-amber-700">Locked</span>
                  )}
                </div>

                {labCertificate ? (
                  <select
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Sharbati Gold Grade A+ (Export Quality - Zero Residue)">
                      Sharbati Gold Grade A+ (Export Quality - Zero Residue)
                    </option>
                    <option value="Sharbati Standard Grade A (NABL Certified Organic)">
                      Sharbati Standard Grade A (NABL Certified Organic)
                    </option>
                    <option value="HD-2967 High Protein Grade A (Lab Tested)">
                      HD-2967 High Protein Grade A (Lab Tested)
                    </option>
                    <option value="Lokwan Premium Grade 1 (Pesticide Safe)">
                      Lokwan Premium Grade 1 (Pesticide Safe)
                    </option>
                    <option value="Regional FPO Certified Grade A">
                      Regional FPO Certified Grade A
                    </option>
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value="🔒 Locked: Attach Lab Test Certificate above to unlock Grade selection"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 font-medium cursor-not-allowed"
                  />
                )}
              </div>

              {/* 5. Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Harvest Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="QUINTAL">QUINTAL (100 kg)</option>
                    <option value="KG">KG</option>
                    <option value="TONNES">TONNES</option>
                    <option value="CRATES">CRATES</option>
                    <option value="PACKS">PACKS</option>
                  </select>
                </div>
              </div>

              {/* 6. Harvest Date & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="7"
                    max="730"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* 7. Origin Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Farm Origin Location</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* 8. Camera-Only Live Photo/Video Evidence Requirement */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Live Camera Proof (Live Photo / Live 6s Video Only)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-3 py-1 bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{evidence ? 'Retake Camera Proof' : 'Capture Live Proof'}</span>
                  </button>
                </div>

                {evidence ? (
                  <div className="flex items-center gap-3 bg-emerald-100/70 p-2.5 rounded-xl text-xs text-emerald-950">
                    <img
                      src={evidence.previewUrl}
                      alt="Captured Harvest Proof"
                      className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shrink-0"
                    />
                    <div>
                      <span className="font-bold block">Live Camera Proof Captured ({evidence.captureType})</span>
                      <span className="text-[10px] text-emerald-800">
                        Tamper-proof sha256 stamp · GPS Lat/Lng tagged (Gallery upload disabled)
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Capture a live photo or 6-second video of the harvest lot using your camera. File uploads are disabled to enforce real-world proof.
                  </p>
                )}
              </div>

              {/* 9. Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Harvest / Quality Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Moisture 11.8%, natural manure used, zero synthetic sprays."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>

              <button
                id="submit-create-harvest-batch-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Batch & Generating QR...' : 'Generate Batch ID & QR Label'}</span>
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
        batchContextTitle="New Harvest Batch"
        stageName="Farm Harvest Proof"
      />

      {selectedBatchForTransfer && (
        <TransferBatchModal
          isOpen={!!selectedBatchForTransfer}
          onClose={() => setSelectedBatchForTransfer(null)}
          batch={selectedBatchForTransfer}
          currentRole="FARMER"
          currentUserName={user.name}
          onTransferComplete={loadFarmerBatches}
        />
      )}

      {selectedBatchForQR && (
        <BatchQRModal
          isOpen={!!selectedBatchForQR}
          onClose={() => setSelectedBatchForQR(null)}
          batch={selectedBatchForQR}
          onInspectBatch={onSelectBatch}
        />
      )}

      {selectedBatchForFeedback && (
        <UnifiedFeedbackModal
          isOpen={!!selectedBatchForFeedback}
          onClose={() => setSelectedBatchForFeedback(null)}
          initialBatchId={selectedBatchForFeedback.batchId}
          fromRole="FARMER"
          submittedBy={user.name}
          targetRole={selectedBatchForFeedback.currentOwnerRole === 'FARMER' ? 'MANDI' : selectedBatchForFeedback.currentOwnerRole}
          onFeedbackSubmitted={() => {
            loadFarmerBatches();
          }}
        />
      )}
    </div>
  );
};
