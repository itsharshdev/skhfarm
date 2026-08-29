import React from 'react';
import { Sprout, ShieldCheck, Sun, CheckCircle2, Warehouse, Cpu } from 'lucide-react';

interface FooterProps {
  onSelectBatch?: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectBatch }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Super PS info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                FARM TRACER
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              End-to-End Cold-Chain & Food Traceability Platform addressing the Hackathon Super Problem Statement. Protecting agricultural produce quality and consumer trust across post-harvest storage, transit, processing transformation, and retail.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700 font-mono text-[11px] font-bold">
                SKH029 · Cold-Chain Logistics
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-400 border border-slate-700 font-mono text-[11px] font-bold">
                SKH030 · Solar Smart Storage
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-teal-400 border border-slate-700 font-mono text-[11px] font-bold">
                SKH031 · Digital Traceability
              </span>
            </div>
          </div>

          {/* Featured Demo Batches */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Featured Demo Batches
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectBatch && onSelectBatch('BIS-2026-092')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="font-mono text-emerald-400 font-bold">BIS-2026-092</span>
                  <span>- Whole Wheat Biscuits</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBatch && onSelectBatch('WHT-MH-2026-001')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="font-mono text-emerald-400 font-bold">WHT-MH-2026-001</span>
                  <span>- Raw Sharbati Wheat</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBatch && onSelectBatch('ORG-APL-2026-044')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="font-mono text-emerald-400 font-bold">ORG-APL-2026-044</span>
                  <span>- Himachal Cold Apples</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBatch && onSelectBatch('MILK-PUN-2026-809')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="font-mono text-amber-400 font-bold">MILK-PUN-2026-809</span>
                  <span>- Expiry Warning Dairy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Prototype Integrity Transparency */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Prototype Integrity
            </h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phase 1 Architecture Complete</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Frontend/PWA foundation prepared for future Supabase Postgres, Realtime IoT sensors, and camera evidence storage.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 FARM TRACER Project. Hackathon Prototype V2. Built with React 19, TypeScript & Tailwind CSS.
          </div>
          <div className="flex items-center gap-4">
            <span>No 5-Star Ratings</span>
            <span>·</span>
            <span>Camera-Only Proof</span>
            <span>·</span>
            <span>100-Point Model</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
