import React from 'react';
import { 
  Radio, 
  Cpu, 
  Battery, 
  Clock, 
  Wifi, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight 
} from 'lucide-react';
import { DeviceStatus } from '../../types';
import { StatusIndicator } from '../common/StatusIndicator';

interface DeviceStatusCardProps {
  device: DeviceStatus;
  onNavigateToDevice?: () => void;
  id?: string;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  device,
  onNavigateToDevice,
  id = 'device-status-card',
}) => {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#0A6847]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Device Status
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {device.deviceId}
          </span>
        </div>

        {/* 2x2 Grid of Status Items */}
        <div className="grid grid-cols-2 gap-3.5 my-4">
          {/* AirGuard Device */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              AirGuard Device
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusIndicator status={device.connected ? 'safe' : 'offline'} size="sm" />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {device.connected ? 'Connected' : 'Waiting for device'}
              </span>
            </div>
          </div>

          {/* ESP32 Hub */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              ESP32 Controller
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Cpu className={`w-3.5 h-3.5 ${device.esp32Connected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {device.esp32Connected ? 'Connected' : 'Standby / Unpaired'}
              </span>
            </div>
          </div>

          {/* Sensors count */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sensors Active
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className={`w-3.5 h-3.5 ${device.connected ? 'text-[#0A6847]' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {device.connected ? `${device.activeSensorsCount}/${device.totalSensorsCount} Active` : 'Standby'}
              </span>
            </div>
          </div>

          {/* Battery */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Battery Level
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Battery className={`w-3.5 h-3.5 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {device.connected ? `${device.batteryLevel}%` : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Sync telemetry line */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 py-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            Last Sync: <strong className="text-slate-700 font-semibold">{device.connected ? `${device.lastSyncSecondsAgo} sec ago` : 'Awaiting link'}</strong>
          </span>
          <span className="text-slate-400 text-[11px] font-medium">
            BLE Interface
          </span>
        </div>
      </div>

      {/* Button link to details */}
      {onNavigateToDevice && (
        <button
          type="button"
          onClick={onNavigateToDevice}
          className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0A6847] border border-slate-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Hardware & Sensor Diagnostics</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
