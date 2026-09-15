import { User, UserSettings } from '../types';

export const mockCurrentUser: User = {
  id: 'usr_airguard_9824',
  name: 'Rishabh Shishodiya',
  email: 'rishabhshishodiya22@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  accountCreatedAt: 'January 14, 2026',
  deviceAssignedId: 'ESP32-AG-8849',
  emergencyContact: {
    name: 'Priya Shishodiya',
    relation: 'Spouse',
    phone: '+1 (415) 890-2134',
  },
};

export const defaultUserSettings: UserSettings = {
  notifications: {
    inAppAlerts: true,
    soundEnabled: true,
    highRiskAlerts: true,
    earlyEnvironmentalWarnings: true,
    dailySummary: true,
    deviceDisconnectionNotice: true,
    deviceDisconnectedAlert: true,
    weeklyDigestEmail: true,
  },
  devicePreferences: {
    syncFrequencySeconds: 15,
    ledIndicatorMode: 'subtle',
    ledBrightness: 60,
    buzzerEnabled: true,
    samplingFrequencySeconds: 1,
    temperatureUnit: 'C',
    vibrationFeedback: true,
    gpsTrackingEnabled: true,
  },
  dataSharing: {
    doctorSharingActive: true,
    shareCode: 'AG-CLINIC-7741',
    anonymousEnvironmentalResearch: true,
    anonymousResearchSharing: true,
    physicianReportGeneration: true,
  },
  appearance: {
    theme: 'light',
    compactMode: false,
  },
};
