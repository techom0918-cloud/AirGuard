import { deviceService, readingService, alertService } from '../services/index.js';
import { DeviceDocument, ReadingDocument, AlertDocument } from '../types/schema.js';
import { getFirestore } from '../config/firebase.js';

export const SEED_DEVICES: DeviceDocument[] = [
  {
    device_id: 'DEV-ESP32-001',
    owner: 'dev-owner-1@airguard.local',
    registered_at: '2026-09-01T10:00:00.000Z',
  },
  {
    device_id: 'DEV-ESP32-002',
    owner: 'dev-owner-2@airguard.local',
    registered_at: '2026-09-01T11:00:00.000Z',
  },
];

export const SEED_READINGS: Array<{ data: ReadingDocument; docId: string }> = [
  // Device 1 Telemetry (New Delhi Center area)
  {
    docId: 'seed-rdg-001',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 18.2,
      temp: 24.5,
      humidity: 48,
      risk_level: 'SAFE',
      lat: 28.6139,
      lng: 77.209,
      timestamp: '2026-09-27T08:00:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-002',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 22.4,
      temp: 25.1,
      humidity: 50,
      risk_level: 'SAFE',
      lat: 28.615,
      lng: 77.21,
      timestamp: '2026-09-27T09:00:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-003',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 42.0,
      temp: 27.8,
      humidity: 55,
      risk_level: 'WARNING',
      lat: 28.618,
      lng: 77.213,
      timestamp: '2026-09-27T10:00:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-004',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 88.5,
      temp: 31.2,
      humidity: 62,
      risk_level: 'DANGER',
      lat: 28.622,
      lng: 77.218,
      timestamp: '2026-09-27T11:00:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-005',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 95.0,
      temp: 32.0,
      humidity: 65,
      risk_level: 'DANGER',
      lat: 28.625,
      lng: 77.221,
      timestamp: '2026-09-27T12:00:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-006',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 51.3,
      temp: 29.4,
      humidity: 58,
      risk_level: 'WARNING',
      lat: 28.62,
      lng: 77.215,
      timestamp: '2026-09-27T13:00:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-007',
    data: {
      device_id: 'DEV-ESP32-001',
      pm25: 25.0,
      temp: 26.0,
      humidity: 51,
      risk_level: 'SAFE',
      lat: 28.614,
      lng: 77.2095,
      timestamp: '2026-09-27T14:00:00.000Z',
    },
  },

  // Device 2 Telemetry (Noida Sector area)
  {
    docId: 'seed-rdg-008',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 15.0,
      temp: 23.0,
      humidity: 44,
      risk_level: 'SAFE',
      lat: 28.5355,
      lng: 77.391,
      timestamp: '2026-09-27T08:30:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-009',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 38.6,
      temp: 26.4,
      humidity: 52,
      risk_level: 'WARNING',
      lat: 28.538,
      lng: 77.394,
      timestamp: '2026-09-27T09:30:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-010',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 48.0,
      temp: 28.5,
      humidity: 56,
      risk_level: 'WARNING',
      lat: 28.541,
      lng: 77.397,
      timestamp: '2026-09-27T10:30:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-011',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 110.2,
      temp: 33.5,
      humidity: 70,
      risk_level: 'DANGER',
      lat: 28.545,
      lng: 77.401,
      timestamp: '2026-09-27T11:30:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-012',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 78.4,
      temp: 30.1,
      humidity: 64,
      risk_level: 'DANGER',
      lat: 28.542,
      lng: 77.398,
      timestamp: '2026-09-27T12:30:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-013',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 35.0,
      temp: 27.2,
      humidity: 50,
      risk_level: 'WARNING',
      lat: 28.537,
      lng: 77.392,
      timestamp: '2026-09-27T13:30:00.000Z',
    },
  },
  {
    docId: 'seed-rdg-014',
    data: {
      device_id: 'DEV-ESP32-002',
      pm25: 19.5,
      temp: 24.8,
      humidity: 46,
      risk_level: 'SAFE',
      lat: 28.5358,
      lng: 77.3912,
      timestamp: '2026-09-27T14:30:00.000Z',
    },
  },
];

export const SEED_ALERTS: Array<{ data: AlertDocument; docId: string }> = [
  {
    docId: 'seed-alt-001',
    data: {
      device_id: 'DEV-ESP32-001',
      risk_level: 'WARNING',
      lat: 28.618,
      lng: 77.213,
      timestamp: '2026-09-27T10:05:00.000Z',
      resolved: true,
    },
  },
  {
    docId: 'seed-alt-002',
    data: {
      device_id: 'DEV-ESP32-001',
      risk_level: 'DANGER',
      lat: 28.622,
      lng: 77.218,
      timestamp: '2026-09-27T11:05:00.000Z',
      resolved: false,
    },
  },
  {
    docId: 'seed-alt-003',
    data: {
      device_id: 'DEV-ESP32-001',
      risk_level: 'DANGER',
      lat: 28.625,
      lng: 77.221,
      timestamp: '2026-09-27T12:05:00.000Z',
      resolved: false,
    },
  },
  {
    docId: 'seed-alt-004',
    data: {
      device_id: 'DEV-ESP32-002',
      risk_level: 'WARNING',
      lat: 28.541,
      lng: 77.397,
      timestamp: '2026-09-27T10:35:00.000Z',
      resolved: true,
    },
  },
  {
    docId: 'seed-alt-005',
    data: {
      device_id: 'DEV-ESP32-002',
      risk_level: 'DANGER',
      lat: 28.545,
      lng: 77.401,
      timestamp: '2026-09-27T11:35:00.000Z',
      resolved: false,
    },
  },
];

export async function runSeed(): Promise<boolean> {
  console.log('Seed started...');

  const db = getFirestore();
  if (!db) {
    console.log('[Seed] Live Firebase credentials unavailable (environment uses placeholder values).');
    console.log('[Seed] Skipping live Firestore database seed write.');
    return false;
  }

  try {
    let devicesWritten = 0;
    for (const dev of SEED_DEVICES) {
      await deviceService.registerDevice(dev);
      devicesWritten++;
    }

    let readingsWritten = 0;
    for (const rdg of SEED_READINGS) {
      await readingService.saveReading(rdg.data, rdg.docId);
      readingsWritten++;
    }

    let alertsWritten = 0;
    for (const alt of SEED_ALERTS) {
      await alertService.saveAlert(alt.data, alt.docId);
      alertsWritten++;
    }

    console.log(`Devices written: ${devicesWritten}`);
    console.log(`Readings written: ${readingsWritten}`);
    console.log(`Alerts written: ${alertsWritten}`);
    console.log('Seed completed successfully.');
    return true;
  } catch (error) {
    console.error('Seed encountered an error during Firestore execution:', error);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedFirestore.ts')) {
  runSeed().then((success) => {
    if (!success) {
      console.log('Seed completed with skip status (no live credentials).');
    }
  });
}
