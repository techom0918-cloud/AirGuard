import { DeviceStatus } from '../types';
import { mockDeviceStatus, mockConnectedDeviceStatus } from '../data/mockDevice';

/**
 * Service abstraction for Hardware Device & Telemetry.
 * Tracks truthful device connection states and supports developer simulation toggling.
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
    await new Promise((resolve) => setTimeout(resolve, 600));
    const isConn = deviceState.connected;
    return {
      success: true,
      message: isConn
        ? 'Diagnostic complete: Simulated optical laser, VOC, and barometric arrays active.'
        : 'Diagnostic complete: Hardware bridge idle. Waiting for AirGuard inhaler sleeve to pair via Bluetooth.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  },

  toggleConnection(connected: boolean): void {
    deviceState = connected ? { ...mockConnectedDeviceStatus } : { ...mockDeviceStatus };
    listeners.forEach((listener) => listener({ ...deviceState }));
  },
};
