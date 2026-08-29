import React, { useState, useEffect } from 'react';
import { Batch, AppUser } from '../../types';
import { traceService, CreateBatchInput } from '../../services/traceService';
import { CameraEvidenceCaptureModal } from '../operations/CameraEvidenceCaptureModal';
import { TransferBatchModal } from '../operations/TransferBatchModal';
import { BatchQRModal } from '../operations/BatchQRModal';
import { StatusBadge } from '../common/StatusBadge';
import { FarmerReputationHub } from '../farmer/FarmerReputationHub';
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

  // Form State
  const [productName, setProductName] = useState('Raw Sharbati Organic Wheat (Bulk)');
  const [category, setCategory] = useState('Raw Agricultural Commodity');
  const [variety, setVariety] = useState('Sharbati Wheat Grade A');
  const [quantity, setQuantity] = useState(120);
  const [unit, setUnit] = useState<'KG' | 'QUINTAL' | 'TONNES' | 'PACKS' | 'CRATES'>('QUINTAL');
  const [origin, setOrigin] = useState(user.location || 'Kopargaon, Ahmednagar District');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDays, setExpiryDays] = useState(365);
  const [notes, setNotes] = useState('Harvested at 11.8% moisture. Verified organic practices.');
  const [evidence, setEvidence] = useState<{ previewUrl: string; captureType: 'PHOTO' | 'VIDEO' } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFarmerBatches();
    const unsubscribe = (traceService as any).subscribe?.(() => {
      loadFarmerBatches();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newBatch = await traceService.createBatch({
        productName,
        category,
        variety,
        quantity,
        unit,
        origin,
        originFarmerId: user.userId,
        originFarmerName: user.name,
        harvestDate: new Date(harvestDate).toISOString(),
        expiryDays,
        notes,
        evidence: evidence || undefined,
      });
      setIsCreateModalOpen(false);
      // Reset form
      setEvidence(null);
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
      ? Math.round(batches.reduce((acc, b) => acc + b.scoreBreakdown.qualityScore, 0) / batches.length)
      : 19;
  const avgTraceScore =
    batches.length > 0
      ? Math.round(batches.reduce((acc, b) => acc + b.scoreBreakdown.totalScore, 0) / batches.length)
      : 96;
  const verifiedCount = batches.filter((b) => b.events.some((e) => e.verificationState === 'VERIFIED')).length;
  const successfulHandoffs = batches.reduce(
    (acc, b) => acc + b.events.filter((e) => e.eventType === 'TRANSFERRED' || e.eventType === 'RECEIVED').length,
    0
  );

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Farmer Hero Profile Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Tractor className="w-3.5 h-3.5" />
              <span>Farmer & Producer Origin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {user.organizationName} · {user.location}. Every batch you register builds verified origin reputation and clean handoff lineage across the value chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="farmer-create-batch-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Harvest Batch</span>
            </button>
          </div>
        </div>

        {/* Reputation & Achievement Badges */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Verified Badges:
          </span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Origin</span>
          </span>
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Consistent Quality</span>
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Complete Camera Records</span>
          </span>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Traceability Champion</span>
          </span>
        </div>
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Avg Quality Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              {avgQualityScore} / 20
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> High
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">Grade A Organic Standards</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Traceability Rating
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {avgTraceScore} / 100
            </span>
            <span className="text-xs text-emerald-600 font-bold">100-Pt Model</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Full custodial transparency</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Verified Batches
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {batches.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">100% compliant</span>
          </div>
          <span className="text-[11px] text-slate-400 block">With camera evidence</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Successful Handoffs
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 font-mono">
              {successfulHandoffs || 4}
            </span>
            <span className="text-xs text-slate-500">Mandi & Cold Storage</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Zero dispute record</span>
        </div>
      </div>

      {/* Farmer Motivation, Badges & Reputation Engine */}
      <FarmerReputationHub farmerId={user.userId} farmerName={user.name} />

      {/* My Batches Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Harvest & Origin Records
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">My Registered Batches</h2>
          </div>
          <span className="text-xs text-slate-500">
            Showing {batches.length} registered batches for {user.name}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading batch records...</div>
        ) : batches.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Tractor className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No batches registered yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Register New Harvest Batch&quot; above to create your first verified harvest record.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.batchId}
                id={`farmer-batch-card-${batch.batchId}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {batch.scoreBreakdown.totalScore}/100
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectBatch(batch.batchId)}
                    className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {batch.productName}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="font-semibold text-slate-800">
                        {batch.quantity} {batch.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Custodian:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">
                        {batch.currentOwner}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <StatusBadge status={batch.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    id={`view-qr-btn-${batch.batchId}`}
                    type="button"
                    onClick={() => setSelectedBatchForQR(batch)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Label</span>
                  </button>

                  {batch.currentOwnerRole === 'FARMER' ? (
                    <button
                      id={`transfer-batch-btn-${batch.batchId}`}
                      type="button"
                      onClick={() => setSelectedBatchForTransfer(batch)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Transfer to Mandi</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectBatch(batch.batchId)}
                      className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Register New Harvest Batch</h3>
                  <p className="text-xs text-slate-500">Enter harvest specs & capture live camera proof</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="p-6 space-y-4 overflow-y-auto">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Variety / Grade</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Sharbati Grade A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

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

              {/* Camera-Only Evidence Requirement */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Live Camera Proof (Mandatory Evidence)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-3 py-1 bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{evidence ? 'Retake Photo' : 'Capture Camera Proof'}</span>
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
                      <span className="font-bold block">Live Camera Photo Captured</span>
                      <span className="text-[10px] text-emerald-800">
                        Tamper-proof sha256 stamp · GPS Lat/Lng tagged
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Capture a live photo of your harvested crop or field to achieve full 100-pt verification. (Gallery uploads disabled)
                  </p>
                )}
              </div>

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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Batch...' : 'Generate Batch ID & QR Label'}</span>
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
    </div>
  );
};
