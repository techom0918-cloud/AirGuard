import { RiskAlert, AlertSeverity, AlertStatus } from '../types';
import { mockAlerts } from '../data/mockAlerts';

type AlertListener = (alerts: RiskAlert[]) => void;

class AlertService {
  private alerts: RiskAlert[] = [...mockAlerts];
  private listeners: Set<AlertListener> = new Set();

  public async getAlerts(filter?: {
    severity?: AlertSeverity | 'all';
    status?: AlertStatus | 'all';
    search?: string;
  }): Promise<RiskAlert[]> {
    await new Promise((r) => setTimeout(r, 200));

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
