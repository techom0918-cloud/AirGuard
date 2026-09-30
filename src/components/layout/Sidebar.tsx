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
  Bell,
  Share2,
  Pill,
  Settings,
  LogOut,
  SlidersHorizontal,
  Search,
  User,
} from 'lucide-react';
import { RiskLevel } from '../../types';
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
  onCloseMobile,
  onOpenDevSimulator,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    alertService.getUnreadCount().then(setUnreadAlerts);
  }, []);

  const navItems = [
    { to: '/app/dashboard', label: 'Patient Dashboard', icon: LayoutDashboard },
    { to: '/app/medication', label: 'Live AI Dosage', icon: Pill },
    { to: '/app/alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { to: '/app/history', label: 'Event History', icon: History },
    { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/app/map', label: 'Trigger Map', icon: MapPin },
    { to: '/app/insights', label: 'AI Insights', icon: Sparkles },
    { to: '/app/device', label: 'Device Diagnostics', icon: Radio },
    { to: '/app/doctor-share', label: 'Doctor Report', icon: Share2 },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const filteredItems = searchQuery
    ? navItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : navItems;

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200/70 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={onCloseMobile}
        >
          <div className="w-9 h-9 rounded-xl bg-[#2A8E77] text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 font-['Space_Grotesk']">
            AirGuard
          </span>
        </Link>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-full bg-slate-100/80 border border-slate-200/60 focus:outline-hidden focus:border-[#2A8E77] focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* Section Label */}
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
          Main Menu
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#2A8E77] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-[#E8F4F0] hover:text-[#2A8E77]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
        <Link
          to="/app/profile"
          onClick={onCloseMobile}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-[#E8F4F0] text-[#2A8E77] flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name?.[0] || 'A'}
          </div>
          <span className="truncate font-semibold max-w-[100px]">
            {user?.name || 'Patient'}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {onOpenDevSimulator && (
            <button
              type="button"
              onClick={onOpenDevSimulator}
              className="p-1.5 text-slate-400 hover:text-[#2A8E77] hover:bg-[#E8F4F0] rounded-lg cursor-pointer"
              title="Simulator"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
