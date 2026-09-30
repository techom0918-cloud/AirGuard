import { EnvironmentSnapshot, RiskLevel, TrendDataPoint } from '../types';
import { initialEnvironmentSnapshot, moderateRiskSnapshot, highRiskSnapshot } from '../data/mockDashboard';
import { mock24HourTrend } from '../data/mockAnalytics';

export type DataSourceType = 'simulation' | 'hardware';

export interface EnvironmentalDataSource {
  readonly type: DataSourceType;
  readonly isHardwareConnected: boolean;
  getLatestSnapshot(): Promise<EnvironmentSnapshot>;
  subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void;
  getHistoricalTrend(timeframe?: '1H' | '6H' | '24H'): Promise<TrendDataPoint[]>;
  setSimulatedRisk?(level: RiskLevel): void;
  updateCustomSnapshot?(partial: Partial<EnvironmentSnapshot>): void;
}

export class MockSimulatorDataSource implements EnvironmentalDataSource {
  public readonly type: DataSourceType = 'simulation';
  public readonly isHardwareConnected: boolean = false;

  private currentSnapshot: EnvironmentSnapshot = { ...initialEnvironmentSnapshot };
  private listeners: Set<(snapshot: EnvironmentSnapshot) => void> = new Set();

  public async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    await new Promise((resolve) => setTimeout(resolve, 50));
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

  public updateCustomSnapshot(partial: Partial<EnvironmentSnapshot>): void {
    this.currentSnapshot = {
      ...this.currentSnapshot,
      ...partial,
      lastUpdated: 'Just now',
    };
    this.listeners.forEach((listener) => listener({ ...this.currentSnapshot }));
  }

  public async getHistoricalTrend(timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
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

export const defaultEnvironmentalDataSource = new MockSimulatorDataSource();
