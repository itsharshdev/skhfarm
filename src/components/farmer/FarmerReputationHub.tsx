import React, { useState } from 'react';
import { FarmerReputationMetrics, FarmerBadge } from '../../types';
import { reputationService } from '../../services/reputationService';
import {
  ShieldCheck,
  Sparkles,
  Award,
  CheckCircle2,
  Tractor,
  Star,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Info,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

interface FarmerReputationHubProps {
  farmerId: string;
  farmerName: string;
}

export const FarmerReputationHub: React.FC<FarmerReputationHubProps> = ({ farmerId, farmerName }) => {
  const metrics: FarmerReputationMetrics = reputationService.getFarmerReputation(farmerId, farmerName);
  const [selectedBadge, setSelectedBadge] = useState<FarmerBadge | null>(null);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-teal-600" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'Star':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'CheckCircle2':
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTierPill = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'GOLD':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'SILVER':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'BRONZE':
      default:
        return 'bg-orange-100 text-orange-900 border-orange-300';
    }
  };

  return (
    <div
      id="farmer-reputation-hub"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6"
    >
      {/* Reputation Loop Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-5 sm:p-6 rounded-2xl text-white space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
            <Tractor className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Farmer Motivation & Reputation Engine
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
          The Virtuous Supply-Chain Reputation Loop
        </h3>

        {/* Visual Formula Loop */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
            <span className="font-bold block text-emerald-300">1. Full Records</span>
            <span className="text-[10px] text-slate-300">100% camera evidence</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
            <span className="font-bold block text-teal-300">2. Solar Storage</span>
            <span className="text-[10px] text-slate-300">Preserve grain moisture</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
            <span className="font-bold block text-blue-300">3. Verified Handoff</span>
            <span className="text-[10px] text-slate-300">Mandi zero-dispute rating</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/30 border border-emerald-400/40">
            <span className="font-bold block text-emerald-200">4. Premium Value</span>
            <span className="text-[10px] text-emerald-300">Higher buyer trust</span>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Earned Badges ({metrics.badges.length})
            </span>
            <h4 className="text-base font-bold text-slate-900">Verified Farmer Achievements</h4>
          </div>
          <span className="text-xs text-slate-400">Click a badge to inspect verification audit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:bg-white hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                  {getBadgeIcon(badge.iconName)}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getTierPill(badge.tier)}`}>
                  {badge.tier}
                </span>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                  {badge.title}
                </h5>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                  {badge.description}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 font-mono pt-1">
                Earned on {badge.earnedDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reputation Trends & Actionable Improvement Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Trend Progression */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>5-Month Quality & Trace Progression</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700">+11% Season Growth</span>
          </div>

          <div className="space-y-2 text-xs">
            {metrics.traceabilityScoreTrend.map((t, idx) => (
              <div key={t.month} className="space-y-1">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{t.month} 2025/26</span>
                  <span className="font-bold text-slate-900 font-mono">{t.score}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${t.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Improvement Tips */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Actionable Score Optimization Tips
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.improvementSuggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{sug}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 p-2 bg-white/80 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>Market Discovery:</strong> Batches scoring above 95/100 receive automatic priority listing on Mandi digital auction boards.
            </span>
          </div>
        </div>
      </div>

      {/* Selected Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              {getBadgeIcon(selectedBadge.iconName)}
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getTierPill(selectedBadge.tier)}`}>
                {selectedBadge.tier} Achievement
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">{selectedBadge.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedBadge.description}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono text-left space-y-1">
              <div>Badge ID: {selectedBadge.id}</div>
              <div>Recipient: {farmerName}</div>
              <div>Audit Date: {selectedBadge.earnedDate}</div>
              <div>Verification: Tamper-proof cryptographic seal</div>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Badge Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
