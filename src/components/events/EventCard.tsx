import React from 'react';
import { 
  AlertTriangle, 
  Wind, 
  CheckCircle, 
  Activity, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { EnvironmentalEvent } from '../../types';
import { Badge } from '../common/Badge';

interface EventCardProps {
  event: EnvironmentalEvent;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  showExpandButton?: boolean;
  className?: string;
  id?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isExpanded = false,
  onToggleExpand,
  showExpandButton = true,
  className = '',
  id,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Environmental Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Inhalation Event':
        return <Wind className="w-4 h-4 text-[#0A6847]" />;
      case 'Environmental Anomaly':
        return <Activity className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  const displayEventType = event.eventType === 'Inhalation Event' ? 'Inhaler Actuation' : event.eventType;

  return (
    <div
      id={id || `event-${event.id}`}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all ${className}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Type, Icon, and Timestamp */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {getEventIcon(event.eventType)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                  {displayEventType}
                </h4>
                <Badge riskLevel={event.riskLevel} size="sm">
                  {event.riskLevel === 'low'
                    ? 'Low Risk'
                    : event.riskLevel === 'moderate'
                    ? 'Moderate Risk'
                    : 'High Risk'}
                </Badge>
                {event.inhalationDetected && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Inhaler Actuation Logged
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {event.timestamp}
                </span>
                <span>•</span>
                <span>{event.date}</span>
                {event.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {event.location.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Key environmental readings and Expand toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="flex items-center gap-2 text-right">
              <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium leading-none">
                  PM2.5
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                  {event.pm25} <span className="text-[10px] font-normal text-slate-500">µg/m³</span>
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium leading-none">
                  VOC
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                  {event.voc} <span className="text-[10px] font-normal text-slate-500">ppb</span>
                </span>
              </div>
            </div>

            {showExpandButton && onToggleExpand && (
              <button
                type="button"
                onClick={() => onToggleExpand(event.id)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={isExpanded ? 'Collapse event details' : 'Expand event details'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expandable detailed snapshot */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-3">
            {/* Sensor snapshot tiles - Responsive 2/3/4 grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">PM10 Particulate</span>
                <span className="font-extrabold text-slate-900 font-['Space_Grotesk'] text-sm mt-0.5 block">{event.pm10} µg/m³</span>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Ambient Temp</span>
                <span className="font-extrabold text-slate-900 font-['Space_Grotesk'] text-sm mt-0.5 block">{event.temperature}°C</span>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Humidity</span>
                <span className="font-extrabold text-slate-900 font-['Space_Grotesk'] text-sm mt-0.5 block">{event.humidity}%</span>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Barometric Pressure</span>
                <span className="font-extrabold text-slate-900 font-['Space_Grotesk'] text-sm mt-0.5 block">{event.pressure || 1013} hPa</span>
              </div>
            </div>

            {/* Environmental trend description */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950">
              <span className="font-semibold block text-[11px] mb-0.5 text-[#0A6847]">
                Telemetry Trend: {event.environmentalTrend}
              </span>
              <p className="text-slate-700 text-xs leading-relaxed">
                {event.notes}
              </p>
            </div>

            {event.recommendationPrompt && (
              <p className="text-[11px] text-slate-500 italic">
                Follow-up Observation: {event.recommendationPrompt}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
