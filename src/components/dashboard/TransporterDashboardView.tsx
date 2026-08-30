import React, { useState, useEffect } from 'react';
import { Batch, AppUser } from '../../types';
import { traceService } from '../../services/traceService';
import { CameraEvidenceCaptureModal } from '../operations/CameraEvidenceCaptureModal';
import { TransferBatchModal } from '../operations/TransferBatchModal';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import { StakeholderFeedbackHub } from '../operations/StakeholderFeedbackHub';
import { StatusBadge } from '../common/StatusBadge';
import {
  Truck,
  MapPin,
  Thermometer,
  ShieldCheck,
  Camera,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Clock,
  Sparkles,
  MessageSquare,
  Award,
} from 'lucide-react';

interface TransporterDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const TransporterDashboardView: React.FC<TransporterDashboardViewProps> = ({
  user,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [evidenceModalBatch, setEvidenceModalBatch] = useState<Batch | null>(null);
  const [transferBatch, setTransferBatch] = useState<Batch | null>(null);
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
      const data = await traceService.getBatchesForUser('TRANSPORTER', user.name, user.organizationName);
      setBatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogTransitCheckpoint = async (batch: Batch) => {
    try {
      await traceService.receiveBatch(
        batch.batchId,
        user.name,
        'TRANSPORTER',
        user.organizationName,
        'Nashik-Pune Expressway Transit Corridor (KM 42 Checkpoint)',
        'Transit telemetry check: Reefer temperature steady at 16.5°C. Tamper-evident seal tag intact.'
      );
      loadData();
    } catch (e) {
      console.error('Checkpoint error:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-900/80 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Truck className="w-3.5 h-3.5" />
              <span>Cold-Chain Transit Logistics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Operator: {user.name} · Reefer Fleet #MH-17-EQ-8821. Record GPS transit checkpoints, maintain temperature custody, and capture live arrival evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-center min-w-[110px]">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">Active Consignments</span>
              <span className="text-xl font-extrabold font-mono text-white">{batches.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center min-w-[110px]">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Reefer Cabin</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">16.5°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batches in Transit */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Transit Consignments
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Active Transport Loads</h2>
          </div>
          <span className="text-xs text-slate-500">Live GPS & Cold-Chain Tracking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.batchId}
              id={`transporter-card-${batch.batchId}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                    {batch.batchId}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    {batch.scoreBreakdown.totalScore}/100
                  </span>
                </div>

                <h3
                  onClick={() => onSelectBatch(batch.batchId)}
                  className="font-bold text-slate-900 text-sm group-hover:text-amber-700 cursor-pointer transition-colors"
                >
                  {batch.productName}
                </h3>

                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Origin:</span>
                    <span className="font-bold text-slate-800">{batch.origin}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Current Location:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">
                      {batch.currentLocation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <StatusBadge status={batch.status} size="sm" />
                  </div>
                </div>
              </div>

              {/* Transit Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleLogTransitCheckpoint(batch)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-700" />
                  <span>Checkpoint</span>
                </button>

                <button
                  onClick={() => setFeedbackBatch(batch)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-amber-200/80 cursor-pointer"
                  title="Rate Loading/Unloading Facility & Turnaround"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rate</span>
                </button>

                <button
                  onClick={() => setEvidenceModalBatch(batch)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  title="Capture live proof"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setTransferBatch(batch)}
                  className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Deliver</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transporter Feedback & Gate Turnaround Ratings */}
      <StakeholderFeedbackHub
        user={user}
        role="TRANSPORTER"
        batches={batches}
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
              captureLocation: 'Reefer Van Transit Checkpoint',
            });
            loadData();
          }}
          batchContextTitle={evidenceModalBatch.batchId}
          stageName="In-Transit Reefer Verification"
        />
      )}

      {transferBatch && (
        <TransferBatchModal
          isOpen={!!transferBatch}
          onClose={() => setTransferBatch(null)}
          batch={transferBatch}
          currentRole="TRANSPORTER"
          currentUserName={user.name}
          onTransferComplete={loadData}
        />
      )}

      {feedbackBatch && (
        <UnifiedFeedbackModal
          isOpen={!!feedbackBatch}
          onClose={() => setFeedbackBatch(null)}
          initialBatchId={feedbackBatch.batchId}
          fromRole="TRANSPORTER"
          targetRole="WAREHOUSE"
          targetEntityName="Cold Storage & Mandi Facilities"
          submittedBy={user.name}
          onFeedbackSubmitted={loadData}
        />
      )}
    </div>
  );
};
