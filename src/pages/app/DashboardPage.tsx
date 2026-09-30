import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wind,
  Thermometer,
  Droplets,
  Activity,
  Pill,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  EnvironmentSnapshot,
  EnvironmentalEvent,
  DeviceStatus,
  TrendDataPoint,
} from '../../types';
import { environmentService } from '../../services/environmentService';
import { eventService } from '../../services/eventService';
import { deviceService } from '../../services/deviceService';
import { medicationService } from '../../services/medicationService';

import { PM25Chart } from '../../components/charts/PM25Chart';
import { RecentEvents } from '../../components/dashboard/RecentEvents';
import { LoadingState } from '../../components/common/LoadingState';

import { useAuth } from '../../context/AuthContext';

/** Generate ticker messages based on current conditions */
function buildTickerMessages(snap: EnvironmentSnapshot, dosage: string, patientName: string): string[] {
  const msgs: string[] = [];

  if (snap.riskScore > 150 || snap.pm25.value > 75) {
    msgs.push(`🔴 DANGER ZONE: ${patientName} requires ${dosage} Rescue Inhaler before outdoor activity — PM2.5 is critically high at ${snap.pm25.value} µg/m³`);
    msgs.push(`🔴 AQI ${snap.riskScore}: Critical pollution. Carry rescue inhaler immediately.`);
  } else if (snap.riskScore > 70 || snap.pm25.value > 35) {
    msgs.push(`🔴 WARNING: Moderate air pollution (AQI ${snap.riskScore}): ${patientName} should take ${dosage} before going outdoors`);
    msgs.push(`🔴 WARNING: PM2.5 at ${snap.pm25.value} µg/m³ — take 100 µL pre-exposure shield before outdoor activity`);
  } else {
    msgs.push(`🟢 Environment Healthy: Air quality is safe (AQI ${snap.riskScore}). ${patientName} needs 50 µL maintenance volume only (no rescue dose needed)`);
    msgs.push(`✅ Safe Conditions: PM2.5 is low at ${snap.pm25.value} µg/m³. Outdoor activities are safe.`);
  }

  if (snap.humidity.value > 80) {
    msgs.push(`🔴 WARNING: High humidity (${snap.humidity.value}%) increases airway reactivity — monitor symptoms before outdoor activity`);
  }
  if (snap.temperature.value > 35) {
    msgs.push(`🔴 WARNING: Heat alert ${snap.temperature.value}°C — extreme thermal trigger — avoid outdoor activity between 11am–4pm`);
  }
  if (snap.temperature.value < 8) {
    msgs.push(`🔴 WARNING: Cold air alert ${snap.temperature.value}°C — cold air is a known bronchospasm trigger — wear a mouth wrap`);
  }

  msgs.push(`📍 Live AI Dosage for ${patientName}: ${dosage} recommended based on current environmental conditions`);

  return msgs;
}

