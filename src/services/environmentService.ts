import { EnvironmentSnapshot, RiskLevel, TrendDataPoint } from '../types';
import { EnvironmentalDataSource, MockSimulatorDataSource } from './environmentalDataSource';
import { fetchLiveTelemetry, telemetryToSnapshot, telemetryToTrendData, LiveTelemetryData } from './meteoService';

const activeDataSource: EnvironmentalDataSource = new MockSimulatorDataSource();

export const environmentService = {
  getDataSourceType(): 'simulation' | 'hardware' | 'open-meteo' {
    return 'open-meteo';
  },

  getDataSourceLabel(): string {
    return 'Data: Live Open-Meteo & Sharp Dust Sensor';
  },

  async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    return activeDataSource.getLatestSnapshot();
  },

  async fetchLiveOpenMeteo(lat: number = 28.4623, lng: number = 77.4904, locationName: string = 'Current Vicinity'): Promise<{
    snapshot: EnvironmentSnapshot;
    trendData: TrendDataPoint[];
    rawTelemetry: LiveTelemetryData;
  }> {
    const raw = await fetchLiveTelemetry(lat, lng, locationName);
    const snapshot = telemetryToSnapshot(raw);
    const trendData = telemetryToTrendData(raw);
    return { snapshot, trendData, rawTelemetry: raw };
  },

  subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void {
    return activeDataSource.subscribeToSnapshot(callback);
  },

  setSimulatedRisk(level: RiskLevel): void {
    activeDataSource.setSimulatedRisk?.(level);
  },

  updateCustomSnapshot(partial: Partial<EnvironmentSnapshot>): void {
    activeDataSource.updateCustomSnapshot?.(partial);
  },

  async getHistoricalTrend(timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
    return activeDataSource.getHistoricalTrend(timeframe);
  },
};
