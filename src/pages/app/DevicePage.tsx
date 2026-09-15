import React, { useEffect, useState } from 'react';
import { DeviceStatus } from '../../types';
import { deviceService } from '../../services/deviceService';
import { LoadingState } from '../../components/common/LoadingState';
import { Badge } from '../../components/common/Badge';
import { StatusIndicator } from '../../components/common/StatusIndicator';
import {
  Radio,
  Cpu,
  Battery,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  Wifi,
  Bluetooth,
  Navigation,
  Activity,
  Layers,
  Info,
  Clock,
  Zap,
} from 'lucide-react';

export const DevicePage: React.FC = () => {
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    message: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    const unsub = deviceService.subscribeToDeviceStatus((status) => {
      setDevice(status);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleRunDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    const res = await deviceService.runSensorDiagnostic();
    setDiagnosticResult({
      message: res.message,
      timestamp: res.timestamp,
    });
    setIsDiagnosticRunning(false);
  };

  if (isLoading || !device) {
    return (
      <div className="py-12 max-w-7xl mx-auto">
        <LoadingState
          message="Interrogating Hardware Bus..."
          subMessage="Fetching ESP32 microcontroller telemetry and I2C/UART sensor statuses"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#0A6847]" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Device Management & Sensors
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Hardware status for AirGuard Smart Inhaler sleeve and companion ESP32 environmental sensor pod
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunDiagnostic}
          disabled={isDiagnosticRunning}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0A6847] hover:bg-[#085338] disabled:opacity-60 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
          <span>{isDiagnosticRunning ? 'Running Self-Test...' : 'Run Sensor Diagnostic'}</span>
        </button>
      </div>

      {diagnosticResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#0A6847] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-900">
              Hardware Diagnostic Passed ({diagnosticResult.timestamp})
            </div>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {diagnosticResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Hardware Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Connection */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>AirGuard Device</span>
            <Bluetooth className={`w-4 h-4 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StatusIndicator status={device.connected ? 'online' : 'offline'} size="md" pulse={device.connected} />
            <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
              {device.connected ? 'Connected' : 'Waiting for device'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {device.connected ? 'Bluetooth LE connection active' : 'Awaiting Bluetooth device link'}
          </p>
        </div>

        {/* Battery Level */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Battery Status</span>
            <Battery className={`w-4 h-4 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {device.connected ? `${device.batteryLevel}%` : 'Standby'}
            </span>
            {device.connected && (
              <span className="text-xs text-emerald-700 font-semibold">~36 hrs active</span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${device.connected ? 'bg-emerald-500' : 'bg-slate-300'}`}
              style={{ width: `${device.connected ? device.batteryLevel : 0}%` }}
            />
          </div>
        </div>

        {/* Firmware */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Firmware Version</span>
            <Zap className="w-4 h-4 text-[#0A6847]" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
              {device.firmwareVersion}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {device.connected ? 'Up to date • ESP-IDF v5.1.2' : 'Hardware profile loaded'}
          </p>
        </div>

        {/* Connection Quality */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Signal & Sync</span>
            <Wifi className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
              {device.connectionQuality}
            </span>
            {device.connected && (
              <span className="text-xs text-slate-400 font-mono">({device.rssi} dBm)</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {device.connected ? `Last sync ${device.lastSyncSecondsAgo} sec ago` : 'Awaiting device telemetry'}
          </p>
        </div>
      </div>

      {/* Sensor Array Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Onboard Sensor Array Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Micro-sensor telemetry readings monitored via hardware I2C/UART bus
            </p>
          </div>
          <Badge variant={device.connected ? 'green' : 'amber'} size="md">
            {device.connected ? 'All 6 Subsystems Verified' : 'Standby / Awaiting Device Link'}
          </Badge>
        </div>

        <div className="divide-y divide-slate-100">
          {device.sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${device.connected ? 'bg-emerald-50 text-[#0A6847]' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {sensor.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {sensor.model}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Operating Principle: <span className="font-medium text-slate-700">{sensor.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Telemetry Stream
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-['Space_Grotesk']">
                    {device.connected ? sensor.latestReading : 'Standby'}
                  </span>
                </div>
                <Badge variant={device.connected ? 'green' : 'neutral'} size="sm">
                  {device.connected ? 'Active' : 'Standby'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Specifications Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between text-slate-900 font-bold text-sm pb-2 border-b border-slate-200">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#0A6847]" /> Microcontroller Specifications
          </span>
          <span className="font-mono text-xs text-slate-500 font-normal">ESP32-WROOM-32E</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <span className="text-slate-400 block text-[11px]">Core Architecture</span>
            <span className="font-semibold text-slate-800">Dual-core Xtensa 32-bit LX6 @ 240MHz</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Wireless Gateway</span>
            <span className="font-semibold text-slate-800">802.11 b/g/n + BLE 4.2 BR/EDR</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Differential Flow Sleeve</span>
            <span className="font-semibold text-slate-800">MEMS Piezoresistive Airway Trigger</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
          Notice: This device interface is read-only telemetry. Actuation dosing is physically mechanical and cannot be overridden remotely.
        </p>
      </div>
    </div>
  );
};
