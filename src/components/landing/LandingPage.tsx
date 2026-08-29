import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  QrCode,
  Search,
  ShieldCheck,
  Sun,
  Warehouse,
  Tractor,
  Factory,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Thermometer,
  Zap,
  Globe,
} from 'lucide-react';
import { ALL_DEMO_BATCHES } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';

interface LandingPageProps {
  onSelectBatch: (batchId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectBatch }) => {
  const { setScannerOpen, setLoginModalOpen } = useAuthRole();
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectBatch(searchInput.trim());
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Hero Section with Dual Consumer & Stakeholder Paths */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Super PS Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>SKH029 · SKH030 · SKH031 Integrated Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white font-['Space_Grotesk',sans-serif]">
            Scan any food product and see its journey —{' '}
            <span className="text-emerald-400">from origin to your hands.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Verify live solar cold-storage telemetry, complete ingredient transformation lineage, and tamper-proof custody transfers with an explainable 100-point integrity model.
          </p>

          {/* Quick Search / Scan Input for Consumers */}
          <div className="pt-2">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2.5 max-w-xl bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  id="hero-batch-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Batch ID (e.g. BIS-2026-092, WHT-MH-2026-001)..."
                  className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 placeholder:text-slate-500 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="hero-trace-btn"
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Trace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-scan-camera-btn"
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Path: Stakeholder Portal CTA */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span>Are you a supply chain participant?</span>
            <button
              id="hero-stakeholder-portal-btn"
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Stakeholder Demo Portal (Farmer, Mandi, Cold Vault, Factory)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Demo Batches Spotlight */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Explore Live Scenarios
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Featured Traceability & Cold-Chain Batches
            </h2>
          </div>
          <span className="text-xs text-slate-500">Click any batch to inspect live trace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(ALL_DEMO_BATCHES).map((batch) => {
            const isPrimary = batch.batchId === 'BIS-2026-092';
            return (
              <div
                key={batch.batchId}
                id={`batch-card-${batch.batchId}`}
                onClick={() => onSelectBatch(batch.batchId)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between group ${
                  isPrimary
                    ? 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {batch.scoreBreakdown.totalScore} / 100
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {batch.productName}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {batch.origin}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>{batch.events.length} Handoffs</span>
                    <StatusBadge status={batch.currentStorage?.conditionStatus || 'SAFE'} size="sm" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Inspect Full Trace</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Super Problem Statement Explanation Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Hackathon Cluster Solution
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Connecting Cold-Chain Resilience & Food Traceability
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1">
            FARM TRACER unites post-harvest solar storage monitoring, transit integrity, multi-stage ingredient transformation, and consumer verification into one continuous chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              SKH030 · Solar Smart Storage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitors power-constrained and solar-backed cold vaults, tracking temperature bounds, relative humidity, and battery reserves without relying on grid stability.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              SKH029 · Cold-Chain Logistics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintains reefer transit checkpoints, handoff verification, and continuous temperature records across mandi aggregation and factory delivery.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              SKH031 · Digital Traceability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tracks multi-ingredient transformations (e.g. Wheat → Flour → Biscuits), camera proof, and 100-point transparent ratings from farmer to final consumer plate.
            </p>
          </div>
        </div>
      </section>

      {/* Stakeholder Value Loop Section */}
      <section className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Stakeholder Ecosystem
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Built for Every Link in the Agricultural Value Chain
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Empowering farmers with verified origin reputation while providing processors, regulators, and consumers with untampered transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Tractor className="w-4 h-4" />
              <span>Farmers & FPOs</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Build verified quality reputation, capture camera harvest proof, and gain buyer visibility.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
              <Warehouse className="w-4 h-4" />
              <span>Storage Operators</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrate solar resilience, manage temperature compliance, and safeguard against spoilage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Factory className="w-4 h-4" />
              <span>Processors & Mills</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Preserve ingredient lineage across milling and manufacturing into finished consumer goods.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span>Consumers</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scan product QR to verify safe storage conditions, origin farms, and true 100-pt quality ratings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
