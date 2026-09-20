import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Wind, 
  Activity, 
  Clock, 
  Info
} from 'lucide-react';
import { EnvironmentalEvent, RiskLevel } from '../../types';
import { Badge } from '../common/Badge';

interface TriggerMapProps {
  events: EnvironmentalEvent[];
  id?: string;
}

export const TriggerMap: React.FC<TriggerMapProps> = ({
  events,
  id = 'environmental-trigger-map',
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [mapStyle, setMapStyle] = useState<'light' | 'terrain'>('light');

  const filteredEvents = riskFilter === 'all'
    ? events
    : events.filter((e) => e.riskLevel === riskFilter);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Map coordinates projection to SVG coordinates (San Francisco area ~37.76 to 37.80 N, -122.45 to -122.39 W)
  const minLat = 37.765;
  const maxLat = 37.800;
  const minLng = -122.450;
  const maxLng = -122.390;

  const projectToMap = (lat: number, lng: number) => {
    // Normalize to 0 - 100 percentage
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 75 + 12;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col"
    >
      {/* Map Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0A6847]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Localized Observation Zones
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Select a marker on the map canvas to inspect localized environmental telemetry
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>
          {(['all', 'low', 'moderate', 'high'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer border ${
                riskFilter === r
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {r === 'all' ? 'All Pins' : `${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas and Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Geospatial Map Canvas */}
        <div className="lg:col-span-2 relative bg-[#F4F7F5] overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
          {/* Stylized vector map background representation */}
          <div className="absolute inset-0 select-none pointer-events-none">
            {/* Grid coordinate grid lines */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(#0A6847 0.75px, transparent 0.75px), radial-gradient(#0A6847 0.75px, #F4F7F5 0.75px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Simulated urban arterial roads & waterfront */}
            <svg className="w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 400 300">
              <path
                d="M 10 80 Q 150 140 390 100"
                stroke="#94A3B8"
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M 50 10 L 320 290"
                stroke="#94A3B8"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M 0 210 Q 180 180 400 240"
                stroke="#64748B"
                strokeWidth="5"
                fill="none"
              />
              {/* Park green zone */}
              <rect x="120" y="40" width="80" height="50" rx="8" fill="#10B981" opacity="0.15" />
              <text x="135" y="68" fontSize="9" fill="#0A6847" fontWeight="bold">Yerba Buena</text>
              {/* Transit bay zone */}
              <rect x="260" y="160" width="110" height="70" rx="8" fill="#0284C7" opacity="0.12" />
              <text x="280" y="195" fontSize="9" fill="#0369A1" fontWeight="bold">Bay Transit Hub</text>
            </svg>
          </div>

          {/* Map Controls Floating Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMapStyle((prev) => (prev === 'light' ? 'terrain' : 'light'))}
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer"
              title="Toggle Map Style"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Compass pill */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/90 text-[10px] font-semibold text-slate-600 flex items-center gap-1.5 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#0A6847]" />
            <span>SF Metro Area • Simulated Coordinates</span>
          </div>

          {/* Interactive Event Markers on Map */}
          {filteredEvents.map((evt) => {
            const pos = projectToMap(evt.location.lat, evt.location.lng);
            const isSelected = evt.id === selectedEventId;
            const markerColor =
              evt.riskLevel === 'high'
                ? '#EF4444'
                : evt.riskLevel === 'moderate'
                ? '#F59E0B'
                : '#10B981';

            return (
              <div
                key={evt.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                onClick={() => setSelectedEventId(evt.id)}
              >
                {/* Halo pulse if selected or high risk */}
                {(isSelected || evt.riskLevel === 'high') && (
                  <span
                    className="absolute -inset-2 rounded-full opacity-60 animate-ping"
                    style={{ backgroundColor: markerColor }}
                  />
                )}

                {/* Marker Button */}
                <div
                  className={`relative flex items-center justify-center rounded-full p-2 text-white shadow-md transition-transform duration-200 group-hover:scale-125 ${
                    isSelected ? 'scale-125 ring-3 ring-white ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: markerColor }}
                >
                  {evt.eventType === 'Inhalation Event' ? (
                    <Wind className="w-3.5 h-3.5 text-white" />
                  ) : evt.riskLevel === 'high' ? (
                    <Activity className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                  {evt.location.name} ({evt.pm25} µg/m³)
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Location Detail Sidebar */}
        <div className="p-4 sm:p-5 flex flex-col justify-between bg-white space-y-4">
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Location Observation
                </span>
                <Badge riskLevel={selectedEvent.riskLevel} size="sm">
                  {selectedEvent.riskLevel === 'low'
                    ? 'Low Risk'
                    : selectedEvent.riskLevel === 'moderate'
                    ? 'Moderate Risk'
                    : 'High Risk'}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {selectedEvent.location.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedEvent.location.area}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{selectedEvent.date} at {selectedEvent.timestamp}</span>
                </div>
              </div>

              {/* Environmental Telemetry Metrics at This Spot */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    PM2.5 Density
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {selectedEvent.pm25} <span className="text-[10px] font-normal text-slate-500">µg/m³</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    VOC Reading
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {selectedEvent.voc} <span className="text-[10px] font-normal text-slate-500">ppb</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Temperature
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {selectedEvent.temperature}°C
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Humidity
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {selectedEvent.humidity}%
                  </span>
                </div>
              </div>

              {/* Context notes */}
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
                <span className="font-semibold text-emerald-950 block mb-1">
                  Environmental Analysis:
                </span>
                <p className="leading-relaxed text-slate-600">
                  {selectedEvent.notes}
                </p>
              </div>

              {selectedEvent.inhalationDetected && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#0A6847]" />
                  <span>Inhaler actuation logged at this location</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a pin on the map to inspect localized telemetry.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              Geospatial observations map environmental risk clusters. Does not represent medical diagnosis.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
