import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { RiskLevel, EventType } from '../../types';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRisk: RiskLevel | 'all';
  onRiskChange: (risk: RiskLevel | 'all') => void;
  selectedType: EventType | 'all';
  onTypeChange: (type: EventType | 'all') => void;
  onReset: () => void;
  id?: string;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedRisk,
  onRiskChange,
  selectedType,
  onTypeChange,
  onReset,
  id = 'event-filters-bar',
}) => {
  const isFiltered = searchQuery !== '' || selectedRisk !== 'all' || selectedType !== 'all';

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by location (e.g. Downtown, Park) or notes..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200/90 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Reset button if active filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Row: Risk Level & Event Type */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Risk Level Segment */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Risk:
          </span>
          {(['all', 'low', 'moderate', 'high'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRiskChange(r)}
              className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer border flex items-center gap-1.5 ${
                selectedRisk === r
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {r === 'low' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
              {r === 'moderate' && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
              {r === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
              <span>{r === 'all' ? 'All Risk Levels' : `${r} Risk`}</span>
            </button>
          ))}
        </div>

        {/* Event Type Select */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Type:
          </span>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as EventType | 'all')}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 min-h-[34px] focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
          >
            <option value="all">All Event Types</option>
            <option value="Environmental Warning">Environmental Warning</option>
            <option value="Inhalation Event">Inhaler Actuation</option>
            <option value="Environmental Anomaly">Environmental Anomaly</option>
            <option value="Baseline Sync">Baseline Sync</option>
          </select>
        </div>
      </div>
    </div>
  );
};
