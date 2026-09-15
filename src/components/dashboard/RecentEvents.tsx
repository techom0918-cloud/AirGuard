import React, { useState } from 'react';
import { EnvironmentalEvent } from '../../types';
import { EventCard } from '../events/EventCard';
import { ArrowRight, History } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface RecentEventsProps {
  events: EnvironmentalEvent[];
  onViewAll?: () => void;
  id?: string;
}

export const RecentEvents: React.FC<RecentEventsProps> = ({
  events,
  onViewAll,
  id = 'recent-events-section',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0A6847]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Environmental Events
            </h3>
          </div>

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-semibold text-[#0A6847] hover:text-[#085338] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Events list */}
        <div className="mt-4 space-y-3">
          {events.length === 0 ? (
            <EmptyState
              title="No environmental events recorded yet"
              description="Your AirGuard device is continuously analyzing ambient particulates and will log warnings here."
            />
          ) : (
            events.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isExpanded={expandedId === event.id}
                onToggleExpand={handleToggle}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Logged automatically by AirGuard smart inhaler & pod</span>
        <span className="font-medium text-slate-600">Showing 3 most recent</span>
      </div>
    </div>
  );
};
