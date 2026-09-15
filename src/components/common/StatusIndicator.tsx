import React from 'react';
import { RiskLevel } from '../../types';

interface StatusIndicatorProps {
  status: 'safe' | 'attention' | 'warning' | 'online' | 'offline' | RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
  id?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  pulse = true,
  className = '',
  id,
}) => {
  let colorClass = 'bg-emerald-500';
  let ringClass = 'ring-emerald-200';
  let label = 'Safe';

  switch (status) {
    case 'safe':
    case 'low':
    case 'online':
      colorClass = 'bg-emerald-600';
      ringClass = 'ring-emerald-200';
      label = 'Low Risk';
      break;
    case 'attention':
    case 'moderate':
      colorClass = 'bg-amber-500';
      ringClass = 'ring-amber-200';
      label = 'Moderate Risk';
      break;
    case 'warning':
    case 'high':
      colorClass = 'bg-red-600';
      ringClass = 'ring-red-200';
      label = 'High Risk';
      break;
    case 'offline':
      colorClass = 'bg-slate-400';
      ringClass = 'ring-slate-200';
      label = 'Offline';
      break;
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  }[size];

  return (
    <span
      id={id}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title={label}
      aria-label={label}
    >
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colorClass}`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full ring-2 ${ringClass} ${colorClass} ${sizeClasses}`}
      />
    </span>
  );
};
