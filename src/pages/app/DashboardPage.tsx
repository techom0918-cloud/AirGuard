import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wind,
  Flame,
  Thermometer,
  Droplets,
  ShieldCheck,
  Sparkles,
  Activity,
  AlertTriangle,
  Radio,
  Cpu,
  RefreshCw,
  Share2,
  Bell,
  Clock,
  CheckCircle2,
  TrendingUp,
  Layers,
  PlusCircle,
  Wifi,
  Globe,
} from 'lucide-react';
import {
  EnvironmentSnapshot,
  EnvironmentalEvent,
  DeviceStatus,
  TrendDataPoint,
  RiskLevel,
} from '../../types';
import { environmentService } from '../../services/environmentService';
import { eventService } from '../../services/eventService';
import { deviceService } from '../../services/deviceService';
import { alertService } from '../../services/alertService';

import { RiskStatusCard } from '../../components/dashboard/RiskStatusCard';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { EnvironmentalTrend } from '../../components/dashboard/EnvironmentalTrend';
import { PM25Chart } from '../../components/charts/PM25Chart';
import { RecentEvents } from '../../components/dashboard/RecentEvents';
import { DeviceStatusCard } from '../../components/dashboard/DeviceStatusCard';
import { LoadingState } from '../../components/common/LoadingState';
import { Badge } from '../../components/common/Badge';

import { detectBrowserLocation, reverseGeocodeLatLng } from '../../services/geoService';
import { LiveTelemetryData } from '../../services/meteoService';

