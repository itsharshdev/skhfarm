import React, { useState, useEffect } from 'react';
import { Batch, StorageUnit, AppUser } from '../../types';
import { traceService } from '../../services/traceService';
import { DataRecoveryHubModal } from '../integrity/DataRecoveryHubModal';
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Database,
  Layers,
  Activity,
  AlertTriangle,
  Sun,
  Eye,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface AdminDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user, onSelectBatch }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      const allB = await traceService.getAllBatches();
      const allU = await traceService.getStorageUnits();
      setBatches(allB);
      setStorageUnits(allU);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await traceService.resetToDemoData();
      setMessage('System state reset to verified Super-PS default dataset successfully.');
      setTimeout(() => setMessage(null), 4000);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSimulateQuickHarvest = async () => {
    try {
      const b = await traceService.createBatch({
        productName: 'Organic Alphonso Mangoes (Grade A)',
        category: 'Fresh Horticulture & Fruit',
        variety: 'Ratnagiri GI Alphonso',
        quantity: 250,
        unit: 'CRATES',
        origin: 'Ratnagiri Coastal Horticulture Zone',
        originFarmerId: 'FAR-MH-992',
        originFarmerName: 'Ganesh Patil (Ratnagiri Mango FPO)',
        expiryDays: 30,
        notes: 'Simulated real-time harvest lot with pre-cooling test passed.',
      });
      setMessage(`Generated live test batch: ${b.batchId}`);
      setTimeout(() => setMessage(null), 4000);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const avgNetworkScore =
    batches.length > 0
      ? Math.round(batches.reduce((acc, b) => acc + b.scoreBreakdown.totalScore, 0) / batches.length)
      : 88;

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Administration & Network Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Network Control & Data Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Real-time ledger monitor for the Farm Tracer Super-PS pilot across Maharashtra agricultural corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsRecoveryModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-200" />
              <span>Disaster Recovery Center</span>
            </button>

            <button
              onClick={handleSimulateQuickHarvest}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Harvest Batch</span>
            </button>

            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Ledger Batches
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {batches.length}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium block">All value-chain stages</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Solar Storage Hubs
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 font-mono">
            {storageUnits.length}
          </span>
          <span className="text-[11px] text-slate-400 block">Active Telemetry Sensors</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Network Avg Score
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
            {avgNetworkScore}/100
          </span>
          <span className="text-[11px] text-slate-400 block">100-Point Dynamic Model</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Live Camera Proofs
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 font-mono">
            {batches.reduce((acc, b) => acc + b.evidences.length, 0)}
          </span>
          <span className="text-[11px] text-slate-400 block">SHA-256 Validated</span>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">All Network Batches</h2>
          <span className="text-xs text-slate-500">{batches.length} Items</span>
        </div>

        <div className="space-y-2">
          {batches.map((b) => (
            <div
              key={b.batchId}
              onClick={() => onSelectBatch(b.batchId)}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {b.batchId}
                  </span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {b.productName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {b.origin} → {b.currentOwner} ({b.currentOwnerRole})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-slate-900">
                  {b.scoreBreakdown.totalScore}/100
                </span>
                <Eye className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataRecoveryHubModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onInspectBatch={onSelectBatch}
      />
    </div>
  );
};
