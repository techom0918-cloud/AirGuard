import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  MapPin,
  Sparkles,
  Radio,
  Shield,
  Activity,
  BatteryCharging,
  Cpu,
  User,
  Bell,
  Share2,
  Settings,
  LogOut,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { RiskLevel } from '../../types';
import { StatusIndicator } from '../common/StatusIndicator';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentRiskLevel: RiskLevel;
  batteryLevel?: number;
  isDeviceConnected?: boolean;
  onSimulateRisk?: (level: RiskLevel) => void;
  onCloseMobile?: () => void;
  onOpenDevSimulator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRiskLevel,
  batteryLevel = 0,
  isDeviceConnected = false,
  onSimulateRisk,
  onCloseMobile,
  onOpenDevSimulator,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState<number>(2);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    alertService.getUnreadCount().then(setUnreadAlerts);
  }, []);

  const navItems = [
    {
      to: '/app/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      to: '/app/alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? unreadAlerts : undefined,
    },
    {
      to: '/app/history',
      label: 'Event History',
      icon: History,
      badge: undefined,
    },
    {
      to: '/app/analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: undefined,
    },
    {
      to: '/app/map',
      label: 'Trigger Map',
      icon: MapPin,
      badge: undefined,
    },
    {
      to: '/app/insights',
      label: 'AI Insights',
      icon: Sparkles,
      badge: undefined,
    },
    {
      to: '/app/device',
      label: 'Device Status',
      icon: Radio,
      badge: undefined,
    },
    {
      to: '/app/doctor-share',
      label: 'Doctor Share',
      icon: Share2,
      badge: undefined,
    },
    {
      to: '/app/settings',
      label: 'Settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <div className="w-10 h-10 rounded-xl bg-[#0A6847] text-white flex items-center justify-center shadow-xs group-hover:bg-[#085338] transition-colors">
            <Shield className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 font-['Space_Grotesk']">
                AIRGUARD
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-[#0A6847] border border-emerald-200">
                PROACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Smart Inhaler System
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Monitoring & Diagnostics
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0A6847] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.badge > 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom status & User profile */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {/* Device Quick Status (Honest Product State) */}
        <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={isDeviceConnected ? 'safe' : 'offline'}
                size="sm"
                pulse={isDeviceConnected}
              />
              <span className="text-xs font-semibold text-slate-800">Smart Inhaler</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isDeviceConnected
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                  : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}
            >
              {isDeviceConnected ? 'Paired' : 'Waiting for device'}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              {isDeviceConnected ? 'Sensors Active' : 'Standby'}
            </span>
            <span className="flex items-center gap-1">
              <BatteryCharging className={`w-3 h-3 ${isDeviceConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
              {isDeviceConnected ? `${batteryLevel}%` : 'No Link'}
            </span>
          </div>
        </div>

        {/* User Card & Action Shortcuts */}
        <div className="pt-1 flex items-center justify-between px-1 text-xs">
          <Link
            to="/app/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 min-w-0"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0A6847] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <span className="truncate font-semibold max-w-[90px]">
              {user?.name || 'AirGuard User'}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {onOpenDevSimulator && (
              <button
                type="button"
                onClick={onOpenDevSimulator}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Developer Testing Tools (Simulation)"
                aria-label="Developer Testing Tools"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
            <Link
              to="/app/settings"
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Public Website"
            >
              <Globe className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
