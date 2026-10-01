/**
 * backendTelemetryService.ts
 * --------------------------
 * Central service that polls the ESP32 backend (localhost:5001) for real-time
 * sensor telemetry. Converts raw hardware data to internal app types and
 * broadcasts to all subscribers (Dashboard, Alerts, Events, Insights).
 *
 * Backend payload shape (from ESP32):
 * {
 *   "device_id": "AG-001",
 *   "temp": 26.30,
 *   "humidity": 59.00,
 *   "mq135_raw": 871,
 *   "sensor_voltage": 1.40,
 *   "air_quality_score": 63,
 *   "risk_level": "SAFE"
 * }
 */

import { EnvironmentSnapshot, RiskLevel, TrendDataPoint, RiskAlert, EnvironmentalEvent } from '../types';

// ── Configuration ──────────────────────────────────────────────────────────────
const BACKEND_BASE_URL =
  (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5001';

const POLL_INTERVAL_MS = 5_000;          // Poll every 5 seconds
const TREND_HISTORY_SIZE = 30;           // Keep last 30 readings for trend charts
const EVENT_LOG_MAX = 100;               // Max events to store in memory

// ── Raw telemetry shape from ESP32 ──────────────────────────────────────────
export interface RawTelemetry {
  device_id: string;
  temp: number;
  humidity: number;
  mq135_raw: number;
  sensor_voltage: number;
  air_quality_score: number;
  risk_level: string; // "SAFE" | "WARNING" | "DANGER"
}

const INITIAL_RAW: RawTelemetry = {
  device_id: 'AG-001',
  temp: 26.30,
  humidity: 59.00,
  mq135_raw: 871,
  sensor_voltage: 1.40,
  air_quality_score: 63,
  risk_level: 'SAFE',
};

// ── Internal state ──────────────────────────────────────────────────────────
let latestRaw: RawTelemetry | null = INITIAL_RAW;
let latestSnapshot: EnvironmentSnapshot | null = null; // populated right after rawToSnapshot definition
let trendHistory: TrendDataPoint[] = [];
let eventLog: EnvironmentalEvent[] = [];
let alertLog: RiskAlert[] = [];
let isConnected = false;
let lastError: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let readingCount = 0;

type SnapshotListener = (snapshot: EnvironmentSnapshot) => void;
type TelemetryListener = (raw: RawTelemetry) => void;
type ConnectionListener = (connected: boolean) => void;
type AlertListener = (alerts: RiskAlert[]) => void;
type EventListener = (events: EnvironmentalEvent[]) => void;

const snapshotListeners: Set<SnapshotListener> = new Set();
const telemetryListeners: Set<TelemetryListener> = new Set();
const connectionListeners: Set<ConnectionListener> = new Set();
const alertListeners: Set<AlertListener> = new Set();
const eventListeners: Set<EventListener> = new Set();

// ── Conversion utilities ────────────────────────────────────────────────────

/**
 * Convert MQ135 raw ADC value to estimated PM2.5 (µg/m³).
 * MQ135 doesn't directly measure PM2.5, so we use a calibrated proxy formula.
 * Higher raw values indicate worse air quality.
 */
function mq135ToPM25(mq135Raw: number, sensorVoltage: number): number {
  // Calibration curve: typical MQ135 range 100-1000 ADC
  // Clean air: ~200-400, moderate: ~400-700, bad: >700
  const ratio = sensorVoltage / 5.0; // normalize to 5V reference
  const pm25 = Math.max(5, Math.round(mq135Raw * ratio * 0.08 + 5));
  return Math.min(pm25, 500);
}

/**
 * Convert MQ135 raw to estimated VOC (ppb).
 */
function mq135ToVOC(mq135Raw: number): number {
  return Math.max(50, Math.round(mq135Raw * 0.35 + 30));
}

/**
 * Derive AQI from air_quality_score (0-500 scale from backend).
 */
function deriveAQI(airQualityScore: number, mq135Raw: number): number {
  // air_quality_score from backend is already a 0-100 or 0-500 index
  // If it's 0-100, scale to AQI; if already AQI-like, use directly
  if (airQualityScore <= 100) {
    // Backend gives 0-100 score where lower = better
    // Convert: 0-50 → good, 50-100 → moderate/bad
    return Math.round(airQualityScore * 2.5);
  }
  return Math.round(airQualityScore);
}

/**
 * Map backend risk_level string to internal RiskLevel type.
 */
function mapRiskLevel(backendRisk: string): RiskLevel {
  const r = backendRisk.toUpperCase();
  if (r === 'DANGER' || r === 'HIGH' || r === 'CRITICAL') return 'high';
  if (r === 'WARNING' || r === 'MODERATE' || r === 'CAUTION') return 'moderate';
  return 'low';
}

/**
 * Convert raw telemetry to EnvironmentSnapshot.
 */
function rawToSnapshot(raw: RawTelemetry): EnvironmentSnapshot {
  const pm25 = mq135ToPM25(raw.mq135_raw, raw.sensor_voltage);
  const voc = mq135ToVOC(raw.mq135_raw);
  const aqi = deriveAQI(raw.air_quality_score, raw.mq135_raw);
  const riskLevel = mapRiskLevel(raw.risk_level);

  // Determine PM2.5 trend from history
  let pm25Trend: 'rising' | 'stable' | 'falling' = 'stable';
  if (trendHistory.length >= 3) {
    const recent = trendHistory.slice(-3).map((t) => t.pm25);
    if (recent[2] > recent[0] + 3) pm25Trend = 'rising';
    else if (recent[2] < recent[0] - 3) pm25Trend = 'falling';
  }

  const pm25Status: 'optimal' | 'moderate' | 'elevated' =
    pm25 <= 25 ? 'optimal' : pm25 <= 55 ? 'moderate' : 'elevated';
  const vocStatus: 'optimal' | 'moderate' | 'elevated' =
    voc <= 200 ? 'optimal' : voc <= 450 ? 'moderate' : 'elevated';
  const tempStatus: 'comfortable' | 'warm' | 'cool' =
    raw.temp >= 18 && raw.temp <= 26 ? 'comfortable' : raw.temp > 26 ? 'warm' : 'cool';
  const humStatus: 'ideal' | 'elevated' | 'dry' =
    raw.humidity >= 40 && raw.humidity <= 60 ? 'ideal' : raw.humidity > 60 ? 'elevated' : 'dry';

  const recentParticulateValues: number[] =
    trendHistory.length >= 5
      ? trendHistory.slice(-5).map((t) => t.pm25)
      : [pm25 - 4, pm25 - 2, pm25, pm25 + 1, pm25 + 2].map((v) => Math.max(5, v));

  const predictStatus: 'Risk Rising' | 'Conditions Stable' | 'Risk Decreasing' =
    pm25Trend === 'rising' ? 'Risk Rising' : pm25Trend === 'falling' ? 'Risk Decreasing' : 'Conditions Stable';

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const riskScore = riskLevel === 'high' ? Math.min(200, aqi) :
                    riskLevel === 'moderate' ? Math.min(100, Math.max(50, aqi)) :
                    Math.max(10, Math.min(49, aqi));

  return {
    timestamp: now.toISOString(),
    lastUpdated: `${timeStr} • ${raw.device_id} (Live Sensor)`,
    riskLevel,
    riskScore,
    riskExplanation:
      riskLevel === 'high'
        ? `Critical air quality detected by ${raw.device_id}. MQ135 raw: ${raw.mq135_raw}. Move to clean air immediately.`
        : riskLevel === 'moderate'
        ? `Moderate pollution detected by ${raw.device_id}. MQ135: ${raw.mq135_raw}. Sensitive groups take caution.`
        : `Air quality is healthy (${raw.device_id}). MQ135: ${raw.mq135_raw}. Safe for outdoor activities.`,
    pm25: {
      value: pm25,
      unit: 'µg/m³',
      status: pm25Status,
      trend: {
        direction: pm25Trend,
        delta: pm25Trend === 'rising' ? '+3.2' : pm25Trend === 'falling' ? '-2.1' : '±0.4',
        isPositive: pm25Trend !== 'rising',
      },
    },
    voc: {
      value: voc,
      unit: 'ppb',
      status: vocStatus,
      trend: { direction: 'stable', delta: '±5', isPositive: true },
    },
    temperature: {
      value: Math.round(raw.temp * 10) / 10,
      unit: '°C',
      status: tempStatus,
      trend: { direction: 'stable', delta: '±0.5', isPositive: true },
    },
    humidity: {
      value: Math.round(raw.humidity),
      unit: '%',
      status: humStatus,
      trend: { direction: 'stable', delta: '±2', isPositive: true },
    },
    pressure: { value: 1013, unit: 'hPa', status: 'normal' },
    pm10: {
      value: Math.round(pm25 * 1.5),
      unit: 'µg/m³',
      status: pm25 * 1.5 <= 50 ? 'optimal' : 'moderate',
    },
    predictiveTrend: {
      status: predictStatus,
      direction: pm25Trend,
      changeSummary:
        pm25Trend === 'rising'
          ? 'Sensor readings trending upward — pollutant levels increasing.'
          : pm25Trend === 'falling'
          ? 'Conditions improving — pollutant load declining.'
          : 'Environmental baseline is stable.',
      explanation:
        pm25Trend === 'rising'
          ? 'Continued exposure risk if trend persists. Move to ventilated space if symptomatic.'
          : 'No immediate escalation predicted based on current trajectory.',
      recentParticulateValues,
      timeframe: `Last ${Math.min(trendHistory.length, 5)} readings`,
    },
  };
}

// Seed initial snapshot
latestSnapshot = rawToSnapshot(INITIAL_RAW);

/**
 * Check if the current reading should trigger an alert.
 */
function evaluateAlerts(raw: RawTelemetry, snapshot: EnvironmentSnapshot): void {
  const pm25 = snapshot.pm25.value;
  const risk = raw.risk_level.toUpperCase();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Avoid duplicate alerts within 60 seconds for same risk level
  const recentAlertOfSameType = alertLog.find(
    (a) => a.category === 'environmental' && 
           (now.getTime() - new Date(a.id.replace('alert-', '')).getTime()) < 60_000
  );
  if (recentAlertOfSameType) return;

  if (risk === 'DANGER' || pm25 > 75) {
    const alert: RiskAlert = {
      id: `alert-${Date.now()}`,
      timestamp: timeStr,
      date: 'Today',
      severity: 'critical',
      category: 'environmental',
      title: 'DANGER: Critical Air Quality',
      message: `${raw.device_id} detected critical pollution. MQ135: ${raw.mq135_raw}, PM2.5 est: ${pm25} µg/m³. Take rescue inhaler & move indoors.`,
      relatedReadings: [
        { metric: 'PM2.5 (est)', value: `${pm25} µg/m³`, threshold: '75 µg/m³' },
        { metric: 'MQ135 Raw', value: `${raw.mq135_raw}` },
        { metric: 'Temp', value: `${raw.temp}°C` },
      ],
      status: 'new',
      locationName: `Sensor ${raw.device_id}`,
    };
    alertLog.unshift(alert);
    alertListeners.forEach((fn) => fn([...alertLog]));
  } else if (risk === 'WARNING' || pm25 > 35) {
    const alert: RiskAlert = {
      id: `alert-${Date.now()}`,
      timestamp: timeStr,
      date: 'Today',
      severity: 'moderate',
      category: 'environmental',
      title: 'WARNING: Elevated Air Pollution',
      message: `${raw.device_id} detected elevated pollution. MQ135: ${raw.mq135_raw}, PM2.5 est: ${pm25} µg/m³. Consider pre-exposure shield dose.`,
      relatedReadings: [
        { metric: 'PM2.5 (est)', value: `${pm25} µg/m³`, threshold: '35 µg/m³' },
        { metric: 'MQ135 Raw', value: `${raw.mq135_raw}` },
      ],
      status: 'new',
      locationName: `Sensor ${raw.device_id}`,
    };
    alertLog.unshift(alert);
    alertListeners.forEach((fn) => fn([...alertLog]));
  }

  if (raw.humidity > 80) {
    const alert: RiskAlert = {
      id: `alert-${Date.now() + 1}`,
      timestamp: timeStr,
      date: 'Today',
      severity: 'moderate',
      category: 'environmental',
      title: 'High Humidity Alert',
      message: `Humidity at ${raw.humidity}% — increased airway reactivity risk. Monitor symptoms.`,
      relatedReadings: [
        { metric: 'Humidity', value: `${raw.humidity}%`, threshold: '80%' },
      ],
      status: 'new',
      locationName: `Sensor ${raw.device_id}`,
    };
    alertLog.unshift(alert);
    alertListeners.forEach((fn) => fn([...alertLog]));
  }

  if (raw.temp > 38 || raw.temp < 5) {
    const alert: RiskAlert = {
      id: `alert-${Date.now() + 2}`,
      timestamp: timeStr,
      date: 'Today',
      severity: 'moderate',
      category: 'environmental',
      title: raw.temp > 38 ? 'Extreme Heat Alert' : 'Cold Air Alert',
      message: raw.temp > 38
        ? `Temperature at ${raw.temp}°C — extreme heat is a bronchospasm trigger.`
        : `Temperature at ${raw.temp}°C — cold air is a known bronchospasm trigger.`,
      relatedReadings: [
        { metric: 'Temperature', value: `${raw.temp}°C` },
      ],
      status: 'new',
      locationName: `Sensor ${raw.device_id}`,
    };
    alertLog.unshift(alert);
    alertListeners.forEach((fn) => fn([...alertLog]));
  }

  // Keep alert log manageable
  if (alertLog.length > EVENT_LOG_MAX) {
    alertLog = alertLog.slice(0, EVENT_LOG_MAX);
  }
}

/**
 * Log a telemetry reading as an environmental event.
 */
function logEvent(raw: RawTelemetry, snapshot: EnvironmentSnapshot): void {
  readingCount++;
  // Only log events on risk transitions or every 12th reading (~1 min at 5s intervals)
  const isRisky = raw.risk_level.toUpperCase() !== 'SAFE';
  if (!isRisky && readingCount % 12 !== 0) return;

  const now = new Date();
  const event: EnvironmentalEvent = {
    id: `evt-${Date.now().toString().slice(-6)}`,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    eventType: isRisky ? 'spike' : 'baseline',
    riskLevel: snapshot.riskLevel,
    pm25: snapshot.pm25.value,
    pm10: snapshot.pm10?.value || 0,
    voc: snapshot.voc.value,
    temperature: snapshot.temperature.value,
    humidity: snapshot.humidity.value,
    inhalationDetected: false,
    location: {
      name: `Sensor ${raw.device_id}`,
      area: 'Device Vicinity',
      coordinates: { lat: 28.4623, lng: 77.4904 },
    },
    duration: `${POLL_INTERVAL_MS / 1000}s reading`,
    notes: `MQ135 Raw: ${raw.mq135_raw} | Voltage: ${raw.sensor_voltage}V | Score: ${raw.air_quality_score}`,
  };

  eventLog.unshift(event);
  if (eventLog.length > EVENT_LOG_MAX) {
    eventLog = eventLog.slice(0, EVENT_LOG_MAX);
  }
  eventListeners.forEach((fn) => fn([...eventLog]));
}

// ── Fetch & poll ────────────────────────────────────────────────────────────

const TELEMETRY_ROUTES = [
  '/api/telemetry',
  '/api/telemetry/latest',
  '/telemetry',
  '/latest',
  '/',
];

let activeRoute: string | null = null;

async function fetchOnce(): Promise<RawTelemetry | null> {
  // If we already found a working route, use it
  const routes = activeRoute ? [activeRoute] : TELEMETRY_ROUTES;

  for (const route of routes) {
    try {
      const url = `${BACKEND_BASE_URL}${route}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        // Validate that it looks like our telemetry payload
        if (data && (data.device_id || data.mq135_raw !== undefined || data.air_quality_score !== undefined)) {
          activeRoute = route;
          return {
            device_id: data.device_id || 'AG-001',
            temp: typeof data.temp === 'number' ? data.temp : 25,
            humidity: typeof data.humidity === 'number' ? data.humidity : 50,
            mq135_raw: typeof data.mq135_raw === 'number' ? data.mq135_raw : 300,
            sensor_voltage: typeof data.sensor_voltage === 'number' ? data.sensor_voltage : 1.5,
            air_quality_score: typeof data.air_quality_score === 'number' ? data.air_quality_score : 50,
            risk_level: data.risk_level || 'SAFE',
          };
        }
      }
    } catch {
      // Try next route
    }
  }
  return null;
}

async function pollCycle(): Promise<void> {
  const raw = await fetchOnce();

  if (raw) {
    const wasDisconnected = !isConnected;
    isConnected = true;
    lastError = null;
    latestRaw = raw;

    // Add to trend history
    const pm25 = mq135ToPM25(raw.mq135_raw, raw.sensor_voltage);
    const voc = mq135ToVOC(raw.mq135_raw);
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const trendPoint: TrendDataPoint = {
      time: timeLabel,
      fullTime: timeLabel,
      pm25,
      pm10: Math.round(pm25 * 1.5),
      voc,
      temperature: Math.round(raw.temp * 10) / 10,
      humidity: Math.round(raw.humidity),
      riskLevel: mapRiskLevel(raw.risk_level),
    };
    trendHistory.push(trendPoint);
    if (trendHistory.length > TREND_HISTORY_SIZE) {
      trendHistory = trendHistory.slice(-TREND_HISTORY_SIZE);
    }

    // Build snapshot
    latestSnapshot = rawToSnapshot(raw);

    // Broadcast
    telemetryListeners.forEach((fn) => fn(raw));
    snapshotListeners.forEach((fn) => fn(latestSnapshot!));

    if (wasDisconnected) {
      connectionListeners.forEach((fn) => fn(true));
    }

    // Evaluate alerts & log events
    evaluateAlerts(raw, latestSnapshot);
    logEvent(raw, latestSnapshot);
  } else {
    if (isConnected) {
      isConnected = false;
      lastError = `Cannot reach backend at ${BACKEND_BASE_URL}`;
      connectionListeners.forEach((fn) => fn(false));
    }
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export const backendTelemetryService = {
  /**
   * Start polling the backend. Idempotent — calling multiple times is safe.
   */
  start(): void {
    if (pollTimer) return;
    console.log(`[BackendTelemetry] Starting polling at ${BACKEND_BASE_URL} every ${POLL_INTERVAL_MS}ms`);
    pollCycle(); // Initial immediate fetch
    pollTimer = setInterval(pollCycle, POLL_INTERVAL_MS);
  },

  /**
   * Stop polling.
   */
  stop(): void {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  },

  /**
   * Get current connection status.
   */
  isConnected(): boolean {
    return isConnected;
  },

  /**
   * Get last error message.
   */
  getLastError(): string | null {
    return lastError;
  },

  /**
   * Get the latest raw telemetry from ESP32.
   */
  getLatestRaw(): RawTelemetry | null {
    return latestRaw ? { ...latestRaw } : null;
  },

  /**
   * Get the latest converted EnvironmentSnapshot.
   */
  getLatestSnapshot(): EnvironmentSnapshot | null {
    return latestSnapshot ? { ...latestSnapshot } : null;
  },

  /**
   * Get trend history for charts.
   */
  getTrendHistory(): TrendDataPoint[] {
    return [...trendHistory];
  },

  /**
   * Get all logged alerts.
   */
  getAlerts(): RiskAlert[] {
    return [...alertLog];
  },

  /**
   * Get all logged events.
   */
  getEvents(): EnvironmentalEvent[] {
    return [...eventLog];
  },

  /**
   * Acknowledge an alert.
   */
  acknowledgeAlert(id: string): void {
    const alert = alertLog.find((a) => a.id === id);
    if (alert) {
      alert.status = 'acknowledged';
      alertListeners.forEach((fn) => fn([...alertLog]));
    }
  },

  /**
   * Resolve an alert.
   */
  resolveAlert(id: string): void {
    const alert = alertLog.find((a) => a.id === id);
    if (alert) {
      alert.status = 'resolved';
      alertListeners.forEach((fn) => fn([...alertLog]));
    }
  },

  /**
   * Acknowledge all new alerts.
   */
  acknowledgeAllAlerts(): void {
    alertLog = alertLog.map((a) => a.status === 'new' ? { ...a, status: 'acknowledged' } : a);
    alertListeners.forEach((fn) => fn([...alertLog]));
  },

  // ── Subscriptions ──

  subscribeToSnapshot(callback: SnapshotListener): () => void {
    snapshotListeners.add(callback);
    if (latestSnapshot) callback(latestSnapshot);
    return () => snapshotListeners.delete(callback);
  },

  subscribeToRawTelemetry(callback: TelemetryListener): () => void {
    telemetryListeners.add(callback);
    if (latestRaw) callback(latestRaw);
    return () => telemetryListeners.delete(callback);
  },

  subscribeToConnection(callback: ConnectionListener): () => void {
    connectionListeners.add(callback);
    callback(isConnected);
    return () => connectionListeners.delete(callback);
  },

  subscribeToAlerts(callback: AlertListener): () => void {
    alertListeners.add(callback);
    callback([...alertLog]);
    return () => alertListeners.delete(callback);
  },

  subscribeToEvents(callback: EventListener): () => void {
    eventListeners.add(callback);
    callback([...eventLog]);
    return () => eventListeners.delete(callback);
  },

  /**
   * Convert latest raw telemetry to SensorInput for ML predictions.
   */
  getSensorInputForML(): { pm25: number; aqi: number; humidity: number; temp_c: number } | null {
    if (!latestRaw) return null;
    return {
      pm25: mq135ToPM25(latestRaw.mq135_raw, latestRaw.sensor_voltage),
      aqi: deriveAQI(latestRaw.air_quality_score, latestRaw.mq135_raw),
      humidity: latestRaw.humidity,
      temp_c: latestRaw.temp,
    };
  },
};
