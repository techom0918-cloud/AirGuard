import { EnvironmentSnapshot, RiskLevel, TrendDataPoint } from '../types';
import { EnvironmentalDataSource, MockSimulatorDataSource } from './environmentalDataSource';

// Active environmental telemetry data source (currently using development simulation)
const activeDataSource: EnvironmentalDataSource = new MockSimulatorDataSource();

export const environmentService = {
  getDataSourceType(): 'simulation' | 'hardware' {
    return activeDataSource.type;
  },

  getDataSourceLabel(): string {
    return activeDataSource.type === 'simulation' ? 'Data: Simulation Mode' : 'Data: Live Hardware';
  },

  /**
   * Retrieves the current environmental snapshot.
   */
  async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    return activeDataSource.getLatestSnapshot();
  },

  /**
   * Subscribes to real-time telemetry changes.
   */
  subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void {
    return activeDataSource.subscribeToSnapshot(callback);
  },

  /**
   * Helper for development/testing to simulate different environmental conditions.
   */
  setSimulatedRisk(level: RiskLevel): void {
    activeDataSource.setSimulatedRisk?.(level);
  },

  /**
   * Retrieves historical trend data for charts.
   */
  async getHistoricalTrend(timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
    return activeDataSource.getHistoricalTrend(timeframe);
  },
};
