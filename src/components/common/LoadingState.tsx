import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  className?: string;
  id?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading environmental telemetry...',
  subMessage = 'Synchronizing with AirGuard sensor stream',
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200/80 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 ring-4 ring-emerald-50">
        <Loader2 className="w-6 h-6 animate-spin text-[#0A6847]" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 tracking-tight">{message}</h4>
      {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-xs">{subMessage}</p>}
    </div>
  );
};
