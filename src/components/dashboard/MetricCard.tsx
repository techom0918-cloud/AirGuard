import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  LucideIcon 
} from 'lucide-react';
import { MetricTrend } from '../../types';
import { Badge } from '../common/Badge';

interface MetricCardProps {
  id?: string;
  name: string;
  value: number | string;
  unit: string;
  status: string;
  trend: MetricTrend;
  icon: LucideIcon;
  subLabel?: string;
  thresholdMax?: number;
  currentNumericValue?: number;
  badgeVariant?: 'green' | 'amber' | 'red' | 'neutral' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  name,
  value,
  unit,
  status,
  trend,
  icon: Icon,
  subLabel,
  thresholdMax = 100,
  currentNumericValue,
  badgeVariant = 'green',
}) => {
  // Render trend icon and text
  const renderTrend = () => {
    if (trend.direction === 'rising') {
      return (
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            trend.isPositive ? 'text-emerald-700' : 'text-amber-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend.delta}</span>
        </span>
      );
    }
    if (trend.direction === 'falling') {
      return (
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            trend.isPositive ? 'text-emerald-700' : 'text-slate-600'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{trend.delta}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
        <Minus className="w-3.5 h-3.5" />
        <span>{trend.delta}</span>
      </span>
    );
  };

  // Safe percentage calculation for threshold bar
  const numericVal = typeof value === 'number' ? value : currentNumericValue ?? 0;
  const fillPercent = Math.min(100, Math.max(8, (numericVal / thresholdMax) * 100));

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
    >
      <div>
        {/* Header row: Name and Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {name}
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0A6847] flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Big metric reading */}
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
            {value}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            {unit}
          </span>
        </div>

        {subLabel && (
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {subLabel}
          </p>
        )}
      </div>

      {/* Threshold micro-meter */}
      <div className="mt-4 space-y-2">
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              badgeVariant === 'green'
                ? 'bg-emerald-500'
                : badgeVariant === 'amber'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Footer row: Status badge and Trend indicator */}
        <div className="flex items-center justify-between pt-1">
          <Badge variant={badgeVariant} size="sm">
            {status}
          </Badge>
          <div>{renderTrend()}</div>
        </div>
      </div>
    </div>
  );
};
