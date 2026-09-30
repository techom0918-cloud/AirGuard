import React, { useState } from 'react';
import { EnvironmentalEvent } from '../../types';
import { TriggerMap } from '../../components/maps/TriggerMap';
import { formatDistance } from '../../services/geoService';
import { MapPin, Compass, Radio, Shield, AlertTriangle, Wind } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [activeLocationName, setActiveLocationName] = useState<string>('San Francisco Metro');
  const [activeRadiusKm, setActiveRadiusKm] = useState<number>(5);
  const [currentEvents, setCurrentEvents] = useState<EnvironmentalEvent[]>([]);

  // Find dynamic zones within the active radius
  const highestParticulateEvent = currentEvents
    .filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm)
    .sort((a, b) => b.pm25 - a.pm25)[0] || currentEvents[0];

  const moderateTriggerEvent = currentEvents
    .filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm && e.riskLevel === 'moderate')
    .sort((a, b) => b.pm25 - a.pm25)[0] || currentEvents.find((e) => e.riskLevel === 'moderate');

  const cleanBaselineEvent = currentEvents
    .filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm && e.riskLevel === 'low')
    .sort((a, b) => a.pm25 - b.pm25)[0] || currentEvents.find((e) => e.riskLevel === 'low');

  const eventsInRadiusCount = currentEvents.filter(
    (e) => (e.distanceKm ?? 0) <= activeRadiusKm
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Intro Info Banner */}
      <div className="bg-[#F0FDF4] border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A6847] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Radio className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">
                Active Proximity Environmental Logging
              </span>
              <span className="bg-emerald-100/90 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                {activeRadiusKm} km Scanning Radius
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">
              The AirGuard smart inhaler monitors localized air quality anomalies around{' '}
              <strong className="text-slate-800">{activeLocationName}</strong> within a 5–10 km radius.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 font-semibold text-emerald-800 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{eventsInRadiusCount} Trigger Zones in {activeRadiusKm} km</span>
        </div>
      </div>

      {/* Main Map Component with 5-10km Proximity Detection */}
      <TriggerMap
        onLocationChange={(locName, radius, evts) => {
          setActiveLocationName(locName);
          setActiveRadiusKm(radius);
          setCurrentEvents(evts);
        }}
      />

      {/* Dynamic Exposure Zone Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highest Particulate Zone */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-red-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Highest Particulate Zone</span>
            </div>
            {highestParticulateEvent?.distanceKm !== undefined && (
              <span className="text-[10px] text-slate-400 font-mono">
                {formatDistance(highestParticulateEvent.distanceKm)} away
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {highestParticulateEvent
              ? `${highestParticulateEvent.location.name} (${highestParticulateEvent.pm25} µg/m³)`
              : 'Scanning perimeter...'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {highestParticulateEvent?.notes ||
              'High traffic or diesel combustion emissions detected in this zone.'}
          </p>
        </div>

        {/* Moderate Trigger Zone */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-600">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Moderate Trigger Zone</span>
            </div>
            {moderateTriggerEvent?.distanceKm !== undefined && (
              <span className="text-[10px] text-slate-400 font-mono">
                {formatDistance(moderateTriggerEvent.distanceKm)} away
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {moderateTriggerEvent
              ? `${moderateTriggerEvent.location.name} (${moderateTriggerEvent.pm25} µg/m³)`
              : 'Transit & dining hubs'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {moderateTriggerEvent?.notes ||
              'Enclosed platforms and localized culinary smoke contributing to elevated readings.'}
          </p>
        </div>

        {/* Clean Baseline Zone */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Clean Baseline Zone</span>
            </div>
            {cleanBaselineEvent?.distanceKm !== undefined && (
              <span className="text-[10px] text-slate-400 font-mono">
                {formatDistance(cleanBaselineEvent.distanceKm)} away
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {cleanBaselineEvent
              ? `${cleanBaselineEvent.location.name} (${cleanBaselineEvent.pm25} µg/m³)`
              : 'Green parks & trails'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {cleanBaselineEvent?.notes ||
              'Optimal vegetation canopy and persistent air dispersion creating a safe airway corridor.'}
          </p>
        </div>
      </div>
    </div>
  );
};
