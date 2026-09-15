import React from 'react';
import { 
  Menu, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Wifi, 
  SlidersHorizontal 
} from 'lucide-react';
import { RiskLevel } from '../../types';
import { StatusIndicator } from '../common/StatusIndicator';
import { Badge } from '../common/Badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  riskLevel: RiskLevel;
  lastUpdated: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenMobileMenu?: () => void;
  onSimulateRisk?: (level: RiskLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  riskLevel,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onOpenMobileMenu,
  onSimulateRisk,
}) => {
  const getRiskDetails = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return {
          label: 'Low Environmental Risk',
          badgeVariant: 'green' as const,
          icon: ShieldCheck,
          textClass: 'text-emerald-800',
        };
      case 'moderate':
        return {
          label: 'Moderate Trigger Risk',
          badgeVariant: 'amber' as const,
          icon: AlertTriangle,
          textClass: 'text-amber-900',
        };
      case 'high':
        return {
          label: 'High Environmental Risk',
          badgeVariant: 'red' as const,
          icon: Flame,
          textClass: 'text-red-800',
        };
    }
  };

  const riskInfo = getRiskDetails(riskLevel);
  const RiskIcon = riskInfo.icon;

  return (
    <header
      id="main-header"
      className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate font-['Space_Grotesk']">
                {title}
              </h1>
              <Badge
                variant={riskInfo.badgeVariant}
                size="sm"
                icon={<RiskIcon className="w-3 h-3" />}
                className="hidden sm:inline-flex"
              >
                {riskInfo.label}
              </Badge>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal mt-0.5 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Telemetry & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Scenario Selector for Hackathon Presentation */}
          {onSimulateRisk && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Demo:
              </span>
              <button
                type="button"
                onClick={() => onSimulateRisk('low')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  riskLevel === 'low'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Safe (Low)
              </button>
              <button
                type="button"
                onClick={() => onSimulateRisk('moderate')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  riskLevel === 'moderate'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rising (Mod)
              </button>
              <button
                type="button"
                onClick={() => onSimulateRisk('high')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  riskLevel === 'high'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                High Risk
              </button>
            </div>
          )}

          {/* Sync indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
            <StatusIndicator status="online" size="sm" pulse />
            <span className="hidden md:inline font-medium">Sync:</span>
            <span className="font-semibold text-slate-700">{lastUpdated}</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="ml-1 text-slate-400 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
                title="Refresh sensor stream"
                aria-label="Refresh sensor stream"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 block sm:hidden">
          {subtitle}
        </p>
      )}
    </header>
  );
};
