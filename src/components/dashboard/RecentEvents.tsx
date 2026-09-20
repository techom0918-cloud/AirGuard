import React, { useState } from 'react';
import { EnvironmentalEvent } from '../../types';
import { EventCard } from '../events/EventCard';
import { ArrowRight, History, PlusCircle } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface RecentEventsProps {
  events: EnvironmentalEvent[];
  onViewAll?: () => void;
  onLogActuation?: () => void;
  isLoggingActuation?: boolean;
  id?: string;
}

export const RecentEvents: React.FC<RecentEventsProps> = ({
  events,
  onViewAll,
  onLogActuation,
  isLoggingActuation = false,
  id = 'recent-events-section',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between w-full min-w-0"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0A6847]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Recent Environmental & Inhaler Events
            </h3>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {onLogActuation && (
              <button
                type="button"
                onClick={onLogActuation}
                disabled={isLoggingActuation}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0A6847] hover:bg-[#085338] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isLoggingActuation ? 'Logging Actuation...' : 'Log Inhaler Actuation'}</span>
              </button>
            )}

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
