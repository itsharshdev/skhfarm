import React from 'react';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';
import { Loader2 } from 'lucide-react';

/**
 * 1. AppLoading: Full screen loading for initial app hydration
 */
export interface AppLoadingProps {
  message?: string;
  submessage?: string;
}

export const AppLoading: React.FC<AppLoadingProps> = ({
  message = 'Initializing FarmTracer Ledger...',
  submessage = 'Connecting to verified cold-chain nodes',
}) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center select-none"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 animate-ping absolute inset-0" />
        <FarmTracerLogo variant="icon-only" size="lg" animated />
      </div>
      <h2 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-white tracking-tight">
        {message}
      </h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{submessage}</p>
    </div>
  );
};

/**
 * 2. PageLoading: Container/page-level loading view
 */
export interface PageLoadingProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Decoding batch traceability & telemetry records...',
  submessage = 'Validating cryptographic chain integrity',
  className = 'py-20',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center space-y-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
          <FarmTracerLogo variant="icon-only" size="sm" animated />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-800 font-['Space_Grotesk',sans-serif]">
          {message}
        </p>
        <p className="text-xs text-slate-500">{submessage}</p>
      </div>
    </div>
  );
};

/**
 * 3. ComponentSkeleton: Universal skeleton loader for cards, tables, and blocks
 */
export interface ComponentSkeletonProps {
  type?: 'card' | 'table' | 'stat' | 'text' | 'badge';
  count?: number;
  className?: string;
}

export const ComponentSkeleton: React.FC<ComponentSkeletonProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 animate-pulse">
            <div className="h-3 w-20 bg-slate-200 rounded-md" />
            <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${className}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded-md" />
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="h-4 w-20 bg-slate-200 rounded-md" />
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-44 bg-slate-200 rounded-md" />
                <div className="h-3 w-28 bg-slate-100 rounded-md" />
              </div>
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'badge') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-3.5 bg-slate-200 rounded-md animate-pulse" style={{ width: `${85 - (i % 3) * 15}%` }} />
        ))}
      </div>
    );
  }

  // Default: 'card'
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-emerald-100 rounded-md" />
            <div className="h-4 w-12 bg-slate-200 rounded-md" />
          </div>
          <div className="h-5 w-4/5 bg-slate-200 rounded-lg" />
          <div className="h-3 w-3/5 bg-slate-100 rounded-md" />
          <div className="pt-2 border-t border-slate-100 flex justify-between">
            <div className="h-3 w-16 bg-slate-100 rounded-md" />
            <div className="h-3 w-16 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 4. InlineLoading: Compact spinner for buttons and interactive controls
 */
export interface InlineLoadingProps {
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  label,
  size = 'sm',
  className = '',
}) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Loader2 className={`${iconSizes[size]} animate-spin text-current`} />
      {label && <span>{label}</span>}
    </span>
  );
};
