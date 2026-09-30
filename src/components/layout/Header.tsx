import React from 'react';
import { Menu, RotateCw, ShieldCheck, AlertTriangle, Flame, Search } from 'lucide-react';
import { RiskLevel } from '../../types';
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
  riskLevel,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onOpenMobileMenu,
}) => {
  const getRiskDetails = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return {
          label: 'Safe Air',
          badgeVariant: 'green' as const,
          icon: ShieldCheck,
        };
      case 'moderate':
        return {
          label: 'Moderate Air',
          badgeVariant: 'amber' as const,
          icon: AlertTriangle,
        };
      case 'high':
        return {
          label: 'High Risk',
          badgeVariant: 'red' as const,
          icon: Flame,
        };
    }
  };

  const riskInfo = getRiskDetails(riskLevel);
  const RiskIcon = riskInfo.icon;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/70 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Dashboard</span>
              <span>»</span>
              <span className="text-slate-700 font-semibold">{title}</span>
            </div>
          </div>
        </div>

        {/* Header Right Tools */}
        <div className="flex items-center gap-3">
          <Badge
            variant={riskInfo.badgeVariant}
            size="sm"
            icon={<RiskIcon className="w-3 h-3" />}
          >
            {riskInfo.label}
          </Badge>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-[#2A8E77] hover:bg-[#E8F4F0] rounded-lg transition-colors cursor-pointer"
              title="Refresh"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2A8E77]' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
