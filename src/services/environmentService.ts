import { EnvironmentSnapshot, RiskLevel, TrendDataPoint } from '../types';
import { backendTelemetryService } from './backendTelemetryService';
import { fetchLiveTelemetry, telemetryToSnapshot, telemetryToTrendData, LiveTelemetryData } from './meteoService';

/**
 * Environment Service — Now backed by real-time backend telemetry.
 * Falls back to Open-Meteo API data if the backend is unreachable.
 */

export const environmentService = {
  getDataSourceType(): 'simulation' | 'hardware' | 'open-meteo' {
    return backendTelemetryService.isConnected() ? 'hardware' : 'open-meteo';
  },

  getDataSourceLabel(): string {
    if (backendTelemetryService.isConnected()) {
      const raw = backendTelemetryService.getLatestRaw();
      return `Data: Live Sensor ${raw?.device_id || 'AG-001'} (ESP32)`;
    }
    return 'Data: Live Open-Meteo & Sharp Dust Sensor';
  },

  async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    // Try real backend data first
    const backendSnapshot = backendTelemetryService.getLatestSnapshot();
    if (backendSnapshot) {
      return backendSnapshot;
    }

    // Fallback to Open-Meteo if backend is down
    try {
      const raw = await fetchLiveTelemetry(28.4623, 77.4904, 'Current Vicinity');
      return telemetryToSnapshot(raw);
    } catch {
      // Final fallback — return a safe default snapshot
      return {
        timestamp: new Date().toISOString(),
        lastUpdated: 'Waiting for sensor connection...',
        riskLevel: 'low',
        riskScore: 0,
        riskExplanation: 'No data available. Waiting for backend sensor connection.',
        pm25: { value: 0, unit: 'µg/m³', status: 'optimal', trend: { direction: 'stable', delta: '—', isPositive: true } },
        voc: { value: 0, unit: 'ppb', status: 'optimal', trend: { direction: 'stable', delta: '—', isPositive: true } },
        temperature: { value: 0, unit: '°C', status: 'comfortable', trend: { direction: 'stable', delta: '—', isPositive: true } },
        humidity: { value: 0, unit: '%', status: 'ideal', trend: { direction: 'stable', delta: '—', isPositive: true } },
        pressure: { value: 1013, unit: 'hPa', status: 'normal' },
        pm10: { value: 0, unit: 'µg/m³', status: 'optimal' },
        predictiveTrend: {
          status: 'Conditions Stable',
          direction: 'stable',
          changeSummary: 'Awaiting sensor data...',
          explanation: 'Connect the ESP32 backend to see live environmental data.',
          recentParticulateValues: [0, 0, 0, 0, 0],
          timeframe: 'N/A',
        },
      };
    }
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
    // Subscribe to real-time backend updates
    return backendTelemetryService.subscribeToSnapshot(callback);
  },

  // These are no-ops now — no more simulated/mock risk controls
  setSimulatedRisk(_level: RiskLevel): void {
    // No-op — real data only
  },

  updateCustomSnapshot(_partial: Partial<EnvironmentSnapshot>): void {
    // No-op — real data only
  },

  async getHistoricalTrend(_timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
    // Return real trend history from backend polling
    const history = backendTelemetryService.getTrendHistory();
    if (history.length > 0) {
      return history;
    }

    // Fallback to Open-Meteo trend data
    try {
      const raw = await fetchLiveTelemetry(28.4623, 77.4904, 'Current Vicinity');
      return telemetryToTrendData(raw);
    } catch {
      return [];
    }
  },
};
