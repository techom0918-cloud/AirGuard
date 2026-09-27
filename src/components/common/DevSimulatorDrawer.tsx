import React, { useEffect, useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Radio, 
  Cpu, 
  Bell, 
  Activity, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { RiskLevel, DeviceStatus } from '../../types';
import { environmentService } from '../../services/environmentService';
import { deviceService } from '../../services/deviceService';
import { alertService } from '../../services/alertService';
import { eventService } from '../../services/eventService';

interface DevSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRiskLevel?: RiskLevel;
}

export const DevSimulatorDrawer: React.FC<DevSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  currentRiskLevel = 'low',
}) => {
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = deviceService.subscribeToDeviceStatus(setDevice);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSetRisk = (level: RiskLevel) => {
    environmentService.setSimulatedRisk(level);
    showFeedback(`Simulated environment set to: ${level.toUpperCase()} risk.`);
  };

  const handleToggleDevice = (connected: boolean) => {
    deviceService.toggleConnection(connected);
    showFeedback(connected ? 'Device state: Simulated hardware connected.' : 'Device state: Disconnected (Default).');
  };

  const handleTriggerActuation = async () => {
    showFeedback('Differential flow triggered: Logged inhaler actuation event.');
  };

  const handleTriggerAlert = async () => {
    await alertService.addAlert({
      title: 'Simulated Alert Event',
      message: 'Developer test alert injected into Alert Center.',
      severity: 'moderate',
      category: 'environmental',
      relatedReadings: [{ metric: 'PM2.5', value: '45 µg/m³' }],
    });
    showFeedback('Simulated alert dispatched to Alert Center.');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Developer Testing Tools
              </h3>
              <p className="text-[11px] text-slate-500">
                Internal Simulation & Scenario Controls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            These controls are strictly for local frontend evaluation. They are isolated from the customer-facing product experience.
          </span>
        </div>

        {feedback && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0A6847] shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* 1. Environmental Risk Scenario */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              1. Environmental Risk Scenario
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSetRisk('low')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  currentRiskLevel === 'low'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Low Risk</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRisk('moderate')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  currentRiskLevel === 'moderate'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Moderate</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRisk('high')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  currentRiskLevel === 'high'
                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>High Risk</span>
              </button>
            </div>
          </div>

          {/* 2. Device Connection State */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              2. Hardware Connection Simulation
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Device Status:</span>
                <span className={`font-bold uppercase text-[11px] ${device?.connected ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {device?.connected ? 'Simulated Connected' : 'Disconnected (Honest)'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleDevice(false)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                    !device?.connected
                      ? 'bg-slate-700 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Disconnected
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDevice(true)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                    device?.connected
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  Connected
                </button>
              </div>
            </div>
          </div>

          {/* 3. Event & Telemetry Injections */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              3. Telemetry Event Injections
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleTriggerActuation}
                className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#0A6847]" />
                  Trigger Inhaler Actuation Event
                </span>
                <span className="text-[10px] text-slate-400 font-mono">FLOW</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerAlert}
                className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  Inject Simulated Environmental Alert
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ALERT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Testing Tools
          </button>
        </div>
      </div>
    </div>
  );
};
