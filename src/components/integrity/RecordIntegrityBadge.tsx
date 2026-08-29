import React from 'react';
import { RecordIntegrityStatus } from '../../types';
import { ShieldCheck, RefreshCw, AlertTriangle, HelpCircle, XCircle, Clock } from 'lucide-react';

interface RecordIntegrityBadgeProps {
  status: RecordIntegrityStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RecordIntegrityBadge: React.FC<RecordIntegrityBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'VERIFIED',
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
          icon: ShieldCheck,
          dotColor: 'bg-emerald-500',
        };
      case 'RECOVERED':
        return {
          label: 'RECOVERED',
          bg: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
          icon: RefreshCw,
          dotColor: 'bg-blue-500',
        };
      case 'PARTIALLY_RECOVERED':
        return {
          label: 'PARTIALLY RECOVERED',
          bg: 'bg-amber-500/10 text-amber-800 border-amber-500/30',
          icon: AlertTriangle,
          dotColor: 'bg-amber-500',
        };
      case 'REQUIRES_REVIEW':
        return {
          label: 'REQUIRES REVIEW',
          bg: 'bg-orange-500/10 text-orange-800 border-orange-500/30',
          icon: HelpCircle,
          dotColor: 'bg-orange-500',
        };
      case 'UNRECOVERABLE':
        return {
          label: 'UNRECOVERABLE',
          bg: 'bg-rose-500/10 text-rose-800 border-rose-500/30',
          icon: XCircle,
          dotColor: 'bg-rose-500',
        };
      case 'PENDING_SYNCHRONIZATION':
        return {
          label: 'PENDING SYNCHRONIZATION',
          bg: 'bg-purple-500/10 text-purple-800 border-purple-500/30',
          icon: Clock,
          dotColor: 'bg-purple-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-500/10 text-slate-700 border-slate-500/30',
          icon: ShieldCheck,
          dotColor: 'bg-slate-500',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center font-bold font-mono tracking-wider rounded-full border shadow-2xs ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
