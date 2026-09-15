import React, { useEffect, useState } from 'react';
import { EnvironmentalEvent } from '../../types';
import { eventService } from '../../services/eventService';
import { TriggerMap } from '../../components/maps/TriggerMap';
import { LoadingState } from '../../components/common/LoadingState';
import { MapPin, Info, Navigation, Shield, AlertTriangle, Compass } from 'lucide-react';

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
          message="Loading Environmental Trigger Coordinates..."
          subMessage="Projecting ESP32 GPS telemetry onto geospatial map canvas"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Intro info banner */}
      <div className="bg-[#F0FDF4] border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0A6847] text-white flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <span className="font-bold block text-sm text-slate-900">
              Active Geospatial Environmental Logging
            </span>
            <p className="text-slate-600 mt-0.5">
              The AirGuard smart inhaler pairs with your phone's GPS to geocode localized air quality anomalies whenever trigger warnings or actuations occur.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
          <span>8 Locations Tagged</span>
        </div>
      </div>

      {/* Main Map Component */}
      <TriggerMap events={events} />

      {/* Exposure Zone Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Highest Particulate Zone</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Industrial Crossway & 5th (96 µg/m³)
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Road repaving and diesel machinery caused acute particulate spike.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Moderate Trigger Zone</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Downtown Transit Hub (58 µg/m³)
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Enclosed platform exhaust ventilation contributed to elevated dust.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clean Baseline Zone</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Yerba Buena Gardens Walkway (31 µg/m³)
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Optimal vegetation canopy and continuous ocean breeze dispersion.
          </p>
        </div>
      </div>
    </div>
  );
};
