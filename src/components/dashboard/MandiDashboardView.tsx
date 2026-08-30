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
  Warehouse,
  CheckCircle2,
  Truck,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Award,
  Camera,
  Layers,
  Scale,
  Clock,
  Sparkles,
  MapPin,
  MessageSquare,
  Plus,
} from 'lucide-react';

interface MandiDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const MandiDashboardView: React.FC<MandiDashboardViewProps> = ({ user, onSelectBatch }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [incomingBatches, setIncomingBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [inspectingBatch, setInspectingBatch] = useState<Batch | null>(null);
  const [evidenceModalBatch, setEvidenceModalBatch] = useState<Batch | null>(null);
  const [feedbackBatch, setFeedbackBatch] = useState<Batch | null>(null);
  const [transferBatch, setTransferBatch] = useState<Batch | null>(null);
  const [qrBatch, setQrBatch] = useState<Batch | null>(null);

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
      const myBatches = await traceService.getBatchesForUser('MANDI', user.name, user.organizationName);
      const incoming = await traceService.getIncomingBatches('MANDI', user.organizationName);
      setBatches(myBatches);
      setIncomingBatches(incoming);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveIncoming = async (batch: Batch) => {
    try {
      await traceService.receiveBatch(
        batch.batchId,
        user.name,
        'MANDI',
        user.organizationName,
        `${user.location} Intake Yard Gate 2`,
        'Weighbridge calibrated and moisture tested at 12.0%. Grading: Grade A Premium.'
      );
      // Prompt feedback for the farmer
      setFeedbackBatch(batch);
      loadData();
    } catch (e) {
      console.error('Receive error:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <Warehouse className="w-3.5 h-3.5" />
              <span>APMC Mandi & Aggregation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Operator: {user.name} · {user.location}. Verify incoming farmer lots, record weighbridge calibration, conduct quality grading, and transfer to solar cold storage or processors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (batches[0]) setFeedbackBatch(batches[0]);
                else if (incomingBatches[0]) setFeedbackBatch(incomingBatches[0]);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Give Feedback / Rating</span>
            </button>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-teal-300 uppercase font-bold block">Intake Today</span>
              <span className="text-xl font-extrabold font-mono text-white">480 Q</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Avg Rating</span>
              <span className="text-xl font-extrabold font-mono text-white">95/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Farmer Batches to Inspect & Receive */}
      {incomingBatches.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 rounded-3xl border border-emerald-300/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-600 text-white rounded-lg animate-pulse">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Incoming Harvest Lots Awaiting Intake</h2>
                <p className="text-xs text-slate-600">Farmer lots arrived at gate requiring Mandi weighment and inspection</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full text-xs font-bold font-mono">
              {incomingBatches.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {incomingBatches.map((batch) => (
              <div
                key={batch.batchId}
                className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Farmer Score: {batch.scoreBreakdown.totalScore}/100
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{batch.productName}</h3>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Origin Producer:</span>
                      <span className="font-semibold text-slate-800">{batch.originFarmerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="font-semibold text-slate-800">
                        {batch.quantity} {batch.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Harvest Date:</span>
                      <span>{batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'Today'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEvidenceModalBatch(batch)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Live Photo Proof</span>
                  </button>
                  <button
                    id={`mandi-receive-btn-${batch.batchId}`}
                    onClick={() => handleReceiveIncoming(batch)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Receive & Rate Farmer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collected / Managed Batches in Mandi Hub */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Aggregated Inventory
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Mandi Storage & Outbound Lots</h2>
          </div>
          <span className="text-xs text-slate-500">{batches.length} total lots on record</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.batchId}
              id={`mandi-batch-card-${batch.batchId}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                    {batch.batchId}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    {batch.scoreBreakdown.totalScore}/100
                  </span>
                </div>

                <h3
                  onClick={() => onSelectBatch(batch.batchId)}
                  className="font-bold text-slate-900 text-sm group-hover:text-teal-700 cursor-pointer transition-colors"
                >
                  {batch.productName}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Origin Farmer:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {batch.originFarmerName}
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
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setQrBatch(batch)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR</span>
                </button>

                <button
                  onClick={() => setFeedbackBatch(batch)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1 border border-amber-200/80"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rate</span>
                </button>

                <button
                  id={`mandi-transfer-btn-${batch.batchId}`}
                  onClick={() => setTransferBatch(batch)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Transfer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandi Feedback & Reputation Hub */}
      <StakeholderFeedbackHub
        user={user}
        role="MANDI"
        batches={batches.length > 0 ? batches : incomingBatches}
        onSelectBatch={onSelectBatch}
      />

      {/* Modals */}
      {evidenceModalBatch && (
        <CameraEvidenceCaptureModal
          isOpen={!!evidenceModalBatch}
          onClose={() => setEvidenceModalBatch(null)}
          onCaptureComplete={async (ev) => {
            await traceService.addEvidenceToBatch(evidenceModalBatch.batchId, {
              previewUrl: ev.previewUrl,
              captureType: ev.captureType,
              capturedBy: user.name,
              captureLocation: `${user.location} Intake Bay`,
            });
            loadData();
          }}
          batchContextTitle={evidenceModalBatch.batchId}
          stageName="Mandi Weighbridge Inspection"
        />
      )}

      {feedbackBatch && (
        <UnifiedFeedbackModal
          isOpen={!!feedbackBatch}
          onClose={() => setFeedbackBatch(null)}
          initialBatchId={feedbackBatch.batchId}
          fromRole="MANDI"
          targetRole="FARMER"
          targetEntityName={feedbackBatch.originFarmerName || 'Farmer Producer'}
          submittedBy={user.name}
          onFeedbackSubmitted={loadData}
        />
      )}

      {transferBatch && (
        <TransferBatchModal
          isOpen={!!transferBatch}
          onClose={() => setTransferBatch(null)}
          batch={transferBatch}
          currentRole="MANDI"
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
    </div>
  );
};
