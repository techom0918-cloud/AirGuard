import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailyFrequencyPoint } from '../../types';

interface EventFrequencyProps {
  data: DailyFrequencyPoint[];
  id?: string;
}

export const EventFrequency: React.FC<EventFrequencyProps> = ({
  data,
  id = 'event-frequency-chart',
}) => {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Weekly Environmental Event Frequency
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Warning detections and smart inhaler actuations across 7 days
            </p>
          </div>
        </div>

        <div className="h-60 sm:h-64 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                        <div className="font-bold text-slate-200 mb-1">{label}</div>
                        <div className="flex items-center justify-between gap-3 text-amber-300">
                          <span>Environmental Warnings:</span>
                          <span className="font-bold">{payload[0]?.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-emerald-400 mt-0.5">
                          <span>Inhalation Events:</span>
                          <span className="font-bold">{payload[1]?.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="warningEvents"
                name="Environmental Warnings"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="inhalationEvents"
                name="Inhalation Doses"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        Correlation: Higher warning days (Wed, Sat) coincided with outdoor weekend transit.
      </div>
    </div>
  );
};
