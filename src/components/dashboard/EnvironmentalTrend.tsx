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
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${
        isHighRisk
          ? 'bg-red-50/50 border-red-200'
          : isRising
          ? 'bg-amber-50/40 border-amber-200/90'
          : 'bg-emerald-50/40 border-emerald-200/80'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left header and description */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Environmental Trend
            </span>
            <Badge
              variant={isHighRisk ? 'red' : isRising ? 'amber' : 'green'}
              size="sm"
              icon={<TrendingUp className="w-3 h-3" />}
            >
              {predictiveTrend.status}
            </Badge>
            <span className="text-xs text-slate-400 font-medium">
              ({predictiveTrend.timeframe})
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {predictiveTrend.changeSummary}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {predictiveTrend.explanation}
          </p>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-1">
            <Info className="w-3.5 h-3.5 text-[#0A6847] shrink-0" />
            <span>
              Proactive pattern recognition flags micro-increases before fixed safety limits are breached.
            </span>
          </div>
        </div>

        {/* Right Stepped Sequence Visualization (28 → 31 → 35 → 39 → 44) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Layers className="w-3.5 h-3.5 text-[#0A6847]" />
              <span>PM2.5 Interval Progression</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Every 3 mins
            </span>
          </div>

          {/* Stepped sequence pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {values.map((val, idx) => {
              const isLast = idx === values.length - 1;
              return (
                <React.Fragment key={idx}>
                  <div
                    className={`flex flex-col items-center justify-center min-w-[46px] sm:min-w-[52px] py-2 px-1.5 rounded-lg border text-center transition-all ${
                      isLast
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100 text-amber-950 font-bold'
                        : 'bg-slate-50/80 border-slate-200/90 text-slate-700 font-semibold'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">
                      t-{15 - idx * 3}m
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold font-['Space_Grotesk']">
                      {val}
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                      µg/m³
                    </span>
                  </div>

                  {!isLast && (
                    <span className="text-slate-300 font-bold text-xs shrink-0 select-none">
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Baseline: 25 µg/m³</span>
            <span className="font-semibold text-amber-800">Slope: +1.07 µg/min</span>
          </div>
        </div>
      </div>
    </div>
  );
};