/** Scrolling ticker component */
const DosageTicker: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % messages.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  // KEY FIX: Any warning/alert (non-green message) is ALWAYS RED (bg-red-600)
  const isSafeMsg = messages[msgIdx]?.startsWith('🟢') || messages[msgIdx]?.startsWith('✅');
  const riskColor = isSafeMsg ? 'bg-[#2A8E77]' : 'bg-red-600';

  return (
    <div className={`${riskColor} text-white rounded-2xl overflow-hidden`}>
      <div className="flex items-center gap-0">
        {/* Static label */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-black/20 font-bold text-xs uppercase tracking-widest">
          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Dosage Alert</span>
        </div>
        {/* Rolling message */}
        <div className="flex-1 px-5 py-3 overflow-hidden">
          <p
            className="text-xs font-semibold whitespace-nowrap truncate"
            style={{
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            {messages[msgIdx]}
          </p>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot | null>(null);
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '6H' | '24H'>('24H');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tickerMessages, setTickerMessages] = useState<string[]>([]);

  useEffect(() => {
    const unsubDevice = deviceService.subscribeToDeviceStatus((newDev) => {
      setDevice(newDev);
    });
    return () => unsubDevice();
  }, []);

  const refreshDashboardData = async () => {
    try {
      const [evtsData, devData, snapData, trend] = await Promise.all([
        eventService.getEvents(),
        deviceService.getDeviceStatus(),
        environmentService.getLatestSnapshot(),
        environmentService.getHistoricalTrend(timeframe),
      ]);

      setEvents(evtsData);
      setDevice(devData);
      setSnapshot(snapData);
      setTrendData(trend);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboardData();
  }, [timeframe]);

  // Build ticker messages whenever snapshot changes
  useEffect(() => {
    if (!snapshot) return;
    const patient = medicationService.getActivePatient();
    const patientName = patient?.name || 'Patient';

    // Quick dosage estimate based on live risk score
    let dosage = '50 µL';
    if (snapshot.riskScore > 150 || snapshot.pm25.value > 75) dosage = '150 µL';
    else if (snapshot.riskScore > 70 || snapshot.pm25.value > 35) dosage = '100 µL';

    setTickerMessages(buildTickerMessages(snapshot, dosage, patientName));
  }, [snapshot]);

  if (isLoading || !snapshot || !device) {
    return (
      <div className="py-12">
        <LoadingState message="Loading telemetry..." />
      </div>
    );
  }

  const riskLevel = snapshot.riskScore > 150 ? 'DANGER' : snapshot.riskScore > 70 ? 'WARNING' : 'SAFE';
  const riskColors: Record<string, { bg: string; text: string; dot: string }> = {
    SAFE:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    WARNING: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
    DANGER:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
  };
  const rc = riskColors[riskLevel];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']">
            Good Day, {user?.name || 'Daniel Bruk'}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Live air quality monitoring &amp; dosage tracking
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/medication')}
          className="px-5 py-2.5 rounded-full bg-white text-[#2A8E77] font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-xs self-start sm:self-auto flex items-center gap-2"
        >
          <Pill className="w-4 h-4" />
          <span>Live AI Dosage</span>
        </button>
      </div>

      {/* Rolling Dosage Warning Ticker */}
      {tickerMessages.length > 0 && <DosageTicker messages={tickerMessages} />}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border shadow-xs space-y-2 cursor-pointer ${
            snapshot.pm25.value > 75
              ? 'bg-red-50 border-red-200'
              : snapshot.pm25.value > 35
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-slate-200/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">PM2.5</span>
            <Wind className="w-4 h-4 text-[#2A8E77]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk']">
            {snapshot.pm25.value} <span className="text-xs font-normal text-slate-400">µg/m³</span>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs space-y-2 cursor-pointer ${
            snapshot.riskScore > 150
              ? 'bg-red-50 border-red-200'
              : snapshot.riskScore > 70
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-slate-200/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">AQI</span>
            <Activity className="w-4 h-4 text-[#2A8E77]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk']">
            {snapshot.riskScore}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Temp</span>
            <Thermometer className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk']">
            {snapshot.temperature.value}°C
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Humidity</span>
            <Droplets className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk']">
            {snapshot.humidity.value}%
          </div>
        </div>
      </div>

      {/* Risk status + quick nav row */}
      <div className="flex flex-wrap gap-3">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold ${rc.bg} ${rc.text}`}>
          <span className={`w-2 h-2 rounded-full ${rc.dot} animate-pulse`} />
          {riskLevel === 'SAFE' ? 'Air Quality Safe' : riskLevel === 'WARNING' ? 'Moderate Risk' : 'Danger — High Risk'}
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/map')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-[#E8F4F0] hover:text-[#2A8E77] hover:border-[#2A8E77] transition-all cursor-pointer"
        >
          View Map <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/alerts')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-[#E8F4F0] hover:text-[#2A8E77] hover:border-[#2A8E77] transition-all cursor-pointer"
        >
          Alerts <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
            PM2.5 Exposure Trend
          </h3>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['1H', '6H', '24H'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-[#2A8E77] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PM25Chart data={trendData} height={260} />
      </div>

      {/* Recent Events Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
        <RecentEvents events={events.slice(0, 5)} />
      </div>
    </div>
  );
};
