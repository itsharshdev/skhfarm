import React, { useState, useEffect } from 'react';
import { Batch, AppUser } from '../../types';
import { traceService } from '../../services/traceService';
import { BatchQRModal } from '../operations/BatchQRModal';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import { StakeholderFeedbackHub } from '../operations/StakeholderFeedbackHub';
import { StatusBadge } from '../common/StatusBadge';
import {
  Store,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  Award,
} from 'lucide-react';

interface RetailerDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const RetailerDashboardView: React.FC<RetailerDashboardViewProps> = ({
  user,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [incomingBatches, setIncomingBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

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
      const myBatches = await traceService.getBatchesForUser('RETAILER', user.name, user.organizationName);
      const incoming = await traceService.getIncomingBatches('RETAILER', user.organizationName);
      setBatches(myBatches);
      setIncomingBatches(incoming);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveStock = async (batch: Batch) => {
    try {
      await traceService.receiveBatch(
        batch.batchId,
        user.name,
        'RETAILER',
        user.organizationName,
        `${user.location} Retail Shelf Display Bay`,
        'Shipment received at retail store. Condition & seals verified. Added to active store shelf.'
      );
      setFeedbackBatch(batch);
      loadData();
    } catch (e) {
      console.error('Receive error:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-rose-900/80 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <Store className="w-3.5 h-3.5" />
              <span>Retail Shelf & Consumer Point of Sale</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Store Manager: {user.name} · {user.location}. Verify inbound shipments, display scannable shelf QR codes for shoppers, and monitor expiry horizons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-center min-w-[110px]">
              <span className="text-[10px] text-rose-300 uppercase font-bold block">Shelf Stock</span>
              <span className="text-xl font-extrabold font-mono text-white">{batches.length} Products</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center min-w-[110px]">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Consumer Trust</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">96/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Goods */}
      {incomingBatches.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 rounded-3xl border border-rose-200 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-600 text-white rounded-lg animate-pulse">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Inbound Shipments Arrived at Loading Bay</h2>
                <p className="text-xs text-slate-600">Stock from processors or cold storage ready for store shelf</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-200 text-rose-900 rounded-full text-xs font-bold font-mono">
              {incomingBatches.length} Incoming
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {incomingBatches.map((batch) => (
              <div
                key={batch.batchId}
                className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Score: {batch.scoreBreakdown.totalScore}/100
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{batch.productName}</h3>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supplier:</span>
                      <span className="font-semibold text-slate-800">{batch.currentOwner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="font-semibold text-slate-800">
                        {batch.quantity} {batch.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id={`retailer-receive-btn-${batch.batchId}`}
                  onClick={() => handleReceiveStock(batch)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Receive & Put on Shelf</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shelf Stock Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Store Inventory
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Active Shelf Produce & QR Labels</h2>
          </div>
          <span className="text-xs text-slate-500">{batches.length} Products Stocked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.batchId}
              id={`retail-shelf-card-${batch.batchId}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded">
                    {batch.batchId}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    {batch.scoreBreakdown.totalScore}/100
                  </span>
                </div>

                <h3
                  onClick={() => onSelectBatch(batch.batchId)}
                  className="font-bold text-slate-900 text-sm group-hover:text-rose-700 cursor-pointer transition-colors"
                >
                  {batch.productName}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Farm Origin:</span>
                    <span className="font-semibold text-slate-800">{batch.origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shelf Stock:</span>
                    <span className="font-semibold text-slate-800">
                      {batch.quantity} {batch.unit}
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
                <button
                  onClick={() => setQrBatch(batch)}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shelf QR</span>
                </button>

                <button
                  onClick={() => setFeedbackBatch(batch)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-amber-200/80 cursor-pointer"
                  title="Rate Supplier Freshness & Packaging"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rate</span>
                </button>

                <button
                  onClick={() => onSelectBatch(batch.batchId)}
                  className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-200 cursor-pointer"
                >
                  <span>Trace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retailer Feedback & Supplier Freshness Hub */}
      <StakeholderFeedbackHub
        user={user}
        role="RETAILER"
        batches={batches.length > 0 ? batches : incomingBatches}
        onSelectBatch={onSelectBatch}
      />

      {/* Modals */}
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
          fromRole="RETAILER"
          targetRole="PROCESSOR"
          targetEntityName="Distributor & Processor"
          submittedBy={user.name}
          onFeedbackSubmitted={loadData}
        />
      )}
    </div>
  );
};
