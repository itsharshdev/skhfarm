import React from 'react';

export type LogoVariant = 'full' | 'icon-only' | 'compact' | 'badge';
export type LogoTheme = 'light' | 'dark' | 'emerald' | 'white';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FarmTracerLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize;
  className?: string;
  showTagline?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

const SIZE_CONFIGS: Record<LogoSize, { iconSize: number; titleClass: string; tagClass: string; gap: string }> = {
  xs: { iconSize: 22, titleClass: 'text-xs tracking-tight', tagClass: 'text-[9px]', gap: 'gap-1.5' },
  sm: { iconSize: 28, titleClass: 'text-sm tracking-tight', tagClass: 'text-[10px]', gap: 'gap-2' },
  md: { iconSize: 36, titleClass: 'text-lg tracking-tight', tagClass: 'text-xs', gap: 'gap-2.5' },
  lg: { iconSize: 48, titleClass: 'text-2xl tracking-tight', tagClass: 'text-sm', gap: 'gap-3' },
  xl: { iconSize: 64, titleClass: 'text-3xl tracking-tight', tagClass: 'text-base', gap: 'gap-4' },
};

export const FarmTracerLogo: React.FC<FarmTracerLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className = '',
  showTagline = false,
  animated = false,
  onClick,
}) => {
  const { iconSize, titleClass, tagClass, gap } = SIZE_CONFIGS[size];

  // Theme text styling
  const isLight = theme === 'light' || theme === 'white';
  const textColor = isLight ? 'text-white' : 'text-slate-900';
  const accentColor = isLight ? 'text-emerald-400' : 'text-emerald-600';
  const subtextColor = isLight ? 'text-slate-400' : 'text-slate-500';

  const logoIcon = (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-2xl transition-all ${
        animated ? 'animate-logo-pulse' : ''
      }`}
      style={{ width: iconSize, height: iconSize }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="ft-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>

          <linearGradient id="ft-grad-leaf" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>

          <linearGradient id="ft-grad-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#065f46" stopOpacity="0.2" />
          </linearGradient>

          <filter id="ft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#059669" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer Rounded Container Badge */}
        <rect width="64" height="64" rx="16" fill="url(#ft-grad-bg)" />

        {/* Subtle Trace Mesh Lines / Lattice */}
        <path
          d="M16 48 L32 38 L48 48 M32 38 L32 18"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.35"
          strokeDasharray="2 2"
        />

        {/* Shielding Trust Arc */}
        <path
          d="M12 28 C12 44 32 54 32 54 C32 54 52 44 52 28 V18 L32 10 L12 18 Z"
          stroke="url(#ft-grad-leaf)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* Sprout & Trace Core - Central Node */}
        {/* Left Leaf */}
        <path
          d="M32 36 C24 34 20 25 24 17 C31 18 32 26 32 36 Z"
          fill="url(#ft-grad-leaf)"
          opacity="0.95"
        />
        {/* Right Leaf */}
        <path
          d="M32 36 C40 34 44 23 37 15 C31 17 31 27 32 36 Z"
          fill="#ffffff"
          opacity="0.85"
        />
        {/* Central Sprout Stem */}
        <path
          d="M32 44 V26"
          stroke="#ffffff"
          strokeWidth="2.75"
          strokeLinecap="round"
        />

        {/* Verified Node Dots (Supply-Chain Handoff Points) */}
        {/* Farm Origin Node */}
        <circle cx="16" cy="48" r="3.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
        {/* Solar Cold Storage / Processing Node */}
        <circle cx="32" cy="44" r="4" fill="#ffffff" stroke="#059669" strokeWidth="2" />
        {/* Consumer Retail Node */}
        <circle cx="48" cy="48" r="3.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />

        {/* Beacon Signal Pulse on Top Apex */}
        <circle cx="32" cy="10" r="2" fill="#a7f3d0" />
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
        onClick={onClick}
        title="FarmTracer - Cold-Chain & Food Traceability"
      >
        {logoIcon}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center ${gap} select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        {logoIcon}
        <div className="flex items-center gap-1 font-['Space_Grotesk',sans-serif]">
          <span className={`font-extrabold ${titleClass} ${textColor}`}>FARM</span>
          <span className={`font-extrabold ${titleClass} ${accentColor}`}>TRACER</span>
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xs select-none ${className}`}
        onClick={onClick}
      >
        {logoIcon}
        <div>
          <div className="flex items-center gap-1 font-['Space_Grotesk',sans-serif]">
            <span className={`font-extrabold text-xs ${textColor}`}>FARM</span>
            <span className={`font-extrabold text-xs ${accentColor}`}>TRACER</span>
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-bold tracking-wider uppercase">
              SUPER-PS
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Solar Cold-Chain & Traceability</p>
        </div>
      </div>
    );
  }

  // Default: 'full'
  return (
    <div
      className={`inline-flex items-center ${gap} select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      {logoIcon}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 font-['Space_Grotesk',sans-serif] leading-none">
          <span className={`font-extrabold ${titleClass} ${textColor}`}>FARM</span>
          <span className={`font-extrabold ${titleClass} ${accentColor}`}>TRACER</span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-wide">
            SUPER-PS
          </span>
        </div>
        {(showTagline || size === 'lg' || size === 'xl') && (
          <span className={`${tagClass} ${subtextColor} font-medium tracking-tight mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]`}>
            Solar Cold-Chain & Food Traceability
          </span>
        )}
      </div>
    </div>
  );
};
