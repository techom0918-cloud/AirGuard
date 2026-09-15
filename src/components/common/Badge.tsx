import React from 'react';
import { RiskLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'red' | 'neutral' | 'blue' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  riskLevel?: RiskLevel;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  riskLevel,
  icon,
  className = '',
  id,
}) => {
  // If riskLevel is provided, map semantically
  let resolvedVariant = variant;
  if (riskLevel) {
    if (riskLevel === 'low') resolvedVariant = 'green';
    else if (riskLevel === 'moderate') resolvedVariant = 'amber';
    else if (riskLevel === 'high') resolvedVariant = 'red';
  }

  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    red: 'bg-red-50 text-red-800 border-red-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  }[resolvedVariant];

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-semibold tracking-normal',
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${variantStyles} ${sizeStyles} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
