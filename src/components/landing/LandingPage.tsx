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
  Truck,
  Store,
  ShieldAlert,
  UserCog,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ALL_DEMO_BATCHES } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';

interface LandingPageProps {
  onSelectBatch: (batchId: string) => void;
}

const FEATURED_DEMO_BATCHES = [
  {
    batchId: 'BIS-2026-092',
    name: 'Whole Wheat Farm Biscuits',
    category: 'Bakery / Manufactured',
    origin: 'Kopargaon & Pravara Farms, Maharashtra',
    score: 92,
    badge: 'Multi-Parent Lineage DAG',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Multi-ingredient aggregation merging Sharbati Wheat, Organic Cane Sugar, and Solar Pre-Cooled milling lots.',
  },
  {
    batchId: 'WHT-MH-2026-001',
    name: 'Organic Sharbati Wheat',
    category: 'Grains & Cereals',
    origin: 'Kopargaon Organic Growers FPO, Ahmednagar',
    score: 98,
    badge: 'Solar Micro-Climate Vault',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Harvest lot stored in SKH030 compliant Solar Smart Storage #04 at continuous 18.2°C clean cooling.',
  },
  {
    batchId: 'APL-KSH-2026-104',
    name: 'Kashmir Royal Delicious Apple',
    category: 'Fresh Horticulture',
    origin: 'Shopian High-Altitude Orchards, Kashmir',
    score: 94,
    badge: 'Refrigerated Cold-Chain',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    description: 'Monitored with continuous GPS data logger, reefer temperature bounds, and zero synthetic wax coating.',
  },
];

const STAKEHOLDER_ROLES = [
  {
    role: 'FARMER',
    title: 'Farmer / FPO Origin',
    purpose: 'Register farm harvest batches, record geo-origin & capture field quality proof.',
    icon: Tractor,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    role: 'MANDI',
    title: 'Mandi / APMC Hub',
    purpose: 'Weighbridge intake, commodity grading verification & initial storage allocation.',
    icon: Store,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    role: 'WAREHOUSE',
    title: 'Solar Smart Storage',
    purpose: 'SKH030 micro-climate vault monitoring, solar battery power & temperature logs.',
    icon: Warehouse,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  },
  {
    role: 'PROCESSOR',
    title: 'Processor / Mill',
    purpose: 'Multi-parent batching, transformation milling & packaged finished lot creation.',
    icon: Factory,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    role: 'TRANSPORTER',
    title: 'Reefer Logistics',
    purpose: 'Cold-chain vehicle tracking, GPS transit corridors & delivery handoff signatures.',
    icon: Truck,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    role: 'RETAILER',
    title: 'Retailer / Storefront',
    purpose: 'Shelf receiving, public QR tag display, freshness tracking & consumer review sync.',
    icon: ShoppingBag,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  },
  {
    role: 'AUTHORITY',
    title: 'Safety Regulator',
    purpose: '100-pt audit inspection, regulatory compliance verification & quarantine control.',
    icon: ShieldAlert,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    role: 'ADMIN',
    title: 'System Admin',
    purpose: 'Manage platform registries, organization networks & system simulation tools.',
    icon: UserCog,
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectBatch }) => {
  const { setScannerOpen, setLoginModalOpen, setRegisterModalOpen } = useAuthRole();
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (!clean) {
      setInputError('Please enter a valid batch ID or scan a product QR code.');
      return;
    }
    setInputError(null);
    onSelectBatch(clean);
  };

  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: PUBLIC CONSUMER TRACE ENTRY HUB */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Framework Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>SKH029 · SKH030 · SKH031 Integrated Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white font-['Space_Grotesk',sans-serif]">
            Scan any food product and trace its journey —{' '}
            <span className="text-emerald-400">from harvest to your hands.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Real-time digital transparency for consumers. Verify live solar smart storage conditions, multi-ingredient lineage graphs, and verifiable 100-point integrity scores.
          </p>

          {/* Search & Camera Scan Bar */}
          <div className="pt-2 space-y-2">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2.5 max-w-xl bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="hero-batch-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Enter Batch ID (e.g. BIS-2026-092)..."
                  className="w-full pl-10 pr-3 py-3 bg-white text-slate-900 placeholder:text-slate-500 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 uppercase tracking-wide"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="hero-trace-btn"
                  type="submit"
                  className="flex-1 sm:flex-initial px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Trace Product</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-scan-camera-btn"
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                  title="Scan with Camera"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>
            </form>

            {inputError && (
              <p className="text-xs text-rose-400 pl-2 animate-fadeIn">{inputError}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Popular Demos:</span>
              {['BIS-2026-092', 'WHT-MH-2026-001', 'APL-KSH-2026-104'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onSelectBatch(code)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-600/30 hover:text-emerald-300 font-mono text-[11px] text-slate-300 transition-colors border border-slate-700/80"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURED DEMO PRODUCTS */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              Public Consumer Provenance
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              Featured Traceable Produce & Goods
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Click any verified product to inspect origin farms, cold-chain temperature telemetry, certificates, and multi-ingredient DAG lineage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_DEMO_BATCHES.map((item) => (
            <div
              key={item.batchId}
              onClick={() => onSelectBatch(item.batchId)}
              className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${item.tagColor}`}>
                    {item.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {item.score}/100 Score
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-400 block mt-0.5">
                    {item.batchId} · {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] truncate max-w-[180px]">
                  {item.origin}
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Trace Journey</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VALUE PILLARS (SUPER PROBLEM STATEMENT FRAMEWORK) */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            Why FarmTracer?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif]">
            Protecting Produce Quality & Consumer Trust
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From power-constrained rural farm storage to retail shelves, our unified system provides 100% transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">1. Smart Solar Storage (SKH030)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitors solar-powered micro-climate vaults and battery storage reserves in rural aggregation hubs with continuous temperature logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">2. Resilient Cold-Chain (SKH029)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintains unbroken refrigerated transit records across transit corridors with automatic breach detection and alerts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">3. Explainable 100-Pt Integrity (SKH031)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scores batches on handoff hygiene, cold-chain stability, lab certificates, and verified stakeholder feedback with zero black boxes.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. STAKEHOLDER PORTAL ACCESS & ROLE DIRECTORY */}
      {/* ========================================================================= */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Supply Chain Stakeholder Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              Built for Every Supply Chain Operator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Are you a farmer, warehouse operator, mill processor, or food safety authority? Sign in to access your role-specific operations dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              id="landing-stakeholder-login-btn"
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>Stakeholder Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="landing-stakeholder-register-btn"
              type="button"
              onClick={() => setRegisterModalOpen(true)}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-2xl text-xs sm:text-sm font-bold transition-all"
            >
              <span>Register Organization</span>
            </button>
          </div>
        </div>

        {/* Roles Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAKEHOLDER_ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                onClick={() => setLoginModalOpen(true)}
                className="cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${r.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {r.role}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {r.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {r.purpose}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Consumer Notice:</strong> Consumers never need to log in to trace food. All batch trace pages, QR scans, and score cards are 100% public.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectBatch('BIS-2026-092')}
            className="text-emerald-700 font-bold underline hover:text-emerald-800 shrink-0 ml-4 hidden sm:inline"
          >
            Try Demo Trace Now →
          </button>
        </div>
      </section>
    </div>
  );
};
