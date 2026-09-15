import { EnvironmentSnapshot, RiskLevel, TrendDataPoint } from '../types';
import { initialEnvironmentSnapshot, moderateRiskSnapshot, highRiskSnapshot } from '../data/mockDashboard';
import { mock24HourTrend } from '../data/mockAnalytics';

/**
 * Service abstraction for Environmental Telemetry.
 * Designed to connect to Firebase Realtime Database or Firestore in production.
 * Current implementation provides stateful mock data with simulated ESP32 updates.
 */

let currentSnapshot: EnvironmentSnapshot = { ...initialEnvironmentSnapshot };
const listeners: Set<(snapshot: EnvironmentSnapshot) => void> = new Set();

export const environmentService = {
  /**
   * Retrieves the current environmental snapshot.
   */
  async getLatestSnapshot(): Promise<EnvironmentSnapshot> {
    // Simulate brief network latency for realistic UX state transitions
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { ...currentSnapshot };
  },

  /**
   * Subscribes to real-time telemetry changes (ESP32 -> Firebase -> frontend).
   */
  subscribeToSnapshot(callback: (snapshot: EnvironmentSnapshot) => void): () => void {
    listeners.add(callback);
    callback({ ...currentSnapshot });

    // Return cleanup unsubscribe method
    return () => {
      listeners.delete(callback);
    };
  },

  /**
   * Helper for hackathon demonstrations to simulate different environmental conditions.
   */
  setSimulatedRisk(level: RiskLevel): void {
    if (level === 'low') {
      currentSnapshot = { ...initialEnvironmentSnapshot, lastUpdated: 'Just now' };
    } else if (level === 'moderate') {
      currentSnapshot = { ...moderateRiskSnapshot, lastUpdated: 'Just now' };
    } else {
      currentSnapshot = { ...highRiskSnapshot, lastUpdated: 'Just now' };
    }
    
    // Notify all active listeners
    listeners.forEach((listener) => listener({ ...currentSnapshot }));
  },

  /**
   * Retrieves historical trend data for charts.
   */
  async getHistoricalTrend(timeframe: '1H' | '6H' | '24H' = '24H'): Promise<TrendDataPoint[]> {
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
  },
};
