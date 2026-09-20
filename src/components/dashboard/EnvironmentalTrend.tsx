import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Info,
  Layers,
  AlertCircle
} from 'lucide-react';
import { EnvironmentSnapshot } from '../../types';
import { Badge } from '../common/Badge';

interface EnvironmentalTrendProps {
  snapshot: EnvironmentSnapshot;
  id?: string;
}

export const EnvironmentalTrend: React.FC<EnvironmentalTrendProps> = ({
  snapshot,
  id = 'predictive-environmental-trend',
}) => {
  const { predictiveTrend } = snapshot;
  const values = predictiveTrend.recentParticulateValues;

  const isRising = predictiveTrend.direction === 'rising';
  const isHighRisk = snapshot.riskLevel === 'high';

  return (
    <div
      id={id}
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all w-full min-w-0 flex flex-col justify-between gap-4 ${
        isHighRisk
          ? 'bg-red-50/50 border-red-200'
          : isRising
          ? 'bg-amber-50/40 border-amber-200/90'
          : 'bg-emerald-50/40 border-emerald-200/80'
      }`}
    >
      {/* Header & Trend Summary */}
      <div className="space-y-2 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Environmental Trend
          </span>
          <Badge
            variant={isHighRisk ? 'red' : isRising ? 'amber' : 'green'}
            size="sm"
            icon={<TrendingUp className="w-3 h-3" />}
          >
            {predictiveTrend.status}
          </Badge>
          <span className="text-[11px] text-slate-400 font-medium">
            ({predictiveTrend.timeframe})
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
          {predictiveTrend.changeSummary}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          {predictiveTrend.explanation}
        </p>
      </div>

      {/* Stepped Sequence PM2.5 Progression Sub-card */}
      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs w-full min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-['Space_Grotesk']">
            <Layers className="w-3.5 h-3.5 text-[#0A6847]" />
            <span>PM2.5 Progression</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 font-mono">
            3-min intervals
          </span>
        </div>

        {/* Stepped sequence pills with horizontal scroll safeguard */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar w-full min-w-0">
          {values.map((val, idx) => {
            const isLast = idx === values.length - 1;
            return (
              <React.Fragment key={idx}>
                <div
                  className={`flex-1 flex flex-col items-center justify-center min-w-[38px] sm:min-w-[42px] py-1.5 px-0.5 rounded-lg border text-center transition-all ${
                    isLast
                      ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200 text-amber-950 font-bold'
                      : 'bg-slate-50/80 border-slate-200/80 text-slate-700 font-semibold'
                  }`}
                >
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium leading-none mb-0.5">
                    t-{15 - idx * 3}m
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold font-['Space_Grotesk']">
                    {val}
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-slate-400 font-normal leading-none mt-0.5">
                    µg/m³
                  </span>
                </div>

                {!isLast && (
                  <span className="text-slate-300 font-bold text-[10px] shrink-0 select-none">
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
          <span>Baseline: 25 µg/m³</span>
          <span className="font-semibold text-amber-800">Slope: +1.07 µg/min</span>
        </div>
      </div>

      {/* Proactive pattern evaluation note */}
      <div className="flex items-start gap-2 text-[11px] font-medium text-slate-500 pt-0.5 border-t border-slate-200/50">
        <Info className="w-3.5 h-3.5 text-[#0A6847] shrink-0 mt-0.5" />
        <span className="leading-snug">
          Tracks particulate velocity before standard caution thresholds are reached.
        </span>
      </div>
    </div>
  );
};

