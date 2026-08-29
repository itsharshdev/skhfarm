import React from 'react';
import { StorageUnit, Batch } from '../../types';
import { Sun, Warehouse, Zap, Battery, Thermometer, ShieldCheck, X, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

interface StorageUnitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageUnit: StorageUnit;
  storedBatches: Batch[];
  onSelectBatch?: (batchId: string) => void;
}

export const StorageUnitDetailModal: React.FC<StorageUnitDetailModalProps> = ({
  isOpen,
  onClose,
  storageUnit,
  storedBatches,
  onSelectBatch,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="storage-unit-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Sun className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{storageUnit.name}</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                  {storageUnit.storageUnitId}
                </span>
              </div>
              <p className="text-xs text-slate-500">{storageUnit.location}</p>
            </div>
          </div>
          <button
            id="close-storage-detail-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Solar & Power Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Power Source</span>
              <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs sm:text-sm">
                <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{storageUnit.powerStatus}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block">Resilience: High</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Solar Array Yield</span>
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs sm:text-sm">
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{storageUnit.solarOutputWatts || 4200} W</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium block">Status: {storageUnit.solarStatus}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Battery Reserve</span>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs sm:text-sm">
                <Battery className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{storageUnit.batteryPercentage || 96}%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">LiFePO4 Backup</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Safe Temp Range</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs sm:text-sm">
                <Thermometer className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  {storageUnit.safeTemperatureMin}°–{storageUnit.safeTemperatureMax}°C
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Capacity: {storageUnit.capacity}</span>
            </div>
          </div>

          {/* Super PS SKH030 Compliance Seal */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>SKH030 Solar Smart Cold-Storage Standard</span>
              </div>
              <p className="text-xs text-slate-300">
                Off-grid capable cooling preserving perishable produce during rural power outages.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg shrink-0">
              AUDITED COMPLIANT
            </span>
          </div>

          {/* Stored Batches in this unit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-slate-600" />
                <span>Batches Stored in this Vault ({storedBatches.length})</span>
              </h4>
              <span className="text-xs text-slate-500">Live Inventory</span>
            </div>

            {storedBatches.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-500">
                No active batches currently allocated to this storage unit.
              </div>
            ) : (
              <div className="space-y-2">
                {storedBatches.map((b) => (
                  <div
                    key={b.batchId}
                    onClick={() => {
                      if (onSelectBatch) {
                        onSelectBatch(b.batchId);
                        onClose();
                      }
                    }}
                    className="cursor-pointer p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between group"
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
                        {b.quantity} {b.unit} · {b.currentStorage?.temperature || 18.2}°C ({b.currentStorage?.conditionStatus || 'SAFE'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <span>{b.scoreBreakdown.totalScore}/100</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
