import { DeviceStatus } from '../types';
import { mockDeviceStatus } from '../data/mockDevice';

/**
 * Service abstraction for Hardware Device & ESP32 Telemetry.
 * Will map to Firebase Realtime Database node `/devices/{deviceId}` in production.
 */

let deviceState: DeviceStatus = { ...mockDeviceStatus };
const listeners: Set<(status: DeviceStatus) => void> = new Set();

export const deviceService = {
  async getDeviceStatus(): Promise<DeviceStatus> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return { ...deviceState };
  },

  subscribeToDeviceStatus(callback: (status: DeviceStatus) => void): () => void {
    listeners.add(callback);
    callback({ ...deviceState });
    return () => {
      listeners.delete(callback);
    };
  },

  async runSensorDiagnostic(): Promise<{ success: boolean; message: string; timestamp: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    deviceState = {
      ...deviceState,
      lastSyncSecondsAgo: 0,
      activeSensorsCount: 4,
      totalSensorsCount: 4,
    };
    listeners.forEach((listener) => listener({ ...deviceState }));
    return {
      success: true,
      message: 'Self-test passed: Optical laser, metal-oxide VOC, SHT31, and barometric sensor arrays verified in normal operating spec.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  },

  toggleConnection(connected: boolean): void {
    deviceState = {
      ...deviceState,
      connected,
      esp32Connected: connected,
      bleState: connected ? 'connected' : 'disconnected',
    };
    listeners.forEach((listener) => listener({ ...deviceState }));
  }
};
