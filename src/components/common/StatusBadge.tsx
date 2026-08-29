import React from 'react';
import { VerificationState, ConditionStatus } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: VerificationState | ConditionStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm font-medium';

  switch (status) {
    case 'VERIFIED':
    case 'SAFE':
    case 'ACTIVE':
    case 'RETAILED':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold ${sizeClasses} ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{status === 'SAFE' ? 'Safe Conditions' : status}</span>
        </span>
      );
    case 'WARNING':
    case 'PENDING':
    case 'STORED':
    case 'IN_TRANSIT':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold ${sizeClasses} ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{status === 'WARNING' ? 'Condition Warning' : status}</span>
        </span>
      );
    case 'OUT_OF_RANGE':
    case 'FLAGGED':
    case 'RECALLED':
    case 'REJECTED':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold ${sizeClasses} ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{status === 'OUT_OF_RANGE' ? 'Out of Safe Range' : status}</span>
        </span>
      );
    default:
      return (
        <span
          id={`status-badge-default`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium ${sizeClasses} ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{status}</span>
        </span>
      );
  }
};
