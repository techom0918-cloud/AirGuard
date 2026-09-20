import React, { useEffect, useState } from 'react';
import { EnvironmentalEvent } from '../../types';
import { eventService } from '../../services/eventService';
import { TriggerMap } from '../../components/maps/TriggerMap';
import { LoadingState } from '../../components/common/LoadingState';
import { MapPin, Compass } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    eventService.getEvents().then((data) => {
      setEvents(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto">
        <LoadingState
          message="Loading Environmental Observations..."
          subMessage="Mapping localized observations across event coordinates"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center shrink-0 border border-emerald-100">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                Environmental Exposure Map
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0A6847] border border-emerald-200">
                8 Observation Zones
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Geospatial mapping of localized air quality conditions and recorded inhaler actuations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium self-start sm:self-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Simulated Event Mapping</span>
        </div>
      </div>

      {/* Main Map Component */}
      <TriggerMap events={events} />

      {/* Exposure Zone Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Highest Particulate Zone</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
            Industrial Crossway & 5th (96 µg/m³)
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Road repaving and diesel machinery caused acute particulate spike.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Moderate Trigger Zone</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
            Downtown Transit Hub (58 µg/m³)
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enclosed platform exhaust ventilation contributed to elevated dust.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clean Baseline Zone</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
            Yerba Buena Gardens Walkway (31 µg/m³)
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Optimal vegetation canopy and continuous ocean breeze dispersion.
          </p>
        </div>
      </div>
    </div>
  );
};
