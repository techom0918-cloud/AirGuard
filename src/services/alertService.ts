import { RiskAlert, AlertSeverity, AlertStatus } from '../types';
import { mockAlerts } from '../data/mockAlerts';
import { apiClient } from './apiClient';
import { alertToRiskAlert, BackendAlertDto } from './adapters';

type AlertListener = (alerts: RiskAlert[]) => void;

class AlertService {
  private alerts: RiskAlert[] = [...mockAlerts];
  private listeners: Set<AlertListener> = new Set();
  private deviceId: string = 'DEV-ESP32-001';

  /**
   * Fetches real risk alerts from backend REST API and updates internal store.
   */
  public async fetchAlertsFromApi(): Promise<RiskAlert[]> {
    try {
      const dtos = await apiClient.get<BackendAlertDto[]>(`/alerts/${this.deviceId}?limit=20`);
      if (Array.isArray(dtos) && dtos.length > 0) {
        this.alerts = dtos.map(alertToRiskAlert);
        this.notify();
      }
    } catch {
      // Graceful fallback to mockAlerts if backend API server is unreachable
    }
    return this.alerts;
  }

  public async getAlerts(filter?: {
    severity?: AlertSeverity | 'all';
    status?: AlertStatus | 'all';
    search?: string;
  }): Promise<RiskAlert[]> {
    await this.fetchAlertsFromApi();

    let result = [...this.alerts];

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
    await this.fetchAlertsFromApi();
    return this.alerts.filter((a) => a.status === 'new').length;
  }

  public async addAlert(alertData: Partial<RiskAlert>): Promise<RiskAlert> {
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

    try {
      const riskLevel =
        alertData.severity === 'high' || alertData.severity === 'critical'
          ? 'high'
          : alertData.severity === 'moderate'
          ? 'moderate'
          : 'low';

      await apiClient.post<BackendAlertDto>('/alerts', {
        device_id: this.deviceId,
        risk_level: riskLevel,
        lat: 28.6139,
        lng: 77.209,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    } catch {
      // Local fallback if API post fails
    }

    this.alerts.unshift(newAlert);
    this.notify();
    return newAlert;
  }

  public async acknowledgeAlert(alertId: string): Promise<RiskAlert | null> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      this.notify();
      return { ...alert };
    }
    return null;
  }

  public async resolveAlert(alertId: string): Promise<RiskAlert | null> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      this.notify();
      return { ...alert };
    }
    return null;
  }

  public async acknowledgeAll(): Promise<void> {
    this.alerts = this.alerts.map((a) =>
      a.status === 'new' ? { ...a, status: 'acknowledged' } : a
    );
    this.notify();
  }

  public subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    listener(this.alerts);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn([...this.alerts]));
  }
}

export const alertService = new AlertService();
