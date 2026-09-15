import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRiskLevel,
  batteryLevel = 78,
  isDeviceConnected = true,
  onSimulateRisk,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState<number>(2);

  useEffect(() => {
    alertService.getUnreadCount().then(setUnreadAlerts);
  }, []);

  const navItems = [
    {
      to: '/app/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      to: '/app/alerts',
      label: 'Risk Alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? `${unreadAlerts}` : undefined,
      badgeVariant: 'amber',
    },
    {
      to: '/app/history',
      label: 'Event History',
      icon: History,
    },
    {
      to: '/app/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      to: '/app/map',
      label: 'Trigger Map',
      icon: MapPin,
    },
    {
      to: '/app/insights',
      label: 'AI Insights',
      icon: Sparkles,
      badge: 'Edge',
    },
    {
      to: '/app/doctor-share',
      label: 'Doctor Share',
      icon: Share2,
    },
    {
      to: '/app/device',
      label: 'ESP32 Device',
      icon: Radio,
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 h-full flex flex-col justify-between bg-white border-r border-slate-200 select-none overflow-y-auto"
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0A6847] flex items-center justify-center text-white shadow-xs group-hover:bg-[#085338] transition-colors">
              <Shield className="w-5 h-5 text-emerald-300 fill-emerald-300/30" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-['Space_Grotesk']">
                  AIRGUARD
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ESP32
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Smart Inhaler System
              </p>
            </div>
          </Link>
        </div>

        {/* Philosophy micro-pill */}
        <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-100/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-900 font-medium">Philosophy</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              Reactive <span className="text-emerald-500">→</span> Predictive
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-0.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#ECFDF5] text-[#0A6847] font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide ${
                      item.badgeVariant === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : item.badge === 'Live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Simulation Controls for Evaluators */}
        {onSimulateRisk && (
          <div className="mx-3 mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#0A6847]" />
                Demo Simulator
              </span>
              <span className="text-[10px] text-slate-400">Sensor</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onSimulateRisk('low')}
                className={`py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  currentRiskLevel === 'low'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                }`}
              >
                Safe
              </button>
              <button
                type="button"
                onClick={() => onSimulateRisk('moderate')}
                className={`py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  currentRiskLevel === 'moderate'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
                }`}
              >
                Rising
              </button>
              <button
                type="button"
                onClick={() => onSimulateRisk('high')}
                className={`py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  currentRiskLevel === 'high'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50'
                }`}
              >
                High
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status & User profile */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {/* Device Quick Status */}
        <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={isDeviceConnected ? 'online' : 'offline'}
                size="sm"
                pulse={isDeviceConnected}
              />
              <span className="text-xs font-semibold text-slate-800">ESP32 Inhaler</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              BLE Linked
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" /> 4 Sensors
            </span>
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-600" /> {batteryLevel}%
            </span>
          </div>
        </div>

        {/* User Card & Settings shortcuts */}
        <div className="pt-1 flex items-center justify-between px-1 text-xs">
          <Link
            to="/app/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 min-w-0"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0A6847] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.[0] || 'R'}
            </div>
            <span className="truncate font-semibold max-w-[90px]">
              {user?.name || 'Rishabh'}
            </span>
          </Link>

          <div className="flex items-center gap-1">
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
              onClick={() => logout()}
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
