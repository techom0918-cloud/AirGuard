import { UserSettings } from '../types';
import { defaultUserSettings } from '../data/mockUser';

const SETTINGS_STORAGE_KEY = 'airguard_user_settings';

class SettingsService {
  private settings: UserSettings;

  constructor() {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        this.settings = JSON.parse(saved);
      } catch {
        this.settings = defaultUserSettings;
      }
    } else {
      this.settings = defaultUserSettings;
    }
  }

  public async getSettings(): Promise<UserSettings> {
    await new Promise((r) => setTimeout(r, 150));
    return { ...this.settings };
  }

  public async updateSettings(newSettings: Partial<UserSettings>): Promise<UserSettings> {
    await new Promise((r) => setTimeout(r, 200));
    this.settings = {
      ...this.settings,
      ...newSettings,
      notifications: {
        ...this.settings.notifications,
        ...(newSettings.notifications || {}),
      },
      devicePreferences: {
        ...this.settings.devicePreferences,
        ...(newSettings.devicePreferences || {}),
      },
      dataSharing: {
        ...this.settings.dataSharing,
        ...(newSettings.dataSharing || {}),
      },
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    return { ...this.settings };
  }
}

export const settingsService = new SettingsService();
