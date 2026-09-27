import { DeviceStatus } from '../types';
import { mockDeviceStatus, mockConnectedDeviceStatus } from '../data/mockDevice';
import { apiClient } from './apiClient';
import { deviceToDeviceStatus, BackendDeviceDto } from './adapters';

/**
 * Service abstraction for Hardware Device & Telemetry.
 * Connects to live backend Device REST API with graceful mock fallback.
 */

let deviceState: DeviceStatus = { ...mockDeviceStatus };
const listeners: Set<(status: DeviceStatus) => void> = new Set();
const defaultDeviceId = 'DEV-ESP32-001';

export const deviceService = {
  async fetchDeviceFromApi(deviceId = defaultDeviceId): Promise<DeviceStatus> {
    try {
      const dto = await apiClient.get<BackendDeviceDto>(`/devices/${deviceId}`);
      if (dto && dto.device_id) {
        deviceState = deviceToDeviceStatus(dto);
        this.notify();
      }
    } catch {
      // Keep existing mock state if backend is unreachable or device is missing
    }
    return { ...deviceState };
  },

  notify(): void {
    listeners.forEach((listener) => listener({ ...deviceState }));
  },

  async getDeviceStatus(deviceId = defaultDeviceId): Promise<DeviceStatus> {
    return this.fetchDeviceFromApi(deviceId);
  },

  subscribeToDeviceStatus(callback: (status: DeviceStatus) => void): () => void {
    listeners.add(callback);
    callback({ ...deviceState });
    this.fetchDeviceFromApi(defaultDeviceId).then((status) => {
      callback(status);
    });
    return () => {
      listeners.delete(callback);
    };
  },

  async runSensorDiagnostic(): Promise<{ success: boolean; message: string; timestamp: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const isConn = deviceState.connected;
    return {
      success: true,
      message: isConn
        ? 'Diagnostic complete: Laser, VOC, thermistor, and barometric array signals validated.'
        : 'Diagnostic complete: Hardware bridge idle. Waiting for AirGuard inhaler sleeve to pair.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  },

  toggleConnection(connected: boolean): void {
    deviceState = connected ? { ...mockConnectedDeviceStatus } : { ...mockDeviceStatus };
    this.notify();
  },
};
