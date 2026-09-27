import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
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
  TrendingUp, 
  Activity, 
  Layers, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AnalyticsPage: React.FC = () => {
  const [selectedSpan, setSelectedSpan] = useState<'24h' | '7d'>('24h');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0A6847]" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Environmental Risk Analytics
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Sensor telemetry analytics, risk distributions, and environmental co-factor correlations
          </p>
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

      {/* Top 3 Summary Metrics for Quick Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Safe Environment Exposure
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A6847] font-['Space_Grotesk']">
              84.2%
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Of daily hours</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Particulates & VOC stayed below continuous moderate threshold.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Peak PM2.5 Reading
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 font-['Space_Grotesk']">
              96 <span className="text-base font-medium text-slate-400">µg/m³</span>
            </span>
            <span className="text-xs text-red-600 font-semibold">At 06:45 PM</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Localized anomaly during transit corridor construction paving.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Mean VOC Baseline
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 font-['Space_Grotesk']">
              164 <span className="text-base font-medium text-slate-400">ppb</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold">Healthy Range</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Minimal volatile chemical concentrations logged in home micro-zone.
          </p>
        </div>
      </div>

      {/* 1 & 2. PM2.5 & VOC Trend Over Time */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              1 & 2. Continuous Particulate (PM2.5) vs Volatile Gas (VOC) Telemetry
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Dual-axis sensor trajectory across 24 hours identifying synchronized environmental surges
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3 h-1 bg-[#0A6847] rounded-full" /> PM2.5 (µg/m³)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3 h-1 bg-[#D97706] rounded-full" /> VOC (ppb / 10)
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mock24HourTrend.map((d) => ({
                ...d,
                vocScaled: Math.round(d.voc / 8), // scale for visible dual line alignment
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-700">
                        <div className="font-semibold text-slate-300 text-[11px] mb-1">
                          {pt.fullTime}
                        </div>
                        <div className="text-emerald-400 font-bold">
                          PM2.5: {pt.pm25} µg/m³
                        </div>
                        <div className="text-amber-400 font-bold">
                          VOC: {pt.voc} ppb
                        </div>
                        <div className="text-slate-300 mt-1">
                          Risk Rating: <span className="capitalize font-semibold">{pt.riskLevel}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={35}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'PM2.5 Safe Limit (35)', fill: '#0A6847', fontSize: 10 }}
              />
              <ReferenceLine
                y={75}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: 'High Caution Zone (75)', fill: '#EF4444', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="pm25"
                name="PM2.5"
                stroke="#0A6847"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0A6847' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="vocScaled"
                name="VOC"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: '#D97706' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 & 4. Risk Distribution & Event Frequency Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Risk Distribution */}
        <RiskDistribution data={mockRiskDistribution} />

        {/* 4. Environmental Event Frequency */}
        <EventFrequency data={mockDailyFrequency} />
      </div>

      {/* 5. Trigger-Condition Correlation Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              5. Environmental Co-Factor Correlations
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

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Analytics represent physical sensor observations gathered by the AirGuard ESP32 device. They do not constitute clinical diagnoses.
          </span>
        </div>
      </div>
    </div>
  );
};
