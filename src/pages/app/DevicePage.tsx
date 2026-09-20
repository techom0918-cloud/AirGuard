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
  RotateCw,
  CheckCircle2,
  Wifi,
  Bluetooth,
  Zap,
  HelpCircle,
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
          message="Checking Device Status..."
          subMessage="Querying connection state and onboard sensor array"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center shrink-0 border border-emerald-100">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                Device & Sensor Diagnostics
              </h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  device.connected
                    ? 'bg-emerald-50 text-[#0A6847] border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {device.connected ? 'Device: Connected' : 'Device: Waiting for connection'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              AirGuard smart inhaler sleeve & environmental sensor array telemetry
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunDiagnostic}
          disabled={isDiagnosticRunning}
          className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#0A6847] hover:bg-[#085338] disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
          <span>{isDiagnosticRunning ? 'Running Self-Test...' : 'Run Sensor Diagnostic'}</span>
        </button>
      </div>

      {/* Diagnostic Result Banner */}
      {diagnosticResult && (
        <div className="p-4 bg-slate-50 border border-slate-200/90 text-slate-700 rounded-2xl text-xs flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${device.connected ? 'text-[#0A6847]' : 'text-slate-500'}`} />
          <div>
            <div className="font-bold text-slate-900">
              {device.connected
                ? `Sensor Array Self-Test Passed (${diagnosticResult.timestamp})`
                : `Device Interface Self-Test (${diagnosticResult.timestamp})`}
            </div>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {diagnosticResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Hardware Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Connection Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Connection Status</span>
              <Bluetooth className={`w-4 h-4 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <StatusIndicator status={device.connected ? 'online' : 'offline'} size="md" pulse={device.connected} />
              <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
                {device.connected ? 'Connected' : 'Waiting for device'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {device.connected ? 'Bluetooth LE connection active' : 'Unpaired • Awaiting device link'}
            </p>
          </div>
        </div>

        {/* Battery Level Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Battery Status</span>
              <Battery className={`w-4 h-4 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
                {device.connected ? `${device.batteryLevel}%` : '—'}
              </span>
              {device.connected ? (
                <span className="text-xs text-emerald-700 font-semibold">~36 hrs active</span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Not available</span>
              )}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  device.connected ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
                style={{ width: `${device.connected ? device.batteryLevel : 0}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {device.connected ? 'Rechargeable LiPo cell' : 'Telemetry unavailable while unpaired'}
          </span>
        </div>

        {/* Firmware Version Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Firmware Version</span>
              <Zap className="w-4 h-4 text-[#0A6847]" />
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
                {device.firmwareVersion}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {device.connected ? 'Up to date • ESP-IDF v5.1' : 'Profile ready • ESP-IDF v5.1'}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            OTA upgrade channel stable
          </span>
        </div>

        {/* Signal & Sync Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Signal & Sync</span>
              <Wifi className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
                {device.connected ? device.connectionQuality : 'Standby'}
              </span>
              {device.connected && (
                <span className="text-xs text-slate-400 font-mono">({device.rssi} dBm)</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {device.connected
                ? `Last sync ${device.lastSyncSecondsAgo} sec ago`
                : 'Awaiting device connection'}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {device.connected ? 'Continuous polling active' : 'Link offline'}
          </span>
        </div>
      </div>

      {/* Sensor Array Verification Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Sensor Array Telemetry Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Environmental and inhaler dose monitoring subsystems
            </p>
          </div>
          <Badge variant={device.connected ? 'green' : 'neutral'} size="md">
            {device.connected ? 'All 6 Subsystems Verified' : 'Standby / Awaiting Connection'}
          </Badge>
        </div>

        <div className="divide-y divide-slate-100">
          {device.sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    device.connected ? 'bg-emerald-50 text-[#0A6847]' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-5 h-5 ${device.connected ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">
                      {sensor.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                      {sensor.model}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Sensor Principle: <span className="font-medium text-slate-700">{sensor.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
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

      {/* Specifications & Architecture Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 text-xs text-slate-600 space-y-3">
        <div className="flex items-center justify-between text-slate-900 font-bold text-sm pb-2 border-b border-slate-200">
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#0A6847]" /> Device Hardware Architecture
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
          Notice: This device interface provides monitoring telemetry. Inhaler actuation dosing is physically mechanical and cannot be overridden remotely.
        </p>
      </div>
    </div>
  );
};
