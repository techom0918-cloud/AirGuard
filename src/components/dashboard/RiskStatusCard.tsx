import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Info,
  Wind,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { EnvironmentSnapshot, RiskLevel } from '../../types';
import { Badge } from '../common/Badge';

interface RiskStatusCardProps {
  snapshot: EnvironmentSnapshot;
  onExploreHistory?: () => void;
  id?: string;
}

export const RiskStatusCard: React.FC<RiskStatusCardProps> = ({
  snapshot,
  onExploreHistory,
  id = 'primary-risk-card',
}) => {
  const { riskLevel, riskScore, riskExplanation, lastUpdated } = snapshot;

  // Semantic configuration per risk tier
  const config = {
    low: {
      title: 'LOW RISK',
      headline: 'Environment currently looks safe',
      badgeLabel: 'Safe Ambient Air',
      badgeVariant: 'green' as const,
      icon: ShieldCheck,
      containerBg: 'bg-[#F0FDF4]',
      borderColor: 'border-emerald-200/90',
      textColor: 'text-emerald-950',
      accentColor: '#0A6847',
      pulseColor: 'bg-emerald-500',
      actionPrompt: 'Optimal conditions for scheduled outdoor activity. Ambient particulates remain within standard thresholds.',
    },
    moderate: {
      title: 'MODERATE RISK',
      headline: 'Potential trigger conditions detected',
      badgeLabel: 'Attention Recommended',
      badgeVariant: 'amber' as const,
      icon: AlertTriangle,
      containerBg: 'bg-amber-50/70',
      borderColor: 'border-amber-300/80',
      textColor: 'text-amber-950',
      accentColor: '#D97706',
      pulseColor: 'bg-amber-500',
      actionPrompt: 'Micro-elevations in particulate matter detected. Keeping your inhaler accessible and avoiding heavy exertion near traffic is advised.',
    },
    high: {
      title: 'HIGH RISK',
      headline: 'Significant environmental anomaly detected',
      badgeLabel: 'Environmental Warning',
      badgeVariant: 'red' as const,
      icon: AlertOctagon,
      containerBg: 'bg-red-50/70',
      borderColor: 'border-red-300/90',
      textColor: 'text-red-950',
      accentColor: '#DC2626',
      pulseColor: 'bg-red-600',
      actionPrompt: 'Sharp environmental spike observed in your immediate zone. Transition indoors or into ventilated spaces to reduce sustained exposure.',
    },
  }[riskLevel];

  const IconComponent = config.icon;

  return (
    <div
      id={id}
      className={`rounded-2xl border ${config.borderColor} ${config.containerBg} p-5 sm:p-6 shadow-xs transition-all duration-300`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Status & Immediate 3-second answer */}
        <div className="space-y-3 max-w-2xl">
          {/* Top meta row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant={config.badgeVariant} size="md">
              <span className="relative flex h-2 w-2 mr-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pulseColor}`} />
              </span>
              {config.badgeLabel}
            </Badge>

            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Updated {lastUpdated}
            </span>

            <span className="text-xs font-medium text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Environmental Risk Assessment
            </span>
          </div>

          {/* Primary Answer Title */}
          <div>
            <div className="flex items-center gap-2.5">
              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#0A6847]" style={{ color: config.accentColor }} />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Space_Grotesk']">
                {config.title}
              </h2>
            </div>
            <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">
              "{config.headline}"
            </p>
          </div>

          {/* Explanation Text */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {riskExplanation}
          </p>

          {/* Action guidance callout */}
          <div className="pt-1 flex items-start gap-2 text-xs font-medium text-slate-700 bg-white/80 rounded-xl p-3 border border-slate-200/60">
            <Info className="w-4 h-4 text-[#0A6847] shrink-0 mt-0.5" />
            <span>{config.actionPrompt}</span>
          </div>
        </div>

        {/* Right Side: Risk Score Index & Quick Summary */}
        <div className="shrink-0 flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
          <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center min-w-[150px]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl sm:text-4xl font-black font-['Space_Grotesk']" style={{ color: config.accentColor }}>
                {riskScore}
              </span>
              <span className="text-xs text-slate-400 font-medium">/100</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">
              {riskLevel === 'low' ? 'Nominal Level' : riskLevel === 'moderate' ? 'Elevated Range' : 'Critical Hazard'}
            </span>
          </div>

          {onExploreHistory && (
            <button
              type="button"
              onClick={onExploreHistory}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0A6847] hover:bg-[#085338] transition-colors shadow-xs cursor-pointer"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
