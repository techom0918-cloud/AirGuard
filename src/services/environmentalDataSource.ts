import { EnvironmentSnapshot, RiskLevel, TrendDataPoint } from '../types';
import { initialEnvironmentSnapshot, moderateRiskSnapshot, highRiskSnapshot } from '../data/mockDashboard';
import { mock24HourTrend } from '../data/mockAnalytics';
import { apiClient } from './apiClient';
import { readingToSnapshot, readingToTrendPoint, BackendReadingDto } from './adapters';

export type DataSourceType = 'simulation' | 'hardware';

const DEFAULT_DEVICE_ID = 'AG-001';

/**
 * Common abstraction for environmental telemetry providers.
 * Allows switching between development mock/simulation telemetry and live Firebase backend API
 * with zero modifications to consumer components.
 */
export interface EnvironmentalDataSource {
  readonly type: DataSourceType;
  readonly isHardwareConnected: boolean;
  getLatestSnapshot(): Promise<EnvironmentSnapshot>;
  subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void;
  getHistoricalTrend(timeframe?: '1H' | '6H' | '24H'): Promise<TrendDataPoint[]>;
  setSimulatedRisk?(level: RiskLevel): void;
}

/**
 * Development & testing provider backed by structured mock environmental models.
 */
export class MockSimulatorDataSource implements EnvironmentalDataSource {
  public readonly type: DataSourceType = 'simulation';
  public readonly isHardwareConnected: boolean = false;

  private currentSnapshot: EnvironmentSnapshot = { ...initialEnvironmentSnapshot };
  private listeners: Set<(snapshot: EnvironmentSnapshot) => void> = new Set();

  public async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { ...this.currentSnapshot };
  }

  public subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void {
    this.listeners.add(callback);
    callback({ ...this.currentSnapshot });
    return () => {
      this.listeners.delete(callback);
    };
  }

  public setSimulatedRisk(level: RiskLevel): void {
    if (level === 'low') {
      this.currentSnapshot = { ...initialEnvironmentSnapshot, lastUpdated: 'Just now' };
    } else if (level === 'moderate') {
      this.currentSnapshot = { ...moderateRiskSnapshot, lastUpdated: 'Just now' };
    } else {
      this.currentSnapshot = { ...highRiskSnapshot, lastUpdated: 'Just now' };
    }

    this.listeners.forEach((listener) => listener({ ...this.currentSnapshot }));
  }

  public async getHistoricalTrend(timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    if (timeframe === '1H') {
      return [
        { time: '10:00', fullTime: '10:00 AM', pm25: 28, voc: 130, temperature: 26, humidity: 62, riskLevel: 'low' },
        { time: '10:15', fullTime: '10:15 AM', pm25: 31, voc: 135, temperature: 26.5, humidity: 61.5, riskLevel: 'low' },
        { time: '10:30', fullTime: '10:30 AM', pm25: 35, voc: 140, temperature: 27, humidity: 61, riskLevel: 'low' },
        { time: '10:45', fullTime: '10:45 AM', pm25: 39, voc: 145, temperature: 27.2, humidity: 60.5, riskLevel: 'moderate' },
        { time: '11:00', fullTime: '11:00 AM', pm25: 44, voc: 152, temperature: 27.5, humidity: 60, riskLevel: 'moderate' },
      ];
    }
    if (timeframe === '6H') {
      return mock24HourTrend.slice(6, 12);
    }
    return [...mock24HourTrend];
  }
}

/**
 * Live backend REST API data source querying Firestore readings.
 */
export class ApiEnvironmentalDataSource implements EnvironmentalDataSource {
  public readonly type: DataSourceType = 'hardware';
  public readonly isHardwareConnected: boolean = true;

  private mockFallback: MockSimulatorDataSource = new MockSimulatorDataSource();
  private deviceId: string;

  constructor(deviceId = DEFAULT_DEVICE_ID) {
    this.deviceId = deviceId;
  }

  public async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    try {
      // Primary attempt: GET /readings/:deviceId/latest
      let reading: BackendReadingDto | null = null;
      try {
        reading = await apiClient.get<BackendReadingDto>(`/readings/${this.deviceId}/latest`);
      } catch {
        // Fallback attempt: GET /history/:deviceId?limit=1
        const history = await apiClient.get<BackendReadingDto[]>(`/history/${this.deviceId}?limit=1`);
        if (Array.isArray(history) && history.length > 0) {
          reading = history[0];
        }
      }

      if (!reading || !reading.device_id) {
        return this.mockFallback.getLatestSnapshot();
      }
      return readingToSnapshot(reading);
    } catch {
      // Graceful fallback to mock data if API server is unreachable or device has no readings
      return this.mockFallback.getLatestSnapshot();
    }
  }

  public subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void {
    let isMounted = true;

    // Initial fetch
    this.getLatestSnapshot().then((snap) => {
      if (isMounted) callback(snap);
    });

    // Polling every 10 seconds for live environmental updates
    const intervalId = setInterval(() => {
      this.getLatestSnapshot().then((snap) => {
        if (isMounted) callback(snap);
      });
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }

  public async getHistoricalTrend(timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
    try {
      const limit = timeframe === '1H' ? 5 : timeframe === '6H' ? 12 : 50;
      let readings: BackendReadingDto[] = [];
      try {
        readings = await apiClient.get<BackendReadingDto[]>(`/history/${this.deviceId}?limit=${limit}`);
      } catch {
        readings = await apiClient.get<BackendReadingDto[]>(`/readings/${this.deviceId}?limit=${limit}`);
      }

      if (!Array.isArray(readings) || readings.length === 0) {
        return this.mockFallback.getHistoricalTrend(timeframe);
      }
      return readings.map(readingToTrendPoint).reverse();
    } catch {
      return this.mockFallback.getHistoricalTrend(timeframe);
    }
  }

  public setSimulatedRisk(level: RiskLevel): void {
    this.mockFallback.setSimulatedRisk(level);
  }
}

export const defaultEnvironmentalDataSource = new ApiEnvironmentalDataSource(DEFAULT_DEVICE_ID);
