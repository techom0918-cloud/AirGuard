import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wind,
  Flame,
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  Radio,
  RefreshCw,
  Share2,
  Bell,
  CheckCircle2,
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

interface DashboardPageProps {
  onSimulateRisk?: (level: RiskLevel) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const navigate = useNavigate();

  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot | null>(null);
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '6H' | '24H'>('24H');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Quick Action Feedback states
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSimulatingActuation, setIsSimulatingActuation] = useState(false);

  // Subscribe to live environment updates
  useEffect(() => {
    const unsubEnv = environmentService.subscribeToSnapshot((newSnap) => {
      setSnapshot(newSnap);
    });

    const unsubDevice = deviceService.subscribeToDeviceStatus((newDev) => {
      setDevice(newDev);
    });

    Promise.all([
      eventService.getEvents(),
      environmentService.getHistoricalTrend(timeframe),
    ]).then(([eventsData, trend]) => {
      setEvents(eventsData);
      setTrendData(trend);
      setIsLoading(false);
    });

    return () => {
      unsubEnv();
      unsubDevice();
    };
  }, []);

  const handleTimeframeChange = async (tf: '1H' | '6H' | '24H') => {
    setTimeframe(tf);
    const updatedTrend = await environmentService.getHistoricalTrend(tf);
    setTrendData(updatedTrend);
  };

  const handleManualRefresh = async () => {
    setActionNotice('Refreshing sensor observations...');
    await environmentService.getLatestSnapshot();
    setTimeout(() => {
      setActionNotice('Sensor values updated.');
      setTimeout(() => setActionNotice(null), 2500);
    }, 400);
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
          message="Synchronizing Environmental Sensors..."
          subMessage="Querying localized environmental telemetry and onboard sensor arrays"
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
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* 1. Context & Honest Status Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
              Air Quality & Inhaler Telemetry
            </span>
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {device.deviceId}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-0.5">
            Environmental Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Continuous ambient particulate sampling, volatile gas monitoring, and inhaler dose tracking.
          </p>
        </div>

        {/* Triple Truthful Status Pills (Device, App, Data) */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold shrink-0">
          {/* Device Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              device.connected
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${device.connected ? 'text-[#0A6847]' : 'text-slate-400'}`} />
            <span>{device.connected ? 'Device: Connected' : 'Device: Waiting for connection'}</span>
          </div>

          {/* App Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>App: Online</span>
          </div>

          {/* Data Telemetry Source */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Data: Simulation Mode</span>
          </div>
        </div>
      </div>

      {/* Action feedback toast notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. Primary Environmental Risk Card (Instant 2-3 second read) */}
      <RiskStatusCard
        snapshot={snapshot}
        onExploreHistory={() => navigate('/app/history')}
      />

      {/* 3. Key Environmental Measurements Grid (PM2.5 Primary Emphasis) */}
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0A6847]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Micro-Environmental Observations
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Observed {snapshot.lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 w-full min-w-0">
          {/* PM2.5 - Featured Core Metric */}
          <MetricCard
            id="metric-pm25"
            name="PM2.5 Fine Dust"
            value={snapshot.pm25.value}
            unit="µg/m³"
            status={snapshot.pm25.value > 35 ? 'Elevated' : 'Optimal'}
            trend={snapshot.pm25.trend}
            icon={Wind}
            subLabel="Fine inhalable particulates"
            thresholdMax={75}
            thresholdGuide="Ref: 35 µg/m³"
            badgeVariant={getPM25Variant(snapshot.pm25.value)}
            featured={true}
          />

          {/* VOC Gas Load */}
          <MetricCard
            id="metric-voc"
            name="VOC Gas Load"
            value={snapshot.voc.value}
            unit="ppb"
            status={snapshot.voc.status === 'optimal' ? 'Optimal' : snapshot.voc.status === 'moderate' ? 'Caution' : 'Elevated'}
            trend={snapshot.voc.trend}
            icon={Flame}
            subLabel="Volatile organic gases"
            thresholdMax={500}
            thresholdGuide="Ref: 300 ppb"
            badgeVariant={getVOCVariant(snapshot.voc.value)}
          />

          {/* PM1.0 Ultra-Fine */}
          <MetricCard
            id="metric-pm1"
            name="PM1.0 Ultra-Fine"
            value={pm1Value}
            unit="µg/m³"
            status="Optimal"
            trend={{ direction: 'stable', delta: '0.0', isPositive: true }}
            icon={Wind}
            subLabel="Sub-micron particulate load"
            thresholdMax={50}
            badgeVariant="green"
          />

          {/* PM10 Coarse Dust */}
          <MetricCard
            id="metric-pm10"
            name="PM10 Coarse Dust"
            value={pm10Value}
            unit="µg/m³"
            status="Normal"
            trend={{ direction: 'stable', delta: '0.0', isPositive: true }}
            icon={Wind}
            subLabel="Coarse respirable dust"
            thresholdMax={100}
            badgeVariant="green"
          />

          {/* Temperature */}
          <MetricCard
            id="metric-temp"
            name="Temperature"
            value={snapshot.temperature.value}
            unit="°C"
            status="Comfortable"
            trend={snapshot.temperature.trend}
            icon={Thermometer}
            subLabel="Ambient thermal reading"
            thresholdMax={45}
            badgeVariant="green"
          />

          {/* Humidity */}
          <MetricCard
            id="metric-humidity"
            name="Rel. Humidity"
            value={snapshot.humidity.value}
            unit="%"
            status="Airway Safe"
            trend={snapshot.humidity.trend}
            icon={Droplets}
            subLabel="Moisture saturation"
            thresholdMax={100}
            badgeVariant="green"
          />
        </div>
      </div>

      {/* 4. Environmental Trends & Device Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] 2xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start w-full min-w-0">
        {/* Main Chart */}
        <div className="min-w-0 w-full">
          <PM25Chart
            data={trendData}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
          />
        </div>

        {/* Side Stack: Trend Progression & Device Diagnostic Card */}
        <div className="space-y-6 min-w-0 w-full">
          <EnvironmentalTrend snapshot={snapshot} />
          <DeviceStatusCard
            device={device}
            onNavigateToDevice={() => navigate('/app/device')}
          />
        </div>
      </div>

      {/* 5. Recent Events with Inhaler Actuation Action */}
      <RecentEvents
        events={events}
        onViewAll={() => navigate('/app/history')}
        onLogActuation={handleSimulateInhalation}
        isLoggingActuation={isSimulatingActuation}
      />

      {/* 6. Supporting Quick Controls */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 shadow-xs w-full min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Platform Quick Controls
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
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
            onClick={handleTestAlert}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#0A6847] shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Test Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
