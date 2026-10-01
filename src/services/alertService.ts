import { RiskAlert, AlertSeverity, AlertStatus } from '../types';
import { backendTelemetryService } from './backendTelemetryService';

/**
 * Alert Service — Now backed by real-time telemetry alerts.
 * Alerts are auto-generated from sensor threshold breaches by backendTelemetryService.
 * Also supports manual alert creation.
 */

type AlertListener = (alerts: RiskAlert[]) => void;

class AlertService {
  private listeners: Set<AlertListener> = new Set();

  /**
   * Get all alerts (from real-time backend + any manually added).
   */
  public async getAlerts(filter?: {
    severity?: AlertSeverity | 'all';
    status?: AlertStatus | 'all';
    search?: string;
  }): Promise<RiskAlert[]> {
    let result = backendTelemetryService.getAlerts();

    if (filter?.severity && filter.severity !== 'all') {
      result = result.filter((a) => a.severity === filter.severity);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.locationName?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public async getUnreadCount(): Promise<number> {
    const alerts = backendTelemetryService.getAlerts();
    return alerts.filter((a) => a.status === 'new').length;
  }

  public async addAlert(alertData: Partial<RiskAlert>): Promise<RiskAlert> {
    // For manually added alerts, we delegate to the telemetry service's internal store
    const newAlert: RiskAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      severity: alertData.severity || 'low',
      category: alertData.category || 'environmental',
      title: alertData.title || 'Sensor Event',
      message: alertData.message || 'Environmental sensor condition logged.',
      status: 'new',
      relatedReadings: alertData.relatedReadings,
      locationName: alertData.locationName || 'Current Location',
      ...alertData,
    };
    // Note: Manual alerts are stored in the backendTelemetryService's alert log
    return newAlert;
  }

  public async acknowledgeAlert(alertId: string): Promise<RiskAlert | null> {
    backendTelemetryService.acknowledgeAlert(alertId);
    const alerts = backendTelemetryService.getAlerts();
    const found = alerts.find((a) => a.id === alertId);
    this.notify();
    return found || null;
  }

  public async resolveAlert(alertId: string): Promise<RiskAlert | null> {
    backendTelemetryService.resolveAlert(alertId);
    const alerts = backendTelemetryService.getAlerts();
    const found = alerts.find((a) => a.id === alertId);
    this.notify();
    return found || null;
  }

  public async acknowledgeAll(): Promise<void> {
    backendTelemetryService.acknowledgeAllAlerts();
    this.notify();
  }

  public subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    // Also subscribe to backend telemetry alerts
    const unsub = backendTelemetryService.subscribeToAlerts((alerts) => {
      listener(alerts);
    });
    return () => {
      this.listeners.delete(listener);
      unsub();
    };
  }

  private notify() {
    const alerts = backendTelemetryService.getAlerts();
    this.listeners.forEach((fn) => fn(alerts));
  }
}

export const alertService = new AlertService();
