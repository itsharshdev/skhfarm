import React, { useState } from 'react';
import { Batch, PowerSourceStatus, SolarGenerationStatus } from '../../types';
import { traceService } from '../../services/traceService';
import { Thermometer, Sun, Zap, Battery, AlertTriangle, Check, X } from 'lucide-react';

interface StorageConditionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  onUpdateComplete?: () => void;
}

export const StorageConditionUpdateModal: React.FC<StorageConditionUpdateModalProps> = ({
  isOpen,
  onClose,
  batch,
  onUpdateComplete,
}) => {
  const currentTemp = batch.currentStorage?.temperature || 18.0;
  const currentHum = batch.currentStorage?.humidity || 55;
  const [temperature, setTemperature] = useState<number>(currentTemp);
  const [humidity, setHumidity] = useState<number>(currentHum);
  const [powerStatus, setPowerStatus] = useState<PowerSourceStatus>(
    batch.currentStorage?.powerStatus || 'SOLAR'
  );
  const [solarStatus, setSolarStatus] = useState<SolarGenerationStatus>(
    batch.currentStorage?.solarStatus || 'OPTIMAL'
  );

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Safe bounds check
  const minSafe = batch.storageUnit?.safeTemperatureMin || 15.0;
  const maxSafe = batch.storageUnit?.safeTemperatureMax || 24.0;
  let conditionStatus: 'SAFE' | 'WARNING' | 'OUT_OF_RANGE' = 'SAFE';
  if (temperature > maxSafe + 4 || temperature < minSafe - 5) {
    conditionStatus = 'OUT_OF_RANGE';
  } else if (temperature > maxSafe || temperature < minSafe) {
    conditionStatus = 'WARNING';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await traceService.recordStorageCondition(batch.batchId, {
        temperature,
        humidity,
        powerStatus,
        solarStatus,
        conditionStatus,
        notes: notes || `Recorded ${temperature}°C, ${humidity}% RH under ${powerStatus} power mode. Condition: ${conditionStatus}.`,
      });
      if (onUpdateComplete) onUpdateComplete();
      onClose();
    } catch (err) {
      console.error('Record condition error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="storage-condition-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
              <Thermometer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Record Storage Condition Telemetry</h3>
              <p className="text-xs text-slate-500 font-mono">
                {batch.batchId} · {batch.storageUnit?.name || 'Solar Cold Vault #04'}
              </p>
            </div>
          </div>
          <button
            id="close-condition-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Temperature & Safe Bounds Status Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              conditionStatus === 'SAFE'
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                : conditionStatus === 'WARNING'
                ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                : 'bg-rose-50/60 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Live Condition Assessment</span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase font-mono bg-white/80 border">
                {conditionStatus === 'SAFE'
                  ? 'Within Safe Conditions'
                  : conditionStatus === 'WARNING'
                  ? 'Warning Bound'
                  : 'Out of Safe Range'}
              </span>
            </div>
            <div className="mt-2 text-xs opacity-90 flex items-center justify-between">
              <span>Safe Bounds: {minSafe}°C – {maxSafe}°C</span>
              <span className="font-mono font-bold text-sm">{temperature.toFixed(1)}°C</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <label className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Core Temperature (°C)</span>
              </label>
              <span className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                {temperature.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="0.2"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Relative Humidity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <label className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-blue-500" />
                <span>Relative Humidity (%)</span>
              </label>
              <span className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                {humidity}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Power Source & Solar Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Power Resilience Source (SKH030)</label>
            <div className="grid grid-cols-2 gap-2">
              {(['SOLAR', 'BATTERY_BACKUP', 'HYBRID', 'GRID'] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setPowerStatus(source)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    powerStatus === source
                      ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {source === 'SOLAR' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    ) : source === 'BATTERY_BACKUP' ? (
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>{source.replace('_', ' ')}</span>
                  </span>
                  {powerStatus === source && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Inspection / Vault Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Solar array generating 4.2kW. Pre-cooling cycles stable."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
            />
          </div>

          {/* Submit Action */}
          <button
            id="submit-storage-telemetry-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Logging Telemetry...' : 'Record Storage Telemetry Log'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
