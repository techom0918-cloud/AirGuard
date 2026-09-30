import React, { useState } from 'react';
import { EnvironmentalEvent } from '../../types';
import { TriggerMap } from '../../components/maps/TriggerMap';
import { formatDistance } from '../../services/geoService';
import { MapPin, Radio, Shield, AlertTriangle, Pill, ChevronRight } from 'lucide-react';
import { medicationService } from '../../services/medicationService';
import { evaluateClientAiDosage } from '../../services/medicationService';

/** Get triage color class based on PM2.5 */
function getDosageBadge(pm25: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
  dosage: string;
  emoji: string;
} {
  if (pm25 > 75) {
    return {
      bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300',
      label: 'High Risk (Danger)',
      dosage: '150 µL',
      emoji: '🔴',
    };
  } else if (pm25 > 35) {
    return {
      bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300',
      label: 'Moderate Risk Warning',
      dosage: '100 µL',
      emoji: '🔴',
    };
  }
  return {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300',
    label: 'Safe Zone (Healthy Air)',
    dosage: '50 µL',
    emoji: '🟢',
  };
}

export const MapPage: React.FC = () => {
  const [activeLocationName, setActiveLocationName] = useState<string>('Greater Noida');
  const [activeRadiusKm, setActiveRadiusKm] = useState<number>(5);
  const [currentEvents, setCurrentEvents] = useState<EnvironmentalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EnvironmentalEvent | null>(null);

  // Get active patient for dosage calculation
  const activePatient = medicationService.getActivePatient();

  // Compute dosage for selected pin
  const pinDosage = selectedEvent && activePatient
    ? evaluateClientAiDosage(
        {
          pm25: selectedEvent.pm25,
          aqi: Math.round(selectedEvent.pm25 * 1.6),
          humidity: 60,
          temp_c: 26,
        },
        {
          age: activePatient.age,
          mass_kg: activePatient.mass_kg,
          height_m: activePatient.height_m,
          gender: activePatient.gender,
          smoking_status: activePatient.smoking_status,
          peak_flow: activePatient.peak_flow,
          asthma_level: activePatient.asthma_level,
        }
      )
    : null;

  const badge = selectedEvent ? getDosageBadge(selectedEvent.pm25) : null;

  // Zone summary
  const highestEvent = currentEvents
    .filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm)
    .sort((a, b) => b.pm25 - a.pm25)[0] || currentEvents[0];

  const moderateEvent = currentEvents
    .filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm && e.riskLevel === 'moderate')
    .sort((a, b) => b.pm25 - a.pm25)[0] || currentEvents.find((e) => e.riskLevel === 'moderate');

  const cleanEvent = currentEvents
    .filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm && e.riskLevel === 'low')
    .sort((a, b) => a.pm25 - b.pm25)[0] || currentEvents.find((e) => e.riskLevel === 'low');

  const eventsInRadius = currentEvents.filter((e) => (e.distanceKm ?? 0) <= activeRadiusKm).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']">Trigger Map</h1>
          <p className="text-emerald-100 text-xs mt-1">
            Real-time air quality zones around <strong className="text-white">{activeLocationName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold self-start sm:self-auto">
          <Radio className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
          {eventsInRadius} zones in {activeRadiusKm} km
        </div>
      </div>

      {/* Pin-click Dosage Panel */}
      {selectedEvent && badge && (
        <div className={`rounded-2xl border p-5 ${badge.bg} ${badge.border} shadow-xs`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{badge.emoji}</span>
                <span className={`font-bold text-sm ${badge.text}`}>{selectedEvent.location.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.text}`}>
                  {badge.label}
                </span>
                {selectedEvent.distanceKm !== undefined && (
                  <span className="text-xs text-slate-400">{formatDistance(selectedEvent.distanceKm)} away</span>
                )}
              </div>
              <p className="text-xs text-slate-500">PM2.5: <strong className="text-slate-800">{selectedEvent.pm25} µg/m³</strong></p>
            </div>

            {pinDosage && activePatient && (
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${
                pinDosage.environmental_risk === 'DANGER' ? 'bg-red-600' :
                pinDosage.environmental_risk === 'WARNING' ? 'bg-blue-500' :
                'bg-[#2A8E77]'
              } text-white shadow-md`}>
                <Pill className="w-5 h-5" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">
                    {activePatient.name} at this location
                  </div>
                  <div className="text-xl font-extrabold font-['Space_Grotesk']">{pinDosage.dosage_amount}</div>
                  <div className="text-[10px] opacity-80">{pinDosage.dosage_detail}</div>
                </div>
              </div>
            )}

            {!activePatient && (
              <div className="text-xs text-slate-500 italic">
                Add a patient in the Dosage tab to see location-specific recommendations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hint when no pin selected */}
      {!selectedEvent && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#E8F4F0] border border-[#2A8E77]/20 text-xs text-[#2A8E77] font-semibold">
          <MapPin className="w-4 h-4 shrink-0" />
          Tap any map pin to see the dosage recommendation for that location
        </div>
      )}

      {/* Main Map */}
      <TriggerMap
        onLocationChange={(locName, radius, evts) => {
          setActiveLocationName(locName);
          setActiveRadiusKm(radius);
          setCurrentEvents(evts);
        }}
        onPinSelect={(evt: EnvironmentalEvent) => setSelectedEvent(evt)}
      />

      {/* Zone Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High */}
        <div
          onClick={() => highestEvent && setSelectedEvent(highestEvent)}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase mb-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Highest Particulate
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
            {highestEvent ? `${highestEvent.location.name}` : 'Scanning...'}
          </h4>
          {highestEvent && (
            <>
              <p className="text-xs text-slate-500 mt-1">PM2.5: <strong>{highestEvent.pm25} µg/m³</strong></p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold">
                🔴 {getDosageBadge(highestEvent.pm25).dosage} recommended
              </div>
            </>
          )}
        </div>

        {/* Moderate */}
        <div
          onClick={() => moderateEvent && setSelectedEvent(moderateEvent)}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase mb-2">
            <MapPin className="w-3.5 h-3.5" /> Moderate Zone
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {moderateEvent ? `${moderateEvent.location.name}` : 'Transit & dining hubs'}
          </h4>
          {moderateEvent && (
            <>
              <p className="text-xs text-slate-500 mt-1">PM2.5: <strong>{moderateEvent.pm25} µg/m³</strong></p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                🔵 {getDosageBadge(moderateEvent.pm25).dosage} recommended
              </div>
            </>
          )}
        </div>

        {/* Clean */}
        <div
          onClick={() => cleanEvent && setSelectedEvent(cleanEvent)}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase mb-2">
            <Shield className="w-3.5 h-3.5" /> Clean Zone
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {cleanEvent ? `${cleanEvent.location.name}` : 'Green parks & trails'}
          </h4>
          {cleanEvent && (
            <>
              <p className="text-xs text-slate-500 mt-1">PM2.5: <strong>{cleanEvent.pm25} µg/m³</strong></p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                🟢 {getDosageBadge(cleanEvent.pm25).dosage} recommended
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
