import { WeeklyInsight } from '../types';
import { backendTelemetryService } from './backendTelemetryService';

/**
 * Service for AI Environmental Insights.
 * Now generates insights from real-time sensor telemetry data.
 */

function generateLiveInsights(): WeeklyInsight[] {
  const trends = backendTelemetryService.getTrendHistory();
  const alerts = backendTelemetryService.getAlerts();
  const events = backendTelemetryService.getEvents();
  const raw = backendTelemetryService.getLatestRaw();
  const isConnected = backendTelemetryService.isConnected();

  if (!isConnected || trends.length === 0) {
    return [
      {
        id: 'insight-live-1',
        section: 'Weekly Summary',
        headline: 'Awaiting Sensor Data',
        detail: 'Connect the ESP32 backend sensor to start collecting environmental telemetry. Insights will be generated automatically once data begins flowing.',
        severity: 'info',
        highlightStat: 'No data yet',
        observedDateRange: 'N/A',
      },
    ];
  }

  // Calculate averages from trend history
  const avgPM25 = Math.round(trends.reduce((s, t) => s + t.pm25, 0) / trends.length);
  const avgVOC = Math.round(trends.reduce((s, t) => s + t.voc, 0) / trends.length);
  const maxPM25 = Math.max(...trends.map((t) => t.pm25));
  const minPM25 = Math.min(...trends.map((t) => t.pm25));
  const avgTemp = trends[0]?.temperature || 25;
  const avgHumidity = trends[0]?.humidity || 50;

  const highRiskCount = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;
  const totalAlerts = alerts.length;
  const spikeEvents = events.filter((e) => e.eventType === 'spike').length;

  const now = new Date();
  const dateRange = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (Live Session)`;

  const insights: WeeklyInsight[] = [
    {
      id: 'insight-live-1',
      section: 'Weekly Summary',
      headline: `Average PM2.5: ${avgPM25} µg/m³ across ${trends.length} readings`,
      detail: `Your sensor ${raw?.device_id || 'AG-001'} has recorded ${trends.length} data points this session. PM2.5 ranged from ${minPM25} to ${maxPM25} µg/m³. Average VOC level: ${avgVOC} ppb.`,
      severity: avgPM25 > 55 ? 'warning' : avgPM25 > 25 ? 'caution' : 'info',
      highlightStat: `PM2.5 Range: ${minPM25}–${maxPM25} µg/m³`,
      observedDateRange: dateRange,
    },
    {
      id: 'insight-live-2',
      section: 'Environmental Pattern',
      headline: maxPM25 > 55
        ? 'High pollution spikes detected in session'
        : maxPM25 > 25
        ? 'Moderate particulate fluctuations observed'
        : 'Clean air conditions throughout session',
      detail: maxPM25 > 55
        ? `Your peak PM2.5 reading hit ${maxPM25} µg/m³ — exceeding the WHO recommended safe threshold. ${spikeEvents} spike events were recorded. Consider staying indoors during peak pollution hours.`
        : maxPM25 > 25
        ? `PM2.5 levels fluctuated around the moderate range (peak: ${maxPM25} µg/m³). Current MQ135 raw value: ${raw?.mq135_raw || '—'}. Sensitive individuals should monitor conditions.`
        : `Air quality has remained within healthy parameters. Your environment is safe for outdoor activities.`,
      severity: maxPM25 > 55 ? 'warning' : maxPM25 > 25 ? 'caution' : 'info',
      highlightStat: `Peak PM2.5: ${maxPM25} µg/m³`,
      observedDateRange: dateRange,
    },
    {
      id: 'insight-live-3',
      section: 'Risk Pattern',
      headline: highRiskCount > 0
        ? `${highRiskCount} critical alerts triggered this session`
        : totalAlerts > 0
        ? `${totalAlerts} environmental alerts logged`
        : 'No alerts triggered — conditions are stable',
      detail: highRiskCount > 0
        ? `${highRiskCount} critical/high severity alerts were triggered by sensor threshold breaches. Total alerts: ${totalAlerts}. Review the Alerts page for detailed event data and recommended actions.`
        : totalAlerts > 0
        ? `${totalAlerts} alerts were generated, all at moderate or advisory severity. Monitor trends for potential escalation.`
        : 'No environmental alerts were triggered during this monitoring session. Sensor readings remain within safe parameters.',
      severity: highRiskCount > 0 ? 'warning' : totalAlerts > 0 ? 'caution' : 'info',
      highlightStat: `Alerts: ${totalAlerts} total, ${highRiskCount} critical`,
      observedDateRange: dateRange,
    },
    {
      id: 'insight-live-4',
      section: 'Potential Pattern',
      headline: `Environmental conditions: ${avgTemp}°C, ${avgHumidity}% humidity`,
      detail: `Current sensor environment: Temperature ${avgTemp}°C, Humidity ${avgHumidity}%. ${
        avgHumidity > 70
          ? 'High humidity increases airway reactivity — consider using a dehumidifier or staying in air-conditioned spaces.'
          : avgHumidity < 30
          ? 'Low humidity can dry mucous membranes — consider using a humidifier.'
          : 'Humidity levels are within the comfortable range for respiratory health.'
      } ${
        avgTemp > 35
          ? 'Extreme heat detected — a known bronchospasm trigger.'
          : avgTemp < 10
          ? 'Cold air detected — a known bronchospasm trigger.'
          : 'Temperature is within comfortable range.'
      }`,
      severity: avgHumidity > 80 || avgTemp > 35 || avgTemp < 5 ? 'warning' : 'info',
      highlightStat: `MQ135 Raw: ${raw?.mq135_raw || '—'} | Score: ${raw?.air_quality_score || '—'}`,
      observedDateRange: dateRange,
    },
  ];

  return insights;
}

export const insightsService = {
  async getWeeklyInsights(): Promise<WeeklyInsight[]> {
    return generateLiveInsights();
  },

  async requestSynthesisRefresh(): Promise<{ message: string; refreshedAt: string }> {
    const trends = backendTelemetryService.getTrendHistory();
    const raw = backendTelemetryService.getLatestRaw();
    return {
      message: `Live telemetry synthesis refreshed. ${trends.length} data points from sensor ${raw?.device_id || 'AG-001'} analyzed.`,
      refreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
