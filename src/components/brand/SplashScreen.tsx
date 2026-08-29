import React, { useState, useEffect } from 'react';
import { FarmTracerLogo } from './FarmTracerLogo';
import { ShieldCheck, Sun, GitFork, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 1200,
}) => {
  const [animationStage, setAnimationStage] = useState<'init' | 'logo' | 'brand' | 'tagline' | 'fading'>('init');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Simplified instantaneous startup
      setAnimationStage('tagline');
      const timer = setTimeout(() => {
        setAnimationStage('fading');
        setTimeout(() => {
          setIsDismissed(true);
          onComplete();
        }, 200);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Sequence stages
    const t1 = setTimeout(() => setAnimationStage('logo'), 100);
    const t2 = setTimeout(() => setAnimationStage('brand'), 350);
    const t3 = setTimeout(() => setAnimationStage('tagline'), 650);
    const t4 = setTimeout(() => setAnimationStage('fading'), minDurationMs);
    const t5 = setTimeout(() => {
      setIsDismissed(true);
      onComplete();
    }, minDurationMs + 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [minDurationMs, onComplete]);

  if (isDismissed) return null;

  return (
    <div
      id="farmtracer-splash-screen"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-300 select-none ${
        animationStage === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-live="polite"
      aria-label="Loading FarmTracer Platform"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Animated Brand Logo Mark */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            animationStage === 'init'
              ? 'scale-75 opacity-0'
              : 'scale-100 opacity-100'
          }`}
        >
          <FarmTracerLogo
            variant="icon-only"
            size="xl"
            animated
            className="drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]"
          />
        </div>

        {/* Wordmark Reveal */}
        <div
          className={`mt-5 transform transition-all duration-500 ease-out ${
            animationStage === 'init' || animationStage === 'logo'
              ? 'translate-y-3 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2 font-['Space_Grotesk',sans-serif]">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              FARM <span className="text-emerald-400">TRACER</span>
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase">
              SUPER-PS
            </span>
          </div>
        </div>

        {/* Tagline & Pillars */}
        <div
          className={`mt-2 transform transition-all duration-500 ease-out ${
            animationStage === 'tagline' || animationStage === 'fading'
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0'
          }`}
        >
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide font-['Plus_Jakarta_Sans',sans-serif]">
            From Seed to Shelf · Solar Cold-Chain & Food Traceability
          </p>

          {/* Core Feature Badges */}
          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-teal-400" />
              <span>Solar Storage</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-emerald-400" />
              <span>DAG Lineage</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>100-Pt Integrity</span>
            </span>
          </div>
        </div>

        {/* Subtle Progress Bar Track */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-7 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out ${
              animationStage === 'init'
                ? 'w-0'
                : animationStage === 'logo'
                ? 'w-1/4'
                : animationStage === 'brand'
                ? 'w-2/3'
                : 'w-full'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
