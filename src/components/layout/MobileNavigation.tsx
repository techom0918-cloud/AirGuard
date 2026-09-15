import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  MapPin,
  Sparkles,
  Share2,
  Settings,
} from 'lucide-react';
import { alertService } from '../../services/alertService';

export const MobileNavigation: React.FC = () => {
  const [unreadAlerts, setUnreadAlerts] = useState(2);

  useEffect(() => {
    alertService.getUnreadCount().then(setUnreadAlerts);
  }, []);

  const items = [
    { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/app/alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { to: '/app/map', label: 'Map', icon: MapPin },
    { to: '/app/insights', label: 'Insights', icon: Sparkles },
    { to: '/app/doctor-share', label: 'Share', icon: Share2 },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-lg"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[46px] min-h-[44px] px-1 py-1 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive
                  ? 'text-[#0A6847] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-md transition-colors relative ${
                    isActive ? 'bg-emerald-50 text-[#0A6847]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-[50px]">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
