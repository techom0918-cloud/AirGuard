import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendDataPoint } from '../../types';

interface PM25ChartProps {
  data: TrendDataPoint[];
  id?: string;
  timeframe: '1H' | '6H' | '24H';
  onTimeframeChange: (tf: '1H' | '6H' | '24H') => void;
}

type MetricType = 'pm25' | 'voc' | 'temperature' | 'humidity';

export const PM25Chart: React.FC<PM25ChartProps> = ({
  data,
  id = 'environment-trend-chart',
  timeframe,
  onTimeframeChange,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('pm25');

  const metricConfig = {
    pm25: {
      label: 'PM2.5 Particulate',
      unit: 'µg/m³',
      color: '#0A6847',
      fillColor: '#ECFDF5',
      safeThreshold: 35,
      thresholdLabel: 'Moderate Risk Threshold (35 µg/m³)',
    },
    voc: {
      label: 'Volatile Compounds (VOC)',
      unit: 'ppb',
      color: '#D97706',
      fillColor: '#FFFBEB',
      safeThreshold: 300,
      thresholdLabel: 'Caution Threshold (300 ppb)',
    },
    temperature: {
      label: 'Ambient Temperature',
      unit: '°C',
      color: '#0284C7',
      fillColor: '#F0F9FF',
      safeThreshold: 32,
      thresholdLabel: 'Warm Ambient Threshold (32°C)',
    },
    humidity: {
      label: 'Relative Humidity',
      unit: '%',
      color: '#059669',
      fillColor: '#ECFDF5',
      safeThreshold: 70,
      thresholdLabel: 'High Humidity Threshold (70%)',
    },
  }[selectedMetric];

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Environmental Telemetry Over Time
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Real-time ESP32 sensor history with automated safety baseline markers
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(['1H', '6H', '24H'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {[
          { key: 'pm25' as const, label: 'PM2.5 (Particulates)' },
          { key: 'voc' as const, label: 'VOC (Gases)' },
          { key: 'temperature' as const, label: 'Temperature' },
          { key: 'humidity' as const, label: 'Humidity' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedMetric(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedMetric === tab.key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricColorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit={selectedMetric === 'temperature' ? '°' : ''}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as TrendDataPoint;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                      <div className="font-semibold text-slate-300 text-[11px] mb-1">
                        {pt.fullTime || pt.time}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-400">{metricConfig.label}:</span>
                        <span className="font-bold text-white">
                          {pt[selectedMetric]} {metricConfig.unit}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-4 text-[10px] text-slate-400">
                        <span>Risk Rating:</span>
                        <span className="capitalize font-semibold text-emerald-400">
                          {pt.riskLevel}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {metricConfig.safeThreshold && (
              <ReferenceLine
                y={metricConfig.safeThreshold}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: metricConfig.thresholdLabel,
                  position: 'insideTopRight',
                  fill: '#B45309',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={metricConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricColorGrad)"
              activeDot={{ r: 5, fill: metricConfig.color, stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: metricConfig.color }} />
          <span className="font-medium text-slate-700">
            Current {metricConfig.label}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Threshold line marks transition from low to moderate environmental caution zone
        </span>
      </div>
    </div>
  );
};
