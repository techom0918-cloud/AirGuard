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

        {/* Right: Telemetry & App Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
            <StatusIndicator status="online" size="sm" pulse={false} />
            <span className="hidden md:inline font-medium">App:</span>
            <span className="font-semibold text-slate-700">Online</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">{lastUpdated}</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="ml-1 text-slate-400 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
                title="Refresh observations"
                aria-label="Refresh observations"
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
