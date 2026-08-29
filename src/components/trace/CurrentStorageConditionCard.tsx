import React from 'react';
import { StorageCondition, StorageUnit } from '../../types';
import {
  Sun,
  Thermometer,
  Droplets,
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
  MapPin,
  CheckCircle2,
  Activity,
  ChevronRight,
} from 'lucide-react';

interface CurrentStorageConditionCardProps {
  storageCondition?: StorageCondition;
  storageUnit?: StorageUnit;
  productCategory?: string;
}

export const CurrentStorageConditionCard: React.FC<CurrentStorageConditionCardProps> = ({
  storageCondition,
  storageUnit,
  productCategory,
}) => {
  // Default values for resilient fallback
  const temp = storageCondition?.temperature ?? (productCategory?.includes('Apple') ? 2.8 : 18.2);
  const humidity = storageCondition?.humidity ?? (productCategory?.includes('Apple') ? 91 : 54);
  const powerSource = storageCondition?.powerStatus ?? 'SOLAR';
  const solarStatus = storageCondition?.solarStatus ?? 'OPTIMAL';
  const isSafe = (storageCondition?.conditionStatus ?? 'SAFE') === 'SAFE';
  const location = storageCondition?.location || storageUnit?.location || 'Shirdi Highway Hub, Kopargaon';
  const unitName = storageCondition?.storageUnitName || storageUnit?.name || 'MahaAgro Solar Cool Unit #04';
  const recordedAt = storageCondition?.recordedAt ? new Date(storageCondition.recordedAt).toLocaleString() : 'Just now (Simulated Node)';

  // Safe limits based on produce type
  let minSafeTemp = 15.0;
  let maxSafeTemp = 23.0;
  let targetDesc = 'Dry grain & sealed bakery conditioning';

  if (productCategory?.includes('Apple') || productCategory?.includes('Horticulture')) {
    minSafeTemp = 0.5;
    maxSafeTemp = 4.0;
    targetDesc = 'High-humidity apple cold vault preservation';
  } else if (productCategory?.includes('Dairy') || productCategory?.includes('Milk')) {
    minSafeTemp = 1.0;
    maxSafeTemp = 4.5;
    targetDesc = 'Ultra-perishable dairy pasteurization chilling';
  } else if (productCategory?.includes('Onion')) {
    minSafeTemp = 18.0;
    maxSafeTemp = 24.0;
    targetDesc = 'Dry ambient solar draft ventilation';
  }

  // Calculate percentage along a 0°C to 35°C scale for visual temperature bar
  const tempPercent = Math.min(100, Math.max(0, ((temp - 0) / 35) * 100));
  const minSafePercent = Math.min(100, Math.max(0, ((minSafeTemp - 0) / 35) * 100));
  const maxSafePercent = Math.min(100, Math.max(0, ((maxSafeTemp - 0) / 35) * 100));

  return (
    <div
      id="super-ps-storage-condition-card"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-7 flex flex-col justify-between"
    >
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                <Sun className="w-4 h-4 text-teal-700" />
              </div>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Solar Micro-Climate & Storage Monitor
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              “Is it safe right now?”
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isSafe
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {isSafe ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WITHIN SAFE CONDITIONS</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>TEMPERATURE EXCURSION</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Live Gauges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Gauge 1: Temperature */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                Live Temperature
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                Target: {minSafeTemp}°–{maxSafeTemp}°C
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {temp.toFixed(1)}
              </span>
              <span className="text-base font-bold text-slate-500">°C</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{targetDesc}</p>
          </div>

          {/* Gauge 2: Relative Humidity */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                Air Humidity
              </span>
              <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold">
                Monitored
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {humidity}
              </span>
              <span className="text-base font-bold text-slate-500">% RH</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">Anti-condensation sensor node</p>
          </div>

          {/* Gauge 3: Solar Generation & Battery */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Power Generation
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                {powerSource}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {solarStatus === 'OPTIMAL' ? '4.15' : '1.80'}
              </span>
              <span className="text-xs font-bold text-slate-500">kW Solar PV</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <BatteryCharging className="w-3 h-3 text-emerald-600" />
                Battery: 94%
              </span>
              <span className="text-emerald-700 font-semibold">Resilient Grid-Free</span>
            </div>
          </div>
        </div>

        {/* Visual Temperature Safe-Range Slider Meter */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              Temperature Safe-Limit Bracket
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              Current: {temp}°C (Safe: {minSafeTemp}°C to {maxSafeTemp}°C)
            </span>
          </div>

          {/* Bar track */}
          <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
            {/* Safe zone green background */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/40 border-x border-emerald-400"
              style={{
                left: `${minSafePercent}%`,
                width: `${maxSafePercent - minSafePercent}%`,
              }}
            />

            {/* Current temperature marker */}
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md border border-slate-900 transform -translate-x-1/2"
              style={{ left: `${tempPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0°C</span>
            <span>Safe Range: {minSafeTemp}°C – {maxSafeTemp}°C</span>
            <span>35°C</span>
          </div>
        </div>

        {/* Multi-Stage Cold-Chain Hop Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cold-Chain Handoff Continuity (Multi-Hop)
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">
              +30 Pts Cold-Chain Integrity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Hop 1 · Farm</span>
              <span className="font-bold text-slate-900 block mt-0.5">Pre-Cooling</span>
              <span className="text-[10px] text-slate-500 font-mono">22.0°C Ambient</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Hop 2 · Hub</span>
              <span className="font-bold text-slate-900 block mt-0.5">Solar Vault #04</span>
              <span className="text-[10px] text-slate-500 font-mono">18.2°C Monitored</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Hop 3 · Transit</span>
              <span className="font-bold text-slate-900 block mt-0.5">Reefer Logistics</span>
              <span className="text-[10px] text-slate-500 font-mono">16.5°C En-Route</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Hop 4 · Retail</span>
              <span className="font-bold text-slate-900 block mt-0.5">Display Shelf</span>
              <span className="text-[10px] text-slate-500 font-mono">21.4°C Safe Shelf</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">{unitName}</span>
          <span className="text-slate-400">· {location}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Clock className="w-3 h-3" />
          <span>Last Telemetry Packet: {recordedAt}</span>
        </div>
      </div>
    </div>
  );
};
