import React from 'react';
import {
  Wheat,
  Sparkles,
  Droplets,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  User,
} from 'lucide-react';

interface MultiParentLineageCardProps {
  onSelectBatch?: (batchId: string) => void;
  currentBatchId: string;
}

export const MultiParentLineageCard: React.FC<MultiParentLineageCardProps> = ({
  onSelectBatch,
  currentBatchId,
}) => {
  const ingredients = [
    {
      id: 'ing-wheat',
      batchId: 'WHT-MH-2026-001',
      name: 'Organic Sharbati Wheat',
      role: 'Core Grain Base (65% Composition)',
      producer: 'Ramesh Patil',
      fpo: 'Kopargaon Organic Growers FPO',
      location: 'Kopargaon, Maharashtra',
      integrityScore: 98,
      status: 'Harvested & Solar Conditioned',
      icon: <Wheat className="w-4 h-4 text-amber-600" />,
      colorClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
    },
    {
      id: 'ing-sugar',
      batchId: 'SUG-MH-2026-003',
      name: 'Sulfurless Organic Sugar',
      role: 'Natural Sweetener (22% Composition)',
      producer: 'Balasaheb Vikhe',
      fpo: 'Pravara Organic Sugar Co-op',
      location: 'Pravara Basin, Ahmednagar',
      integrityScore: 95,
      status: 'Vegetable Resin Clarified',
      icon: <Sparkles className="w-4 h-4 text-teal-600" />,
      colorClass: 'border-teal-200 bg-teal-50/50 hover:bg-teal-50',
    },
    {
      id: 'ing-butter',
      batchId: 'MILK-PUN-2026-809',
      name: 'Farm-Fresh Dairy Fats',
      role: 'Pure Dairy Shortening (13% Composition)',
      producer: 'Baramati Dairy Co-op',
      fpo: 'Baramati Dairy Collective',
      location: 'Baramati, Pune District',
      integrityScore: 92,
      status: 'A2 Certified Dairy Source',
      icon: <Droplets className="w-4 h-4 text-sky-600" />,
      colorClass: 'border-sky-200 bg-sky-50/50 hover:bg-sky-50',
    },
  ];

  return (
    <div
      id="multi-parent-lineage-card"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-7 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Multi-Parent Recipe & Ingredient Provenance
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Raw Ingredient Origins (3 Connected Farms)
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Formula Merge Checked (100% Traceable)</span>
        </div>
      </div>

      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
        This manufactured food product merges independently verified harvest lots from 3 distinct agricultural producers. Click any raw ingredient to inspect its standalone farm provenance, lab tests, and storage records.
      </p>

      {/* 3 Ingredient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {ingredients.map((ing) => {
          return (
            <div
              key={ing.id}
              onClick={() => onSelectBatch && onSelectBatch(ing.batchId)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2.5 group relative ${ing.colorClass} shadow-2xs hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  {ing.icon}
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                  {ing.integrityScore}/100 Score
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {ing.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {ing.role}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{ing.producer}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] truncate text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ing.location}</span>
                </div>
              </div>

              <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-700 font-bold font-sans">
                  {ing.status}
                </span>
                <span className="text-slate-500 group-hover:text-emerald-700 flex items-center gap-0.5 font-bold transition-colors">
                  Trace Lot <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
