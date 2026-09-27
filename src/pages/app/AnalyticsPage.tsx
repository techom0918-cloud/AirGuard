import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { 
  mock24HourTrend, 
  mockDailyFrequency, 
  mockRiskDistribution, 
  mockTriggerCorrelations 
} from '../../data/mockAnalytics';
import { RiskDistribution } from '../../components/charts/RiskDistribution';
import { EventFrequency } from '../../components/charts/EventFrequency';
import { 
  BarChart3, 
  Activity, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Flame,
  Wind
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { TrendDataPoint } from '../../types';
import { environmentService } from '../../services/environmentService';

export const AnalyticsPage: React.FC = () => {
  const [selectedSpan, setSelectedSpan] = useState<'24h' | '7d'>('24h');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>(mock24HourTrend);

  useEffect(() => {
    let isMounted = true;
    const timeframe = selectedSpan === '24h' ? '24H' : '24H';
    environmentService.getHistoricalTrend(timeframe).then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setTrendData(data);
      }
    }).catch(() => {
      // Keep existing mock fallback if API fails
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSpan]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center shrink-0 border border-emerald-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                Environmental Telemetry Analytics
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0A6847] border border-emerald-200 hidden sm:inline">
                Real-time Logs
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Multi-sensor exposure profiles, risk distributions, and environmental co-factor correlations
            </p>
          </div>
        </div>

        {/* Timespan toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedSpan('24h')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedSpan === '24h'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 24 Hours
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpan('7d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedSpan === '7d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 7 Days
          </button>
        </div>
      </div>

      {/* Top 3 Summary Metrics - Refined to match Dashboard card visual hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Nominal Environmental Exposure */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nominal Environmental Exposure
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100/70 text-[#0A6847] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#0A6847] tracking-tight font-['Space_Grotesk']">
                84.2%
              </span>
              <span className="text-xs font-semibold text-emerald-700">Of daily hours</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Particulates & VOC stayed below continuous moderate threshold.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: '84.2%' }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <Badge variant="green" size="sm">
                Nominal
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                Target: &gt; 80%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Peak PM2.5 Reading */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Peak PM2.5 Reading
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight font-['Space_Grotesk']">
                96
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">µg/m³</span>
              <span className="text-xs text-red-600 font-semibold ml-auto">At 06:45 PM</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Localized anomaly during transit corridor construction paving.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{ width: '96%' }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <Badge variant="red" size="sm">
                Acute Spike
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                Ref Limit: 35 µg/m³
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Mean VOC Baseline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mean VOC Baseline
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-['Space_Grotesk']">
                164
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">ppb</span>
              <span className="text-xs text-slate-500 font-semibold ml-auto">Baseline</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Minimal volatile chemical concentrations logged in home micro-zone.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: '32.8%' }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <Badge variant="green" size="sm">
                Healthy Range
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                Threshold: 300 ppb
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Y-Axis Telemetry Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Continuous Particulate (PM2.5) & Volatile Gas (VOC) Telemetry
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Synchronized dual-axis trajectory mapping particulate density against organic gas concentrations
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3 h-1.5 bg-[#0A6847] rounded-full" /> PM2.5 (Left Axis, µg/m³)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3 h-1.5 bg-[#D97706] rounded-full" /> VOC (Right Axis, ppb)
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="time" 
                stroke="#94A3B8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              {/* Left Y-axis: PM2.5 in µg/m³ */}
              <YAxis
                yAxisId="pm25"
                orientation="left"
                stroke="#0A6847"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                width={32}
                tickFormatter={(v) => `${v}`}
              />
              {/* Right Y-axis: VOC in ppb */}
              <YAxis
                yAxisId="voc"
                orientation="right"
                stroke="#D97706"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 800]}
                width={36}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded-xl text-xs shadow-xl border border-slate-700">
                        <div className="font-semibold text-slate-300 text-[11px] mb-1.5 flex items-center justify-between gap-3">
                          <span>{pt.fullTime}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            pt.riskLevel === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            pt.riskLevel === 'moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {pt.riskLevel} Risk
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#0A6847]" /> PM2.5:
                            </span>
                            <span className="text-emerald-400 font-bold font-mono">
                              {pt.pm25} µg/m³
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#D97706]" /> VOC:
                            </span>
                            <span className="text-amber-400 font-bold font-mono">
                              {pt.voc} ppb
                            </span>
                          </div>
                          <div className="pt-1.5 mt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between gap-3">
                            <span>Temp: {pt.temperature}°C</span>
                            <span>Humidity: {pt.humidity}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                yAxisId="pm25"
                y={35}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'PM2.5 Moderate (35)', fill: '#0A6847', fontSize: 10, position: 'insideTopLeft' }}
              />
              <ReferenceLine
                yAxisId="pm25"
                y={75}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: 'PM2.5 High (75)', fill: '#EF4444', fontSize: 10, position: 'insideTopLeft' }}
              />
              <Line
                yAxisId="pm25"
                type="monotone"
                dataKey="pm25"
                name="PM2.5"
                stroke="#0A6847"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0A6847' }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="voc"
                type="monotone"
                dataKey="voc"
                name="VOC"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#D97706' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution & Event Frequency Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistribution data={mockRiskDistribution} />
        <EventFrequency data={mockDailyFrequency} />
      </div>

      {/* Trigger-Condition Correlation Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Environmental Co-Factor Correlations
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Empirical associations between ambient parameters and elevated risk alerts
            </p>
          </div>
          <Badge variant="green" size="sm">
            Sensor Observation Engine
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockTriggerCorrelations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {item.factor}
                </h4>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    item.observedCorrelation === 'High'
                      ? 'bg-amber-100 text-amber-900'
                      : item.observedCorrelation === 'Moderate'
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.observedCorrelation} Correlation
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#0A6847]">
                <Activity className="w-3.5 h-3.5" />
                <span>{item.rate}</span>
                <span className="text-slate-400 font-normal">• Co-Factor: {item.coFactor}</span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            Analytics represent physical sensor observations gathered by the AirGuard ESP32 device. They do not constitute clinical diagnoses.
          </span>
        </div>
      </div>
    </div>
  );
};
