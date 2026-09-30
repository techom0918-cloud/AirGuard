import React, { useEffect, useState } from 'react';
import { EnvironmentalEvent, RiskLevel, EventType } from '../../types';
import { eventService } from '../../services/eventService';
import { EventFilters } from '../../components/events/EventFilters';
import { EventCard } from '../../components/events/EventCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { History, Download, Calendar, Filter, Sparkles, Wind } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'all'>('all');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadEvents = async () => {
    setIsLoading(true);
    const data = await eventService.getEvents({
      searchQuery,
      riskLevel: selectedRisk,
      eventType: selectedType,
    });
    setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [searchQuery, selectedRisk, selectedType]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIds.size === events.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(events.map((e) => e.id)));
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedRisk('all');
    setSelectedType('all');
  };

  // Export event history summary as CSV download
  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Date,Type,Risk,PM2.5,PM10,VOC,Temp,Humidity,Location,Inhalation\n';
    const rows = events
      .map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.date}","${e.eventType}","${e.riskLevel}",${e.pm25},${e.pm10},${e.voc},${e.temperature},${e.humidity},"${e.location.name}",${e.inhalationDetected}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airguard-event-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']">Event History</h1>
          <p className="text-emerald-100 text-xs mt-1">Sensor warnings, spikes & inhaler actuations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all cursor-pointer border border-white/30"
          >
            {expandedIds.size === events.length ? 'Collapse All' : 'Expand All'}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-2 rounded-full bg-white text-[#2A8E77] font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <EventFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRisk={selectedRisk}
        onRiskChange={setSelectedRisk}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onReset={handleReset}
      />

      {/* Events List */}
      {isLoading ? (
        <LoadingState message="Filtering event history..." subMessage="Querying local event datastore" />
      ) : events.length === 0 ? (
        <EmptyState
          title="No environmental events match your filters"
          description="Try clearing search filters or changing the selected risk level to view previous records."
          action={{
            label: 'Clear Filters',
            onClick: handleReset,
          }}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {events.length} recorded events</span>
            <span>Sorted chronologically (Newest first)</span>
          </div>

          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isExpanded={expandedIds.has(event.id)}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};
