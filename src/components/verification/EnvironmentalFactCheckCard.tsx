import React, { useState, useEffect } from 'react';
import {
  Sun,
  Thermometer,
  Droplets,
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface TelemetryPoint {
  timeStr: string;
  temp: number;
  humidity: number;
  solarKw: number;
  batteryPct: number;
}

interface EnvironmentalFactCheckCardProps {
  productCategory?: string;
  defaultMinTemp?: number;
  defaultMaxTemp?: number;
}

export const EnvironmentalFactCheckCard: React.FC<EnvironmentalFactCheckCardProps> = ({
  productCategory,
  defaultMinTemp = 18.0,
  defaultMaxTemp = 24.0,
}) => {
  const [activeScenario, setActiveScenario] = useState<'NORMAL' | 'EXCURSION' | 'SOLAR_BATTERY' | 'MISSING_DATA'>('NORMAL');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Rolling fake-time telemetry history
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const points: TelemetryPoint[] = [];
    const baseTime = Date.now() - 30 * 1000 * 10;
    for (let i = 0; i < 10; i++) {
      const t = new Date(baseTime + i * 3000);
      points.push({
        timeStr: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: +(21.4 + Math.sin(i * 0.5) * 0.8).toFixed(1),
        humidity: +(52.0 + Math.cos(i * 0.4) * 2).toFixed(1),
        solarKw: +(4.2 + Math.sin(i * 0.3) * 0.4).toFixed(2),
        batteryPct: +(94 - i * 0.1).toFixed(0),
      });
    }
    return points;
  });

  // Live timer generating fake-time telemetry updates every 3 seconds
  useEffect(() => {
    if (!isLiveStreaming || activeScenario === 'MISSING_DATA') return;

    const interval = setInterval(() => {
      setTelemetryHistory((prev) => {
        const last = prev[prev.length - 1] || {
          temp: 21.8,
          humidity: 53,
          solarKw: 4.2,
          batteryPct: 94,
        };

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let nextTemp: number;
        if (activeScenario === 'EXCURSION') {
          nextTemp = +(28.2 + (Math.random() * 0.8 - 0.4)).toFixed(1);
        } else {
          // Normal fluctuation between 21.2°C and 22.8°C
          const delta = (Math.random() - 0.5) * 0.4;
          nextTemp = Math.min(23.2, Math.max(20.8, +(last.temp + delta).toFixed(1)));
        }

        const nextHumidity = +(52.5 + (Math.random() * 2 - 1)).toFixed(1);
        const nextSolar = +(4.3 + (Math.random() * 0.3 - 0.15)).toFixed(2);
        const nextBattery = activeScenario === 'SOLAR_BATTERY' ? 42 : +(93 + (Math.random() * 2 - 1)).toFixed(0);

        const updated = [...prev.slice(1), { timeStr, temp: nextTemp, humidity: nextHumidity, solarKw: nextSolar, batteryPct: nextBattery }];
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, activeScenario]);

  const latestPoint = telemetryHistory[telemetryHistory.length - 1] || {
    temp: 21.8,
    humidity: 53.0,
    solarKw: 4.2,
    batteryPct: 94,
    timeStr: 'Live',
  };

  // Sparkline calculation
  const graphWidth = 320;
  const graphHeight = 70;
  const minTempScale = 15;
  const maxTempScale = 32;

  const pointsSvg = telemetryHistory
    .map((pt, idx) => {
      const x = (idx / (telemetryHistory.length - 1)) * graphWidth;
      const y = graphHeight - ((pt.temp - minTempScale) / (maxTempScale - minTempScale)) * graphHeight;
      return `${x},${Math.max(4, Math.min(graphHeight - 4, y))}`;
    })
    .join(' ');

  // Safe band limits in SVG Y-coordinates
  const safeTopY = graphHeight - ((defaultMaxTemp - minTempScale) / (maxTempScale - minTempScale)) * graphHeight;
  const safeBottomY = graphHeight - ((defaultMinTemp - minTempScale) / (maxTempScale - minTempScale)) * graphHeight;
  const safeHeight = Math.max(4, safeBottomY - safeTopY);

  const getScenarioContent = () => {
    switch (activeScenario) {
      case 'EXCURSION':
        return {
          claimTitle: 'High-Heat Thermal Excursion Rumor',
          claimStatement: 'Social inquiry: "Batch was allegedly exposed to high ambient heat (>28°C) during warehouse loading dock delay."',
          claimedCondition: '> 28.0°C Ambient Heat',
          measuredCondition: '28.2°C Peak (Excursion Confirmed)',
          safeRange: `${defaultMinTemp}°C to ${defaultMaxTemp}°C`,
          excursionDuration: '22 minutes (Dock Transfer Delay)',
          corroboratingEvidence: 'Dock Door BLE Sensor #DOCK-04 · Thermal Alert #ALT-2026-90',
          verdict: 'SUPPORTED',
          verdictBadgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          verdictText: 'SUPPORTED BY TELEMETRY (Excursion Logged)',
          reason: 'Available records support this claim. Thermal sensors logged a 22-minute excursion reaching 28.2°C before automated re-cooling was engaged.',
        };
      case 'SOLAR_BATTERY':
        return {
          claimTitle: 'Solar Storage Battery Depletion / Night Cooling Shutoff',
          claimStatement: 'User inquiry: "Did overnight cloud cover drain solar batteries causing cold storage compressors to trip?"',
          claimedCondition: 'Total Power Cutoff & Cooling Loss',
          measuredCondition: 'Uninterrupted Power (Battery maintained 78% SoC)',
          safeRange: 'Min 20% SoC Battery Reserve',
          excursionDuration: '0 minutes (Continuous Active Chilling)',
          corroboratingEvidence: 'Solar MPPT Hybrid Inverter #INV-MH-04 · Smart Grid Failover Log',
          verdict: 'CONTRADICTED_BY_RECORDS',
          verdictBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          verdictText: 'CONTRADICTED BY AVAILABLE RECORDS',
          reason: 'Available records contradict this claim. Solar storage battery reserves remained above 78% with zero compressor tripping across the entire holding cycle.',
        };
      case 'MISSING_DATA':
        return {
          claimTitle: 'Unmonitored Rural Transit Corridor Excursion',
          claimStatement: 'Stakeholder question: "Did secondary rural feeder vehicle suffer temperature spikes between Kopargaon and Nashik?"',
          claimedCondition: 'Exceeded 30°C in unconditioned truck',
          measuredCondition: 'Telemetry unavailable for this interval',
          safeRange: `${defaultMinTemp}°C to ${defaultMaxTemp}°C`,
          excursionDuration: 'Unknown (Signal Dropout)',
          corroboratingEvidence: 'Cellular Blackspot Telemetry Buffer #RUR-09 (Awaiting sync)',
          verdict: 'INSUFFICIENT_EVIDENCE',
          verdictBadgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
          verdictText: 'INSUFFICIENT EVIDENCE (Telemetry Missing)',
          reason: 'Insufficient evidence to verify this claim. Telemetry was unavailable for this 35-minute cellular blackout interval. Neither safety nor failure is assumed.',
        };
      case 'NORMAL':
      default:
        return {
          claimTitle: 'Reefer Cold-Chain Failure & Spoilage Rumor',
          claimStatement: 'Rumor circulating on trade board: "Reefer power failed during Shindi-Mumbai transit resulting in product heat damage."',
          claimedCondition: 'Reefer Power Failure (>35°C)',
          measuredCondition: `${latestPoint.temp}°C Continuous Steady Stream`,
          safeRange: `${defaultMinTemp}°C to ${defaultMaxTemp}°C`,
          excursionDuration: '0 minutes (Zero Excursions)',
          corroboratingEvidence: 'Live IoT Reefer PT100 Probe #RF-992 · Solar Roof Array #PV-04',
          verdict: 'CONTRADICTED_BY_RECORDS',
          verdictBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          verdictText: 'CONTRADICTED BY AVAILABLE RECORDS',
          reason: 'Available records contradict this claim. Solar-backed reefer telemetry logged uninterrupted cooling between 21.2°C and 22.8°C with zero thermal excursions.',
        };
    }
  };

  const scenario = getScenarioContent();

  return (
    <div
      id="environmental-fact-check-card"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
              <Sun className="w-4 h-4 text-teal-700" />
            </span>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              PS-2 Environmental & Cold-Chain Fact-Check
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Cold-Chain Integrity & Live Telemetry Stream
          </h3>
        </div>

        {/* Live Telemetry Pulsing Badge */}
        <div className="flex items-center gap-2">
          {activeScenario !== 'MISSING_DATA' && (
            <button
              type="button"
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                isLiveStreaming
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{isLiveStreaming ? 'LIVE STREAM ACTIVE' : 'STREAM PAUSED'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Mini Time-Series Graph & HUD Indicators */}
      <div className="p-5 rounded-2xl bg-slate-950 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              Real-Time Simulated Telemetry Stream (Updating every 3s)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Node: Kopargaon Solar Hub · Inverter MPPT #04
          </span>
        </div>

        {/* Live Metrics Row + Mini Sparkline Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Sparkline Graph */}
          <div className="lg:col-span-6 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Rolling Temperature Curve</span>
              <span className="text-emerald-400">Safe: {defaultMinTemp}°C–{defaultMaxTemp}°C</span>
            </div>

            {activeScenario === 'MISSING_DATA' ? (
              <div className="h-[70px] flex items-center justify-center bg-slate-900/90 rounded-xl border border-dashed border-slate-700 text-xs text-rose-400 font-mono">
                ⚠ Telemetry unavailable for this interval
              </div>
            ) : (
              <div className="relative w-full h-[70px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center">
                <svg
                  viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  {/* Safe Envelope Shaded Band */}
                  <rect
                    x="0"
                    y={safeTopY}
                    width={graphWidth}
                    height={safeHeight}
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="rgba(16, 185, 129, 0.4)"
                    strokeDasharray="2,2"
                  />

                  {/* Gradient Fill under temperature curve */}
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Temperature Polyline */}
                  <polyline
                    fill="none"
                    stroke={activeScenario === 'EXCURSION' ? '#f43f5e' : '#10b981'}
                    strokeWidth="2.5"
                    points={pointsSvg}
                  />

                  {/* Glowing end point */}
                  <circle
                    cx={graphWidth - 4}
                    cy={graphHeight - ((latestPoint.temp - minTempScale) / (maxTempScale - minTempScale)) * graphHeight}
                    r="4"
                    fill={activeScenario === 'EXCURSION' ? '#f43f5e' : '#10b981'}
                    className="animate-pulse"
                  />
                </svg>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-30s</span>
              <span>-15s</span>
              <span>Now ({latestPoint.timeStr})</span>
            </div>
          </div>

          {/* Real-Time Live HUD Stats */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Temp</span>
              <span
                className={`text-base font-extrabold font-mono ${
                  activeScenario === 'EXCURSION'
                    ? 'text-rose-400'
                    : activeScenario === 'MISSING_DATA'
                    ? 'text-slate-500'
                    : 'text-emerald-400'
                }`}
              >
                {activeScenario === 'MISSING_DATA' ? 'N/A' : `${latestPoint.temp}°C`}
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Humidity</span>
              <span className="text-base font-extrabold font-mono text-cyan-400">
                {activeScenario === 'MISSING_DATA' ? 'N/A' : `${latestPoint.humidity}%`}
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Solar PV</span>
              <span className="text-base font-extrabold font-mono text-amber-400">
                {activeScenario === 'MISSING_DATA' ? 'N/A' : `${latestPoint.solarKw} kW`}
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Battery SoC</span>
              <span className="text-base font-extrabold font-mono text-emerald-400">
                {activeScenario === 'MISSING_DATA' ? 'N/A' : `${latestPoint.batteryPct}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Switcher Buttons for Evaluators & Testing */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Simulate Environmental Fact-Check Scenarios:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveScenario('NORMAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'NORMAL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Normal Solar Cold-Chain
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario('EXCURSION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'EXCURSION'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            2. Heat Excursion Incident
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario('SOLAR_BATTERY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'SOLAR_BATTERY'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            3. Solar Battery Power Check
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario('MISSING_DATA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'MISSING_DATA'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            4. Missing Sensor Interval
          </button>
        </div>
      </div>

      {/* Structured Fact-Check Comparison Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
        {/* Title & Statement */}
        <div className="p-4 bg-slate-50 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-extrabold text-slate-900 text-sm font-['Space_Grotesk',sans-serif]">
              {scenario.claimTitle}
            </h4>
            <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] border ${scenario.verdictBadgeClass}`}>
              {scenario.verdictText}
            </span>
          </div>
          <p className="text-slate-600 italic">"{scenario.claimStatement}"</p>
        </div>

        {/* Fact Comparison Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Claimed Condition</span>
            <span className="font-bold text-slate-800">{scenario.claimedCondition}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Measured Condition</span>
            <span
              className={`font-mono font-bold ${
                activeScenario === 'MISSING_DATA'
                  ? 'text-rose-600'
                  : activeScenario === 'EXCURSION'
                  ? 'text-rose-600'
                  : 'text-emerald-700'
              }`}
            >
              {scenario.measuredCondition}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Safe Operating Bracket</span>
            <span className="font-mono text-slate-700">{scenario.safeRange}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Excursion Duration</span>
            <span className="font-bold text-slate-800">{scenario.excursionDuration}</span>
          </div>
        </div>

        {/* Sensor Evidence & Objective Reasoning Box */}
        <div className="p-4 bg-slate-900 text-white space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Corroborating Telemetry Evidence</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">{scenario.reason}</p>
          <div className="pt-1 text-[11px] text-slate-400 font-mono">
            Sensor Hardware: {scenario.corroboratingEvidence}
          </div>
        </div>
      </div>
    </div>
  );
};
