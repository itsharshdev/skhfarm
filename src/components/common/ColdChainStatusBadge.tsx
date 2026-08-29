import React from 'react';
import { StorageCondition, StorageUnit } from '../../types';
import { Thermometer, Droplets, Sun, Zap, ShieldCheck, AlertTriangle, BatteryCharging, Warehouse } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ColdChainStatusBadgeProps {
  storageCondition?: StorageCondition;
  storageUnit?: StorageUnit;
  compact?: boolean;
}

export const ColdChainStatusBadge: React.FC<ColdChainStatusBadgeProps> = ({
  storageCondition,
  storageUnit,
  compact = false,
}) => {
  if (!storageCondition && !storageUnit) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
        No active cold-chain storage data recorded for this batch.
      </div>
    );
  }

  const condition = storageCondition || {
    conditionId: 'COND-DEFAULT',
    batchId: 'BATCH-DEFAULT',
    storageUnitId: storageUnit?.storageUnitId || 'SU-01',
    storageUnitName: storageUnit?.name || 'Storage Vault',
    location: storageUnit?.location || 'Central Facility',
    recordedAt: new Date().toISOString(),
    temperature: 18.2,
    humidity: 54,
    powerStatus: storageUnit?.powerStatus || 'SOLAR',
    solarStatus: storageUnit?.solarStatus || 'OPTIMAL',
    conditionStatus: 'SAFE',
    notes: 'Maintained in optimal solar-conditioned environment.',
    source: 'SIMULATED_SENSOR_NODE',
    demoState: 'DEMO_SIMULATED',
  };

  const isSafe = condition.conditionStatus === 'SAFE';
  const isWarning = condition.conditionStatus === 'WARNING';

  const safeMin = storageUnit?.safeTemperatureMin ?? 15.0;
  const safeMax = storageUnit?.safeTemperatureMax ?? 23.0;

  return (
    <div
      id="cold-chain-safety-card"
      className={`rounded-2xl border transition-all ${
        isSafe
          ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-emerald-200 shadow-sm'
          : isWarning
          ? 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border-amber-200 shadow-sm'
          : 'bg-gradient-to-br from-rose-50/70 via-white to-red-50/40 border-rose-200 shadow-sm'
      } p-4 md:p-6`}
    >
      {/* Super PS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isSafe ? 'bg-emerald-100 text-emerald-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                SKH029 · SKH030 Cold-Chain
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                {condition.demoState === 'DEMO_SIMULATED' ? 'Simulated Telemetry' : 'Live IoT'}
              </span>
            </div>
            <h4 className="text-base md:text-lg font-bold text-slate-900 mt-0.5">
              “Is it safe right now?” — Storage Condition Monitor
            </h4>
          </div>
        </div>

        <StatusBadge status={condition.conditionStatus} size="md" />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-4">
        {/* Core Temperature */}
        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              Temperature
            </span>
            <span className="text-[10px] text-slate-400">Core</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className={`text-xl md:text-2xl font-black ${isSafe ? 'text-slate-900' : isWarning ? 'text-amber-700' : 'text-rose-700'}`}>
              {condition.temperature}°C
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Target: <span className="font-semibold text-slate-700">{safeMin}°C to {safeMax}°C</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              Humidity (RH)
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-slate-900">
              {condition.humidity}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Safe: <span className="font-semibold text-slate-700">45% – 70%</span>
          </div>
        </div>

        {/* Power Source */}
        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Power Source
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs font-bold uppercase">
              {condition.powerStatus}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-emerald-600" />
            Battery: <span className="font-semibold text-emerald-700">{storageUnit?.batteryPercentage || 94}%</span>
          </div>
        </div>

        {/* Solar Generation */}
        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              Solar Unit
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-sm md:text-base font-bold text-slate-900 truncate">
              {storageUnit?.solarOutputWatts ? `${(storageUnit.solarOutputWatts / 1000).toFixed(1)} kW Generation` : 'Active Solar 94%'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Optimal Solar Yield</span>
          </div>
        </div>
      </div>

      {/* Location & Unit Context */}
      <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-700">Storage Facility: </span>
          <span>{condition.storageUnitName} ({condition.location})</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Last Reading: <span className="font-mono">{new Date(condition.recordedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Honest Prototype Note */}
      <div className="mt-2.5 px-3 py-1.5 bg-slate-100/80 rounded-lg text-[11px] text-slate-600 flex items-center gap-1.5">
        <span className="font-semibold text-slate-700 shrink-0">Demo Notice:</span>
        <span className="truncate">
          Readings reflect prototype simulation of smart solar storage nodes (SKH030). Real IoT sensors connect via Supabase in future phases.
        </span>
      </div>
    </div>
  );
};
