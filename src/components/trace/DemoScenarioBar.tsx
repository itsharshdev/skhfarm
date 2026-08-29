import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Wheat,
  Apple,
  Milk,
  Layers,
  SunMedium,
} from 'lucide-react';

export interface DemoScenario {
  id: string;
  batchId: string;
  label: string;
  subLabel: string;
  category: string;
  score: number;
  badgeType: 'HEALTHY' | 'FLAGGED' | 'WARNING' | 'INTERMEDIATE' | 'RAW' | 'SOLAR';
  icon: React.ReactNode;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'sc-biscuit',
    batchId: 'BIS-2026-092',
    label: 'Digestive Biscuits',
    subLabel: 'Multi-Parent & Solar Cold-Chain',
    category: 'Manufactured Food',
    score: 92,
    badgeType: 'HEALTHY',
    icon: <Layers className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'sc-wheat',
    batchId: 'WHT-MH-2026-001',
    label: 'Raw Sharbati Wheat',
    subLabel: 'Farm Harvest & Split Lineage',
    category: 'Farm Origin',
    score: 98,
    badgeType: 'RAW',
    icon: <Wheat className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'sc-flour',
    batchId: 'MAIDA-MH-2026-014',
    label: 'Stone-Ground Whole Flour',
    subLabel: 'Milling Transformed Intermediate',
    category: 'Intermediate',
    score: 92,
    badgeType: 'INTERMEDIATE',
    icon: <Sparkles className="w-4 h-4 text-teal-600" />,
  },
  {
    id: 'sc-apple',
    batchId: 'ORG-APL-2026-044',
    label: 'Himachal Royal Apples',
    subLabel: '2.8°C Solar Cold Vault #12',
    category: 'Horticulture & Cold-Chain',
    score: 97,
    badgeType: 'SOLAR',
    icon: <Apple className="w-4 h-4 text-red-500" />,
  },
  {
    id: 'sc-quarantine',
    batchId: 'APL-KSH-109',
    label: 'Kashmir Apples (Flagged)',
    subLabel: 'Pesticide Threshold Breach & Recall',
    category: 'Lab Contamination Alert',
    score: 26,
    badgeType: 'FLAGGED',
    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
  },
  {
    id: 'sc-milk',
    batchId: 'MILK-PUN-2026-809',
    label: 'Fresh Dairy Milk',
    subLabel: 'Near-Expiry & Temp Deviation',
    category: 'Perishable Dairy',
    score: 66,
    badgeType: 'WARNING',
    icon: <Milk className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'sc-onion',
    batchId: 'ONION-NSK-401',
    label: 'Nashik GI Red Onions',
    subLabel: 'Solar Ambient Aeration Unit #04',
    category: 'GI Certified Produce',
    score: 94,
    badgeType: 'SOLAR',
    icon: <SunMedium className="w-4 h-4 text-orange-500" />,
  },
];

interface DemoScenarioBarProps {
  currentBatchId: string;
  onSelectBatch: (batchId: string) => void;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  currentBatchId,
  onSelectBatch,
}) => {
  return (
    <div
      id="demo-scenarios-switcher-bar"
      className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Multi-Scenario Verification Matrix
            </span>
            <span className="text-xs font-bold text-slate-800">
              Interactive Test Scenarios
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete Multi-Parent
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3 text-rose-500" /> Contamination Flagged
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <SunMedium className="w-3 h-3 text-teal-600" /> Solar Cold-Chain
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
        {DEMO_SCENARIOS.map((sc) => {
          const isActive = currentBatchId === sc.batchId;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectBatch(sc.batchId)}
              className={`shrink-0 text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 min-w-[200px] sm:min-w-[220px] ${
                isActive
                  ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-2 ring-emerald-400/30'
                  : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shrink-0 shadow-2xs mt-0.5">
                {sc.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {sc.label}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      sc.score >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : sc.score >= 70
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sc.score}/100
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {sc.subLabel}
                </p>

                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-mono">
                  <span>{sc.batchId}</span>
                  {isActive && (
                    <span className="text-emerald-700 font-bold uppercase">Active Trace</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
