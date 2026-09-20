import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { RiskDistributionPoint } from '../../types';

interface RiskDistributionProps {
  data: RiskDistributionPoint[];
  id?: string;
}

export const RiskDistribution: React.FC<RiskDistributionProps> = ({
  data,
  id = 'risk-distribution-chart',
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Risk Level Distribution
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Breakdown of all recorded exposure zones
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            {total} Total Observations
          </span>
        </div>

        {/* Donut Chart with center label */}
        <div className="h-56 relative my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RiskDistributionPoint;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-emerald-400 font-bold">
                          {item.value} events ({item.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-['Space_Grotesk']">
              67%
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Nominal Zone
            </span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
          {data.map((item) => (
            <div key={item.name} className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate">{item.name}</span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 font-['Space_Grotesk']">
                {item.value} <span className="text-[10px] font-normal text-slate-400">({item.percentage}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
