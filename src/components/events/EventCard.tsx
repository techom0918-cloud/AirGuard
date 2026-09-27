import React from 'react';
import { 
  AlertTriangle, 
  Wind, 
  CheckCircle, 
  Activity, 
  MapPin, 
  Calendar, 
  Clock, 
  Thermometer, 
  Droplets,
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

  const getRiskBorder = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'moderate':
        return 'border-l-4 border-l-amber-400';
      default:
        return 'border-l-4 border-l-emerald-500';
    }
  };

  return (
    <div
      id={id || `event-${event.id}`}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all ${getRiskBorder(
        event.riskLevel
      )} ${className}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Type, Icon, and Timestamp */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {getEventIcon(event.eventType)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {event.eventType}
                </h4>
                <Badge riskLevel={event.riskLevel} size="sm">
                  {event.riskLevel === 'low'
                    ? 'Low Risk'
                    : event.riskLevel === 'moderate'
                    ? 'Moderate Risk'
                    : 'High Risk'}
                </Badge>
                {event.inhalationDetected && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Inhalation Logged
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {event.timestamp}
                </span>
                <span>•</span>
                <span>{event.date}</span>
                {event.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
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
              <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium leading-none">
                  PM2.5
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                  {event.pm25} <span className="text-[10px] font-normal text-slate-500">µg/m³</span>
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 hidden xs:block">
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
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
            {/* Sensor snapshot tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">PM10 Particulate</span>
                <span className="font-bold text-slate-800">{event.pm10} µg/m³</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Ambient Temp</span>
                <span className="font-bold text-slate-800">{event.temperature}°C</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Humidity</span>
                <span className="font-bold text-slate-800">{event.humidity}%</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Barometric Pressure</span>
                <span className="font-bold text-slate-800">{event.pressure || 1013} hPa</span>
              </div>
            </div>

            {/* Environmental trend description */}
            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-900">
              <span className="font-semibold block text-[11px] mb-0.5">
                Telemetry Trend: {event.environmentalTrend}
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
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
