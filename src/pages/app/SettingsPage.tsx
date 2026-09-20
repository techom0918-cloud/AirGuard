import React, { useEffect, useState } from 'react';
import { UserSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { Badge } from '../../components/common/Badge';
import {
  Settings as SettingsIcon,
  Bell,
  Cpu,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sliders,
  Eye,
  Volume2,
  Thermometer,
} from 'lucide-react';

interface ToggleSwitchProps {
  checked?: boolean;
  onChange: () => void;
  id?: string;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked = false,
  onChange,
  id,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    id={id}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/30 ${
      checked ? 'bg-[#0A6847]' : 'bg-slate-200'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const handleToggleNotification = (key: keyof UserSettings['notifications']) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleDevicePrefChange = (
    key: keyof UserSettings['devicePreferences'],
    value: any
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      devicePreferences: {
        ...settings.devicePreferences,
        [key]: value,
      },
    });
  };

  const handleDataSharingToggle = (key: keyof UserSettings['dataSharing']) => {
    if (!settings) return;
    setSettings({
      ...settings,
      dataSharing: {
        ...settings.dataSharing,
        [key]: !settings.dataSharing[key],
      },
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    await settingsService.updateSettings(settings);
    setIsSaving(false);
    setSaveNotice('Settings updated successfully.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Compact Header / Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <SettingsIcon className="w-4 h-4 text-[#0A6847]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Settings
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 pl-10">
            Configure application and device preferences
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847] shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 1. Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-[#0A6847]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Notification & Alert Rules
            </h3>
            <p className="text-xs text-slate-500">
              Set proactive delivery rules for environmental escalation and device notices
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                Early Predictive Particulate Warnings
              </span>
              <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
                Alert when PM2.5 or VOC exhibits sustained 15-minute rate-of-climb velocity
              </span>
            </div>
            <ToggleSwitch
              checked={settings.notifications.earlyEnvironmentalWarnings}
              onChange={() => handleToggleNotification('earlyEnvironmentalWarnings')}
              label="Early Predictive Particulate Warnings"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                High Environmental Risk Alerts
              </span>
              <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
                Immediate notification if acute absolute safety boundaries are exceeded
              </span>
            </div>
            <ToggleSwitch
              checked={settings.notifications.highRiskAlerts}
              onChange={() => handleToggleNotification('highRiskAlerts')}
              label="High Environmental Risk Alerts"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                Daily Airway Exposure Digest
              </span>
              <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
                Evening summary of cumulative hours spent in optimal vs trigger-elevated microclimates
              </span>
            </div>
            <ToggleSwitch
              checked={settings.notifications.dailySummary}
              onChange={() => handleToggleNotification('dailySummary')}
              label="Daily Airway Exposure Digest"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                Device Disconnection Notice
              </span>
              <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
                Alert if wireless pairing with the inhaler sensor pod drops for &gt; 90 seconds
              </span>
            </div>
            <ToggleSwitch
              checked={settings.notifications.deviceDisconnectedAlert}
              onChange={() => handleToggleNotification('deviceDisconnectedAlert')}
              label="Device Disconnection Notice"
            />
          </div>
        </div>
      </div>

      {/* 2. Device & Sensor Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            <Cpu className="w-3.5 h-3.5 text-[#0A6847]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Device & Sensor Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Telemetry acquisition frequency, sensory feedback, and ring indicators
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* LED Ring Brightness */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Device LED Brightness</span>
              </span>
              <Badge variant="outline" className="font-mono text-xs font-semibold bg-white text-slate-700 border-slate-200 px-2 py-0.5">
                {settings.devicePreferences.ledBrightness ?? 50}%
              </Badge>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={settings.devicePreferences.ledBrightness ?? 50}
              onChange={(e) =>
                handleDevicePrefChange('ledBrightness', parseInt(e.target.value))
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0A6847]"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>0% (Off)</span>
              <span>50%</span>
              <span>100% (Max)</span>
            </div>
            <span className="text-[11px] text-slate-500 block leading-relaxed">
              Adjusts brightness of the circular ring indicator on the physical sensor unit.
            </span>
          </div>

          {/* Buzzer Sound */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span>Audible Buzzer Cues</span>
              </span>
              <ToggleSwitch
                checked={settings.devicePreferences.buzzerEnabled}
                onChange={() =>
                  handleDevicePrefChange('buzzerEnabled', !settings.devicePreferences.buzzerEnabled)
                }
                label="Audible Buzzer Cues"
              />
            </div>
            <span className="text-[11px] text-slate-500 block leading-relaxed">
              Gentle soft-tone acoustic alert when particulate risk begins escalating steeply.
            </span>
          </div>

          {/* Sampling Frequency */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/60 border border-slate-100 sm:col-span-2">
            <label className="font-semibold text-slate-800 block text-xs sm:text-sm">
              Sensor Sampling Frequency
            </label>
            <div className="max-w-md">
              <select
                value={settings.devicePreferences.samplingFrequencySeconds ?? 5}
                onChange={(e) =>
                  handleDevicePrefChange('samplingFrequencySeconds', parseInt(e.target.value))
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all cursor-pointer"
              >
                <option value="1">1 second (High precision, ~24h battery)</option>
                <option value="5">5 seconds (Standard balance, ~48h battery)</option>
                <option value="15">15 seconds (Power saver, ~72h battery)</option>
              </select>
            </div>
            <span className="text-[11px] text-slate-500 block leading-relaxed">
              Balances continuous temporal observation fidelity against device battery preservation.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Privacy & Clinical Data Governance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A6847]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Privacy & Clinical Data Governance
            </h3>
            <p className="text-xs text-slate-500">
              Data minimization, anonymous contributions, and clinical report permissions
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                Anonymized Academic Research Contribution
              </span>
              <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
                Contribute stripped, non-identifiable particulate telemetry to university environmental health studies
              </span>
            </div>
            <ToggleSwitch
              checked={settings.dataSharing.anonymousResearchSharing}
              onChange={() => handleDataSharingToggle('anonymousResearchSharing')}
              label="Anonymized Academic Research Contribution"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                Clinical Report Generation
              </span>
              <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
                Allow secure physician summary exports and temporary verification access codes
              </span>
            </div>
            <ToggleSwitch
              checked={settings.dataSharing.physicianReportGeneration}
              onChange={() => handleDataSharingToggle('physicianReportGeneration')}
              label="Clinical Report Generation"
            />
          </div>
        </div>
      </div>

      {/* 4. Application Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            <Sliders className="w-3.5 h-3.5 text-[#0A6847]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Application Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Display units and regional atmospheric representation standards
            </p>
          </div>
        </div>

        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                Temperature Unit
              </span>
            </div>
            <span className="text-slate-500 text-xs block mt-0.5 leading-relaxed">
              Standard metric or imperial scale used across environmental cards and charts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDevicePrefChange('temperatureUnit', 'C')}
              className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
                settings.devicePreferences.temperatureUnit === 'C'
                  ? 'bg-[#0A6847] text-white border-[#0A6847] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              type="button"
              onClick={() => handleDevicePrefChange('temperatureUnit', 'F')}
              className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
                settings.devicePreferences.temperatureUnit === 'F'
                  ? 'bg-[#0A6847] text-white border-[#0A6847] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

