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
  Radio,
  Eye,
  Volume2,
} from 'lucide-react';

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
      {/* Header */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']">Settings</h1>
          <p className="text-emerald-100 text-xs mt-1">Notifications, device cues & privacy preferences</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-full bg-white text-[#2A8E77] font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-60 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847]" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 1. Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-[#0A6847]" />
          <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
            Notification & Alert Rules
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                Early Predictive Particulate Warnings
              </span>
              <span className="text-slate-500 text-xs">
                Alert when PM2.5 or VOC exhibits sustained 15-minute rate-of-climb velocity
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.earlyEnvironmentalWarnings}
              onChange={() => handleToggleNotification('earlyEnvironmentalWarnings')}
              className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                High Environmental Risk Alerts
              </span>
              <span className="text-slate-500 text-xs">
                Immediate notification if acute absolute safety boundaries are exceeded
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.highRiskAlerts}
              onChange={() => handleToggleNotification('highRiskAlerts')}
              className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                Daily Airway Exposure Digest
              </span>
              <span className="text-slate-500 text-xs">
                Evening summary of cumulative hours spent in optimal vs trigger-elevated microclimates
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.dailySummary}
              onChange={() => handleToggleNotification('dailySummary')}
              className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                Hardware Disconnection Notice
              </span>
              <span className="text-slate-500 text-xs">
                Alert immediately if Bluetooth pairing with the ESP32 sensor pod drops for &gt; 90 seconds
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.deviceDisconnectedAlert}
              onChange={() => handleToggleNotification('deviceDisconnectedAlert')}
              className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
            />
          </div>
        </div>
      </div>

      {/* 2. ESP32 Hardware Pod Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-4 h-4 text-[#0A6847]" />
          <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
            ESP32 Hardware Pod Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* LED Ring Brightness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Device LED Brightness</span>
              </span>
              <span className="font-mono text-xs text-slate-500">
                {settings.devicePreferences.ledBrightness}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={settings.devicePreferences.ledBrightness}
              onChange={(e) =>
                handleDevicePrefChange('ledBrightness', parseInt(e.target.value))
              }
              className="w-full accent-[#0A6847]"
            />
            <span className="text-[11px] text-slate-400 block">
              Adjusts brightness of the circular ring indicator on the physical sensor unit.
            </span>
          </div>

          {/* Buzzer Sound */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Audible Buzzer Cues</span>
              </span>
              <input
                type="checkbox"
                checked={settings.devicePreferences.buzzerEnabled}
                onChange={(e) =>
                  handleDevicePrefChange('buzzerEnabled', e.target.checked)
                }
                className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Gentle soft-tone acoustic alert when particulate risk begins escalating steeply.
            </span>
          </div>

          {/* Sampling Frequency */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">
              Sensor Sampling Frequency
            </label>
            <select
              value={settings.devicePreferences.samplingFrequencySeconds}
              onChange={(e) =>
                handleDevicePrefChange('samplingFrequencySeconds', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="1">1 second (High precision, ~24h battery)</option>
              <option value="5">5 seconds (Standard balance, ~48h battery)</option>
              <option value="15">15 seconds (Power saver, ~72h battery)</option>
            </select>
          </div>

          {/* Temperature Unit */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">
              Temperature Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDevicePrefChange('temperatureUnit', 'C')}
                className={`px-4 py-1.5 rounded-lg font-semibold text-xs border ${
                  settings.devicePreferences.temperatureUnit === 'C'
                    ? 'bg-[#0A6847] text-white border-[#0A6847]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => handleDevicePrefChange('temperatureUnit', 'F')}
                className={`px-4 py-1.5 rounded-lg font-semibold text-xs border ${
                  settings.devicePreferences.temperatureUnit === 'F'
                    ? 'bg-[#0A6847] text-white border-[#0A6847]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Privacy & Research Data Sharing */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-[#0A6847]" />
          <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
            Privacy & Clinical Data Governance
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                Anonymized Academic Research Contribution
              </span>
              <span className="text-slate-500 text-xs">
                Contribute stripped, non-identifiable particulate telemetry to university environmental health studies
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.dataSharing.anonymousResearchSharing}
              onChange={() => handleDataSharingToggle('anonymousResearchSharing')}
              className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                Clinical Report Generation
              </span>
              <span className="text-slate-500 text-xs">
                Allow secure physician summary exports and temporary access codes
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.dataSharing.physicianReportGeneration}
              onChange={() => handleDataSharingToggle('physicianReportGeneration')}
              className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
