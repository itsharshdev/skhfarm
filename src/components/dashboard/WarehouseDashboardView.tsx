import React, { useState, useEffect } from 'react';
import { Batch, StorageUnit, AppUser } from '../../types';
import { traceService } from '../../services/traceService';
import { StorageConditionUpdateModal } from '../operations/StorageConditionUpdateModal';
import { StorageUnitDetailModal } from '../operations/StorageUnitDetailModal';
import { TransferBatchModal } from '../operations/TransferBatchModal';
import { CameraEvidenceCaptureModal } from '../operations/CameraEvidenceCaptureModal';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import { StakeholderFeedbackHub } from '../operations/StakeholderFeedbackHub';
import { BatchQRModal } from '../operations/BatchQRModal';
import { StatusBadge } from '../common/StatusBadge';
import {
  Sun,
  Warehouse,
  Thermometer,
  Zap,
  Battery,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Award,
} from 'lucide-react';

interface WarehouseDashboardViewProps {
  user: AppUser;
  onSelectBatch: (batchId: string) => void;
}

export const WarehouseDashboardView: React.FC<WarehouseDashboardViewProps> = ({
  user,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [incomingBatches, setIncomingBatches] = useState<Batch[]>([]);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<StorageUnit | null>(null);
  const [conditionModalBatch, setConditionModalBatch] = useState<Batch | null>(null);
  const [transferBatch, setTransferBatch] = useState<Batch | null>(null);
  const [qrBatch, setQrBatch] = useState<Batch | null>(null);
  const [feedbackBatch, setFeedbackBatch] = useState<Batch | null>(null);
  const [assignStorageBatch, setAssignStorageBatch] = useState<Batch | null>(null);
  const [selectedUnitIdToAssign, setSelectedUnitIdToAssign] = useState<string>('');

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
      const myBatches = await traceService.getBatchesForUser('WAREHOUSE', user.name, user.organizationName);
      const incoming = await traceService.getIncomingBatches('WAREHOUSE', user.organizationName);
      const units = await traceService.getStorageUnits();
      setBatches(myBatches);
      setIncomingBatches(incoming);
      setStorageUnits(units);
      if (units.length > 0) setSelectedUnitIdToAssign(units[0].storageUnitId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!assignStorageBatch || !selectedUnitIdToAssign) return;
    try {
      await traceService.assignStorageUnit(
        assignStorageBatch.batchId,
        selectedUnitIdToAssign,
        user.name,
        user.organizationName,
        'Allocated to Solar Smart Cold Storage Vault with continuous telemetry active.'
      );
      setAssignStorageBatch(null);
      loadData();
    } catch (e) {
      console.error('Assign error:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Cold Storage Hero Header */}
      <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-teal-800/80 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <Sun className="w-3.5 h-3.5" />
              <span>SKH030 Solar Smart Cold-Storage Infrastructure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Operator: {user.name} · {user.location}. Resilient off-grid cold preservation using decentralized solar arrays and LiFePO4 battery banks to protect shelf-life without grid disruption.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-center min-w-[120px]">
              <span className="text-[10px] text-teal-300 uppercase font-bold block">Solar Micro-Grid</span>
              <span className="text-lg font-extrabold font-mono text-emerald-300 flex items-center justify-center gap-1">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>4.8 kW</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center min-w-[120px]">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">LiFePO4 Reserve</span>
              <span className="text-lg font-extrabold font-mono text-emerald-300 flex items-center justify-center gap-1">
                <Battery className="w-4 h-4" />
                <span>96%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Solar Storage Units & Vaults Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Facility Telemetry
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Solar Smart Storage Vaults</h2>
          </div>
          <span className="text-xs text-slate-500">{storageUnits.length} Monitored Units</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {storageUnits.map((unit) => {
            const count = batches.filter((b) => b.storageUnit?.storageUnitId === unit.storageUnitId).length;
            return (
              <div
                key={unit.storageUnitId}
                id={`storage-unit-card-${unit.storageUnitId}`}
                onClick={() => setSelectedUnitForDetail(unit)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    {unit.storageUnitId}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>{unit.powerStatus}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                    {unit.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{unit.location}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                      <span>Safe Range:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {unit.safeTemperatureMin}°–{unit.safeTemperatureMax}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Solar Generation:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-700">
                      {unit.solarOutputWatts} W
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                      <span>Batches Stored:</span>
                    </span>
                    <span className="font-bold text-emerald-700 font-mono">{count} active</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-teal-700 group-hover:underline inline-flex items-center gap-1">
                    <span>Inspect Vault</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incoming Batches Awaiting Vault Assignment */}
      {incomingBatches.length > 0 && (
        <div className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 rounded-3xl border border-teal-300 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-teal-600 text-white rounded-lg animate-pulse">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Arrived Lots Awaiting Solar Vault Assignment</h2>
                <p className="text-xs text-slate-600">Assign incoming produce to monitored cold vaults</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-teal-200 text-teal-900 rounded-full text-xs font-bold font-mono">
              {incomingBatches.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {incomingBatches.map((batch) => (
              <div
                key={batch.batchId}
                className="p-5 rounded-2xl bg-white border border-teal-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Score: {batch.scoreBreakdown.totalScore}/100
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{batch.productName}</h3>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Origin:</span>
                      <span className="font-semibold text-slate-800">{batch.origin}</span>
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
                  id={`assign-storage-btn-${batch.batchId}`}
                  onClick={() => setAssignStorageBatch(batch)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>Assign to Solar Vault & Activate Sensor</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Stored Batches Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Active Inventory
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Cold Vault Stored Batches</h2>
          </div>
          <span className="text-xs text-slate-500">{batches.length} Stored Lots</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.batchId}
              id={`vault-batch-card-${batch.batchId}`}
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

                <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Storage Unit:</span>
                    <span className="font-bold text-teal-900">{batch.storageUnit?.name || 'Vault #04'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Live Temperature:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {batch.currentStorage?.temperature || 18.2}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Solar Power Status:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {batch.currentStorage?.powerStatus || 'SOLAR'} (Safe)
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  id={`update-telemetry-btn-${batch.batchId}`}
                  onClick={() => setConditionModalBatch(batch)}
                  className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-teal-200 cursor-pointer"
                >
                  <Thermometer className="w-3.5 h-3.5 text-teal-700" />
                  <span>Telemetry</span>
                </button>

                <button
                  id={`warehouse-rate-btn-${batch.batchId}`}
                  onClick={() => setFeedbackBatch(batch)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-amber-200/80 cursor-pointer"
                  title="Rate Intake Quality & Transport Condition"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rate</span>
                </button>

                <button
                  id={`warehouse-transfer-btn-${batch.batchId}`}
                  onClick={() => setTransferBatch(batch)}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warehouse / Cold Storage Feedback & Reputation Hub */}
      <StakeholderFeedbackHub
        user={user}
        role="WAREHOUSE"
        batches={batches.length > 0 ? batches : incomingBatches}
        onSelectBatch={onSelectBatch}
      />

      {/* Assign Storage Modal */}
      {assignStorageBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assign to Solar Cold Storage Vault</h3>
            <p className="text-xs text-slate-500">
              Batch: <strong className="text-slate-800">{assignStorageBatch.batchId}</strong> ({assignStorageBatch.productName})
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Vault / Unit</label>
              {storageUnits.map((u) => (
                <button
                  key={u.storageUnitId}
                  type="button"
                  onClick={() => setSelectedUnitIdToAssign(u.storageUnitId)}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition-all ${
                    selectedUnitIdToAssign === u.storageUnitId
                      ? 'border-teal-500 bg-teal-50/80 ring-1 ring-teal-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[10px] text-slate-500">{u.location} · {u.powerStatus}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-teal-700">
                    {u.safeTemperatureMin}°–{u.safeTemperatureMax}°C
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignStorageBatch(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm Placement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUnitForDetail && (
        <StorageUnitDetailModal
          isOpen={!!selectedUnitForDetail}
          onClose={() => setSelectedUnitForDetail(null)}
          storageUnit={selectedUnitForDetail}
          storedBatches={batches.filter((b) => b.storageUnit?.storageUnitId === selectedUnitForDetail.storageUnitId)}
          onSelectBatch={onSelectBatch}
        />
      )}

      {conditionModalBatch && (
        <StorageConditionUpdateModal
          isOpen={!!conditionModalBatch}
          onClose={() => setConditionModalBatch(null)}
          batch={conditionModalBatch}
          onUpdateComplete={loadData}
        />
      )}

      {transferBatch && (
        <TransferBatchModal
          isOpen={!!transferBatch}
          onClose={() => setTransferBatch(null)}
          batch={transferBatch}
          currentRole="WAREHOUSE"
          currentUserName={user.name}
          onTransferComplete={loadData}
        />
      )}

      {feedbackBatch && (
        <UnifiedFeedbackModal
          isOpen={!!feedbackBatch}
          onClose={() => setFeedbackBatch(null)}
          initialBatchId={feedbackBatch.batchId}
          fromRole="WAREHOUSE"
          targetRole="TRANSPORTER"
          targetEntityName="Reefer Logistics Carrier"
          submittedBy={user.name}
          onFeedbackSubmitted={loadData}
        />
      )}
    </div>
  );
};
