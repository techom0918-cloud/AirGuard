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
  thresholdGuide?: string;
  currentNumericValue?: number;
  badgeVariant?: 'green' | 'amber' | 'red' | 'neutral' | 'blue';
  featured?: boolean;
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
  thresholdGuide,
  currentNumericValue,
  badgeVariant = 'green',
  featured = false,
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
  const fillPercent = Math.min(100, Math.max(6, (numericVal / thresholdMax) * 100));

  return (
    <div
      id={id}
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between w-full min-w-0 ${
        featured
          ? 'bg-white border-emerald-300/80 ring-1 ring-emerald-100 shadow-sm'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Header row: Name and Icon */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {name}
            </span>
            {featured && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-[#0A6847] border border-emerald-200 shrink-0">
                Core
              </span>
            )}
          </div>
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
              featured ? 'bg-emerald-100/70 text-[#0A6847]' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* Big metric reading */}
        <div className="mt-2.5 flex items-baseline gap-1.5 min-w-0">
          <span
            className={`font-black text-slate-900 tracking-tight font-['Space_Grotesk'] truncate ${
              featured ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {value}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-500 shrink-0">
            {unit}
          </span>
        </div>

        {subLabel && (
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            {subLabel}
          </p>
        )}
      </div>

      {/* Threshold micro-meter & Footer */}
      <div className="mt-4 space-y-2 w-full min-w-0">
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              badgeVariant === 'green'
                ? 'bg-emerald-500'
                : badgeVariant === 'amber'
                ? 'bg-amber-500'
                : badgeVariant === 'red'
                ? 'bg-red-500'
                : 'bg-slate-400'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Footer row: Status badge, threshold guide, and Trend indicator */}
        <div className="flex items-center justify-between pt-1 gap-1 text-[11px] min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge variant={badgeVariant} size="sm">
              {status}
            </Badge>
            {thresholdGuide && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate">
                {thresholdGuide}
              </span>
            )}
          </div>
          <div className="shrink-0">{renderTrend()}</div>
        </div>
      </div>
    </div>
  );
};
