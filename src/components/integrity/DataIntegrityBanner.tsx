import React, { useState, useEffect } from 'react';
import { IncidentState, DataIntegrityIncidentRecord } from '../../types';
import { dataIntegrityService } from '../../services/dataIntegrityService';
import {
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Activity,
  ChevronDown,
  X,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DataIntegrityBannerProps {
  onOpenRecoveryDetails?: () => void;
}

export const DataIntegrityBanner: React.FC<DataIntegrityBannerProps> = ({ onOpenRecoveryDetails }) => {
  const [incidentState, setIncidentState] = useState<IncidentState>(dataIntegrityService.getIncidentState());
  const [activeIncident, setActiveIncident] = useState<DataIntegrityIncidentRecord | null>(
    dataIntegrityService.getActiveIncident()
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSimulationMenuOpen, setIsSimulationMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = dataIntegrityService.subscribe((state) => {
      setIncidentState(state);
      setActiveIncident(dataIntegrityService.getActiveIncident());
      setIsDismissed(false); // un-dismiss if incident state updates
    });
    return () => unsubscribe();
  }, []);

  const handleSelectState = (state: IncidentState) => {
    dataIntegrityService.setIncidentState(state);
    setIsSimulationMenuOpen(false);
  };

  const getBannerConfig = () => {
    switch (incidentState) {
      case 'INCIDENT':
        return {
          bannerBg: 'bg-rose-950/90 border-rose-800/80 text-rose-100',
          badgeBg: 'bg-rose-600 text-white',
          icon: AlertTriangle,
          title: 'DATA INTEGRITY INCIDENT',
          message:
            'Primary data store disruption detected. Some records are unavailable or require recovery verification.',
          pulseColor: 'bg-rose-400',
        };
      case 'DEGRADED':
        return {
          bannerBg: 'bg-amber-950/90 border-amber-800/80 text-amber-100',
          badgeBg: 'bg-amber-600 text-white',
          icon: Activity,
          title: 'DEGRADED DATA STORE PERFORMANCE',
          message:
            'Telemetry synchronization latency detected. Available records reflect latest confirmed peer states.',
          pulseColor: 'bg-amber-400',
        };
      case 'RECOVERY':
        return {
          bannerBg: 'bg-blue-950/90 border-blue-800/80 text-blue-100',
          badgeBg: 'bg-blue-600 text-white',
          icon: RefreshCw,
          title: 'ACTIVE LEDGER RECOVERY IN PROGRESS',
          message:
            'Rebuilding batch custody histories from distributed edge nodes and cryptographically signed handoff receipts.',
          pulseColor: 'bg-blue-400',
        };
      case 'PARTIALLY_RECOVERED':
        return {
          bannerBg: 'bg-slate-900/90 border-amber-700/80 text-slate-100',
          badgeBg: 'bg-amber-500 text-slate-950',
          icon: Layers,
          title: 'PARTIALLY RECOVERED DATA STATE',
          message:
            'Primary records restored. Missing or unverified custody segments are transparently flagged for review.',
          pulseColor: 'bg-amber-400',
        };
      case 'NORMAL':
      default:
        return null;
    }
  };

  const config = getBannerConfig();

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 relative z-40 transition-all">
      {/* Simulation Controls Bar for Evaluators & Judges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">Data Integrity Mode:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-md text-[10px] ${
              incidentState === 'NORMAL'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
            }`}
          >
            {incidentState}
          </span>
        </div>

        {/* State Switcher Menu */}
        <div className="relative">
          <button
            id="simulate-incident-dropdown-btn"
            type="button"
            onClick={() => setIsSimulationMenuOpen(!isSimulationMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Simulate Resilience State</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSimulationMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                PS-1 Incident Simulator
              </div>
              {(['NORMAL', 'DEGRADED', 'INCIDENT', 'RECOVERY', 'PARTIALLY_RECOVERED'] as IncidentState[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => handleSelectState(st)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                      incidentState === st ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>{st}</span>
                    {incidentState === st && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Incident Alert Banner (Visible when not NORMAL and not dismissed) */}
      {config && !isDismissed && (
        <div className={`px-4 sm:px-6 lg:px-8 py-3 border-t backdrop-blur-md ${config.bannerBg} animate-fadeIn`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <span className={`p-1.5 rounded-xl ${config.badgeBg} shrink-0 mt-0.5 sm:mt-0 flex items-center justify-center`}>
                <config.icon className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm font-['Space_Grotesk',sans-serif] tracking-wide">
                    {config.title}
                  </h4>
                  <span className={`w-2 h-2 rounded-full ${config.pulseColor} animate-ping`} />
                </div>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5">{config.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {activeIncident && (
                <div className="text-[11px] font-mono opacity-80 hidden md:block">
                  Affected: <span className="font-bold">{activeIncident.affectedBatchIds.length}</span> batches ·
                  Recoverable: <span className="font-bold">{activeIncident.recoverableCount}</span>
                </div>
              )}

              {onOpenRecoveryDetails && (
                <button
                  type="button"
                  onClick={onOpenRecoveryDetails}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-white/20"
                >
                  View Recovery State
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss Banner for this session"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