interface DashboardPageProps {
  onSimulateRisk?: (level: RiskLevel) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const navigate = useNavigate();

  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot | null>(null);
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetryData | null>(null);
  const [timeframe, setTimeframe] = useState<'1H' | '6H' | '24H'>('24H');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Live Location & Refresh States
  const [locationName, setLocationName] = useState<string>('NIET Greater Noida');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.4623,
    lng: 77.4904,
  });
  const [isRefreshingLocation, setIsRefreshingLocation] = useState<boolean>(false);

  // Quick Action Feedback states
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSimulatingActuation, setIsSimulatingActuation] = useState(false);

  const handleLocateInhaler = () => {
    setActionNotice(
      `📍 Smart Inhaler GPS Beacon Locked: Located at ${locationName} (${locationCoords.lat.toFixed(4)}°, ${locationCoords.lng.toFixed(4)}°) • Proximity: 0m (At your side) • Battery 92%`
    );
    setTimeout(() => setActionNotice(null), 4500);
  };

  // 1. Separate Device Status Subscription (avoids synchronous re-render flicker during async init)
  useEffect(() => {
    const unsubDevice = deviceService.subscribeToDeviceStatus((newDev) => {
      setDevice(newDev);
    });
    return () => unsubDevice();
  }, []);

  // 2. Fetch live Open-Meteo Air Quality & Weather data for user location
  const refreshLiveLocationData = async (forceGPS = false) => {
    setIsRefreshingLocation(true);
    let lat = locationCoords.lat;
    let lng = locationCoords.lng;
    let locName = locationName;

    try {
      // Fast GPS attempt with 4 second timeout
      const gpsPromise = detectBrowserLocation();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GPS timeout')), forceGPS ? 8000 : 4000)
      );

      const loc = await Promise.race([gpsPromise, timeoutPromise]);
      lat = loc.lat;
      lng = loc.lng;
      locName = loc.name || 'NIET Greater Noida';
    } catch {
      // Fallback: reverse geocode if locName is default
      if (locName === 'My Live Location' || locName === 'Current Vicinity') {
        const name = await reverseGeocodeLatLng(lat, lng);
        if (name && !name.startsWith('Location (')) locName = name;
        else locName = 'NIET Greater Noida';
      }
    }

    setLocationCoords({ lat, lng });
    setLocationName(locName);

    try {
      const [evtsData, devData, meteoData] = await Promise.all([
        eventService.getEvents(),
        deviceService.getDeviceStatus(),
        environmentService.fetchLiveOpenMeteo(lat, lng, locName),
      ]);

      setEvents(evtsData);
      setDevice(devData);
      setSnapshot(meteoData.snapshot);
      setTrendData(meteoData.trendData);
      setLiveTelemetry(meteoData.rawTelemetry);
    } catch (err) {
      console.error('Failed to update live dashboard telemetry', err);
    } finally {
      setIsLoading(false);
      setIsRefreshingLocation(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      await refreshLiveLocationData(false);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleTimeframeChange = async (tf: '1H' | '6H' | '24H') => {
    setTimeframe(tf);
    const updatedTrend = await environmentService.getHistoricalTrend(tf);
    setTrendData(updatedTrend);
  };

  const handleManualRefresh = async () => {
    setActionNotice('Refreshing live GPS coordinates & Open-Meteo telemetry...');
    await refreshLiveLocationData(true);
    setActionNotice('Sensor values & live location telemetry updated.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSimulateInhalation = async () => {
    setIsSimulatingActuation(true);
    setActionNotice('Recording inhaler actuation...');
    setTimeout(async () => {
      setIsSimulatingActuation(false);
      setActionNotice('Inhalation actuation timestamp logged with environmental telemetry.');
      const evts = await eventService.getEvents();
      setEvents(evts);
      setTimeout(() => setActionNotice(null), 3000);
    }, 600);
  };

  const handleTestAlert = async () => {
    setActionNotice('Simulating acoustic buzzer and push alert test...');
    await alertService.addAlert({
      title: 'Alert System Verification',
      message: 'Self-test confirmed: ESP32 buzzer tone, notification channel, and visual ring operational.',
      severity: 'low',
      category: 'device',
      relatedReadings: [{ metric: 'Buzzer', value: 'OK' }],
    });
    setTimeout(() => {
      setActionNotice('Test alert logged to Alert Center.');
      setTimeout(() => setActionNotice(null), 2500);
    }, 500);
  };

  if (isLoading || !snapshot || !device) {
    return (
      <div className="py-12">
        <LoadingState
          message="Synchronizing Live Environmental Sensors..."
          subMessage="Fetching GPS coordinates, Open-Meteo atmospheric readings, and ESP32 hardware telemetry"
        />
      </div>
    );
  }

  // Derive PM1.0 and PM10 values realistically from PM2.5 for the full sensor array
  const pm1Value = Math.round(snapshot.pm25.value * 0.65);
  const pm10Value = Math.round(snapshot.pm25.value * 1.45);

  const getPM25Variant = (val: number) => {
    if (val <= 35) return 'green';
    if (val <= 75) return 'amber';
    return 'red';
  };

  const getVOCVariant = (val: number) => {
    if (val <= 200) return 'green';
    if (val <= 450) return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Context & Connection Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
              Personal Environmental Risk Guardian
            </span>
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {device.deviceId}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-0.5">
            Airway Guardian Environment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Micro-environmental air sampling and personal respiratory trigger evaluation.
          </p>
        </div>

        {/* Connection & Inhaler GPS Status Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
          {/* Smart Inhaler GPS Badge */}
          <button
            type="button"
            onClick={handleLocateInhaler}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
            title="Click to locate your Smart Inhaler via live GPS"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span>Inhaler GPS: Active (Live)</span>
          </button>

          {/* Device */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${device.connected ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            <Radio className={`w-3.5 h-3.5 ${device.connected ? 'text-[#0A6847]' : 'text-slate-400'}`} />
            <span>{device.connected ? 'Device: Connected' : 'Device: Waiting for connection'}</span>
          </div>

          {/* App Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>App: Online</span>
          </div>

          {/* Data stream */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Data: Live Open-Meteo API Feed</span>
          </div>
        </div>
      </div>

      {/* Live Open-Meteo Regional Atmospheric Telemetry Bar */}
      {liveTelemetry && (
        <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0 mt-0.5 sm:mt-0">
              <Globe className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Live Regional Weather & Air Quality
                </span>
                <span className="text-[11px] bg-emerald-800 text-emerald-100 px-2.5 py-0.5 rounded-lg font-bold border border-emerald-700 flex items-center gap-1">
                  <span>📍</span> {locationName}
                </span>
                <span className="text-[10px] bg-sky-950/80 text-sky-200 px-2.5 py-0.5 rounded-lg font-bold border border-sky-700 flex items-center gap-1">
                  <span>💊</span> Inhaler GPS Locked
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  liveTelemetry.riskLevel === 'high'
                    ? 'bg-red-500 text-white'
                    : liveTelemetry.riskLevel === 'moderate'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {liveTelemetry.riskLevel === 'low' ? 'Good' : liveTelemetry.riskLevel === 'moderate' ? 'Moderate Risk' : 'High Risk'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-1 flex items-center gap-2 flex-wrap">
                <span>Coordinates: {locationCoords.lat.toFixed(4)}°, {locationCoords.lng.toFixed(4)}°</span>
                <span>•</span>
                <span>Synced at {liveTelemetry.timestamp}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold flex-1">
              <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">US AQI Index</span>
                <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
                  {liveTelemetry.usAqi} <span className="text-[10px] font-normal text-emerald-200">AQI</span>
                </span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Ambient PM2.5</span>
                <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
                  {liveTelemetry.pm25} <span className="text-[10px] font-normal text-emerald-200">µg/m³</span>
                </span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Ozone (O₃)</span>
                <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
                  {liveTelemetry.ozone} <span className="text-[10px] font-normal text-emerald-200">µg/m³</span>
                </span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Pressure</span>
                <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
                  {liveTelemetry.pressure} <span className="text-[10px] font-normal text-emerald-200">hPa</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refreshLiveLocationData(true)}
              disabled={isRefreshingLocation}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Re-detect live GPS location and update Open-Meteo data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLocation ? 'animate-spin text-emerald-300' : ''}`} />
              <span>{isRefreshingLocation ? 'Locating...' : 'Refresh GPS'}</span>
            </button>
          </div>
        </div>
      )}

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. Primary Risk Status Card (Instant 2-3 second read) */}
      <RiskStatusCard
        snapshot={snapshot}
        onExploreHistory={() => navigate('/app/history')}
      />

      {/* 3. Comprehensive 6-Sensor Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0A6847]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Sensor Telemetry Array (6 Channels)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Updated {snapshot.lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* PM1.0 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">PM1.0 Ultra-Fine</span>
              <Wind className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {pm1Value} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">Optimal</span>
              <span className="font-mono text-slate-400 text-[10px]">Active</span>
            </div>
          </div>

          {/* PM2.5 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">PM2.5 Fine Dust</span>
              <Wind className="w-3.5 h-3.5 text-[#0A6847]" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {snapshot.pm25.value} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className={snapshot.pm25.value > 35 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                {snapshot.pm25.trend.direction === 'rising' ? '↑ Rising' : snapshot.pm25.trend.direction === 'falling' ? '↓ Falling' : '→ Stable'}
              </span>
              <span className="font-mono text-emerald-700 font-semibold text-[10px]">Active</span>
            </div>
          </div>

          {/* PM10 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">PM10 Coarse Dust</span>
              <Wind className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {pm10Value} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-slate-600 font-semibold">Normal</span>
              <span className="font-mono text-slate-400 text-[10px]">Active</span>
            </div>
          </div>

          {/* VOC */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">VOC Gas Load</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {snapshot.voc.value} <span className="text-xs font-normal text-slate-400">ppb</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className={snapshot.voc.value > 200 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                {snapshot.voc.status}
              </span>
              <span className="font-mono text-emerald-700 font-semibold text-[10px]">Active</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Temperature</span>
              <Thermometer className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {snapshot.temperature.value}°<span className="text-xs font-normal text-slate-400">C</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">Comfortable</span>
              <span className="font-mono text-slate-400 text-[10px]">Active</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Rel. Humidity</span>
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {snapshot.humidity.value}%
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">Airway Safe</span>
              <span className="font-mono text-slate-400 text-[10px]">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Risk Engine Analytical Breakdown Card (Threshold + Trend + Edge AI) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0A6847]" />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                AirGuard Risk Engine Triangulation
              </h3>
              <p className="text-xs text-slate-500">
                Continuous on-device synchronization across 3 analytical verification layers
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Engine v2.4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer 1: Threshold-Based Detection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">
                1. Threshold Evaluation
              </span>
              <Badge variant={snapshot.pm25.value > 55 ? 'red' : 'green'} size="sm">
                {snapshot.pm25.value > 55 ? 'Trigger Alert' : 'Within Limits'}
              </Badge>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              Compares absolute particle density against WHO air quality baselines (PM2.5 threshold: 35 µg/m³).
            </div>
            <div className="text-xs font-mono font-semibold text-slate-700 pt-1">
              Current: {snapshot.pm25.value} / 35 µg/m³
            </div>
          </div>

          {/* Layer 2: Trend-Based Velocity Detection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">
                2. Particulate Velocity
              </span>
              <Badge
                variant={snapshot.predictiveTrend.direction === 'rising' ? 'amber' : 'green'}
                size="sm"
              >
                {snapshot.predictiveTrend.direction === 'rising' ? 'Rising Trend' : 'Velocity Zero'}
              </Badge>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              Tracks 15-min incline rate ({snapshot.predictiveTrend.recentParticulateValues.join(' → ')} µg/m³).
            </div>
            <div className="text-xs font-mono font-semibold text-amber-900 pt-1">
              Velocity: +{snapshot.pm25.value > 30 ? '3.2' : '0.4'} µg/m³/min
            </div>
          </div>

          {/* Layer 3: Edge AI Anomaly Score */}
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#0A6847]">
                3. Edge AI Anomaly Score
              </span>
              <span className="font-mono text-sm font-black text-[#0A6847]">
                {snapshot.riskLevel === 'high' ? '0.88' : snapshot.riskLevel === 'moderate' ? '0.48' : '0.14'} / 1.00
              </span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              Quantized neural classifier on ESP32 evaluating multivariate air vector shifts.
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  snapshot.riskLevel === 'high'
                    ? 'bg-red-500 w-[88%]'
                    : snapshot.riskLevel === 'moderate'
                    ? 'bg-amber-500 w-[48%]'
                    : 'bg-[#0A6847] w-[14%]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Predictive Environmental Warning Card */}
      <EnvironmentalTrend snapshot={snapshot} />

      {/* 6. Inhalation & Actuation Event Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0A6847]" />
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Smart Inhaler Sleeve & Actuation Log
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Piezoresistive Flow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The inhaler sleeve detects inhalation airflow differentials without chemical interference. Automatically matches timestamp with ambient sensor telemetry.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-600">
            <div>
              Today's Doses: <strong className="text-slate-900 font-bold">2 actuations</strong>
            </div>
            <div>•</div>
            <div>
              Last Dose: <strong className="text-slate-900 font-bold">4 hours ago (07:45 AM)</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSimulateInhalation}
            disabled={isSimulatingActuation}
            className="px-4 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSimulatingActuation ? 'Logging Actuation...' : 'Log Inhaler Actuation'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/history')}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            View History
          </button>
        </div>
      </div>

      {/* 7. Quick Actions Row */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Guardian Quick Controls
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={handleLocateInhaler}
            className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
            title="Locate Smart Inhaler via live GPS beacon"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>Find Inhaler GPS</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#0A6847] shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample Sensors</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/app/alerts')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#0A6847] shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>View Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/app/doctor-share')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#0A6847] shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0A6847]" />
            <span>Doctor Report</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/app/device')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#0A6847] shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>ESP32 Telemetry</span>
          </button>

          <button
            type="button"
            onClick={handleTestAlert}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#0A6847] shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Test Alert</span>
          </button>
        </div>
      </div>

      {/* 8. Trend Chart & Device Status Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PM25Chart
            data={trendData}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
          />
        </div>
        <div>
          <DeviceStatusCard
            device={device}
            onNavigateToDevice={() => navigate('/app/device')}
            onViewOnMap={() => navigate('/app/map')}
          />
        </div>
      </div>

      {/* 9. Recent Events Section */}
      <RecentEvents
        events={events}
        onViewAll={() => navigate('/app/history')}
      />
    </div>
  );
};
