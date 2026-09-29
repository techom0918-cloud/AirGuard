import {
  EnvironmentSnapshot,
  TrendDataPoint,
  EnvironmentalEvent,
  RiskAlert,
  DeviceStatus,
  RiskLevel,
} from '../types';

/**
 * Backend Data Transfer Objects (DTOs)
 * Strictly matches the locked backend database contract.
 */
export interface BackendReadingDto {
  device_id: string;
  pm25: number;
  temp: number;
  humidity: number;
  risk_level: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface BackendAlertDto {
  device_id: string;
  risk_level: string;
  lat: number;
  lng: number;
  timestamp: string;
  resolved: boolean;
}

export interface BackendDeviceDto {
  device_id: string;
  owner: string;
  registered_at: string;
}

/**
 * Transforms master backend risk level vocabulary (SAFE, WARNING, DANGER)
 * into existing frontend UI RiskLevel vocabulary ('low', 'moderate', 'high').
 * Handles case-insensitive inputs safely (SAFE, safe, Safe, WARNING, etc.)
 */
export function normalizeRiskLevel(rawRisk: string | undefined): RiskLevel {
  if (!rawRisk || typeof rawRisk !== 'string') return 'low';
  const clean = rawRisk.trim().toUpperCase();

  if (clean === 'SAFE' || clean === 'LOW') {
    return 'low';
  }
  if (clean === 'WARNING' || clean === 'MODERATE') {
    return 'moderate';
  }
  if (clean === 'DANGER' || clean === 'HIGH' || clean === 'CRITICAL') {
    return 'high';
  }

  // Safe fallback for unrecognized risk strings (does not force to high/danger)
  return 'low';
}

/**
 * Pure transformation adapters: Backend DTOs -> Frontend UI Models
 */

export function readingToSnapshot(reading: BackendReadingDto): EnvironmentSnapshot {
  const pm25Value = typeof reading?.pm25 === 'number' && Number.isFinite(reading.pm25) ? reading.pm25 : 0;
  const tempValue = typeof reading?.temp === 'number' && Number.isFinite(reading.temp) ? reading.temp : 24;
  const humidityValue = typeof reading?.humidity === 'number' && Number.isFinite(reading.humidity) ? reading.humidity : 50;
  const riskLevel: RiskLevel = normalizeRiskLevel(reading?.risk_level);

  const riskScore = Math.min(100, Math.max(0, Math.round(pm25Value * 0.85)));

  const riskExplanation =
    riskLevel === 'high'
      ? 'Elevated airborne particulate density detected. Take inhaler precautions.'
      : riskLevel === 'moderate'
      ? 'Moderate particulate presence logged. Monitor environmental conditions.'
      : 'Optimal baseline particulate and ambient levels.';

  const pm25Status = pm25Value > 55 ? 'elevated' : pm25Value > 35 ? 'moderate' : 'optimal';
  const tempStatus = tempValue > 30 ? 'warm' : tempValue < 18 ? 'cool' : 'comfortable';
  const humidityStatus = humidityValue > 60 ? 'elevated' : humidityValue < 30 ? 'dry' : 'ideal';

  const dateObj = new Date(reading.timestamp);
  const timeFormatted = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return {
    timestamp: reading.timestamp,
    lastUpdated: timeFormatted,
    riskLevel,
    riskScore,
    riskExplanation,
    pm25: {
      value: pm25Value,
      unit: 'µg/m³',
      status: pm25Status,
      trend: { direction: 'stable', delta: '0', isPositive: true },
    },
    voc: {
      value: 120,
      unit: 'ppb',
      status: 'optimal',
      trend: { direction: 'stable', delta: '0', isPositive: true },
    },
    temperature: {
      value: tempValue,
      unit: '°C',
      status: tempStatus,
      trend: { direction: 'stable', delta: '0', isPositive: true },
    },
    humidity: {
      value: humidityValue,
      unit: '%',
      status: humidityStatus,
      trend: { direction: 'stable', delta: '0', isPositive: true },
    },
    pressure: {
      value: 1013,
      unit: 'hPa',
      status: 'normal',
    },
    pm10: {
      value: Math.round(pm25Value * 1.4),
      unit: 'µg/m³',
      status: pm25Value > 55 ? 'moderate' : 'optimal',
    },
    predictiveTrend: {
      status: riskLevel === 'high' ? 'Risk Rising' : riskLevel === 'moderate' ? 'Conditions Stable' : 'Risk Decreasing',
      direction: riskLevel === 'high' ? 'rising' : 'stable',
      changeSummary: `Telemetry snapshot recorded for device ${reading.device_id}`,
      explanation: 'Continuous optical sensor & barometric telemetry active.',
      recentParticulateValues: [pm25Value],
      timeframe: 'Latest Telemetry',
    },
  };
}

export function readingToTrendPoint(reading: BackendReadingDto): TrendDataPoint {
  const dateObj = new Date(reading.timestamp);
  const formattedTime = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '12:00';

  return {
    time: formattedTime,
    fullTime: reading.timestamp,
    pm25: typeof reading.pm25 === 'number' && Number.isFinite(reading.pm25) ? reading.pm25 : 0,
    voc: 120,
    temperature: typeof reading.temp === 'number' && Number.isFinite(reading.temp) ? reading.temp : 24,
    humidity: typeof reading.humidity === 'number' && Number.isFinite(reading.humidity) ? reading.humidity : 50,
    riskLevel: normalizeRiskLevel(reading.risk_level),
  };
}

export function readingToEvent(reading: BackendReadingDto): EnvironmentalEvent {
  const dateObj = new Date(reading.timestamp);
  const formattedTime = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '12:00 PM';

  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Today';

  const lat = typeof reading.lat === 'number' && Number.isFinite(reading.lat) ? reading.lat : 28.6139;
  const lng = typeof reading.lng === 'number' && Number.isFinite(reading.lng) ? reading.lng : 77.209;
  const riskLevel = normalizeRiskLevel(reading.risk_level);

  return {
    id: `evt-${reading.device_id}-${reading.timestamp}`,
    timestamp: formattedTime,
    date: formattedDate,
    eventType: riskLevel === 'high' ? 'Environmental Warning' : 'Environmental Anomaly',
    riskLevel,
    pm25: reading.pm25 || 0,
    pm10: Math.round((reading.pm25 || 0) * 1.4),
    voc: 120,
    temperature: reading.temp || 24,
    humidity: reading.humidity || 50,
    location: {
      name: `Observation Zone (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      area: `Device ${reading.device_id}`,
      lat,
      lng,
    },
    inhalationDetected: riskLevel === 'high',
    environmentalTrend:
      riskLevel === 'high'
        ? 'Acute particulate concentration spike logged at coordinate'
        : 'Baseline ambient monitoring',
    notes: `Geospatial observation from device ${reading.device_id}.`,
  };
}

export function alertToRiskAlert(alert: BackendAlertDto): RiskAlert {
  const dateObj = new Date(alert.timestamp);
  const formattedTime = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'Today';

  const lat = typeof alert.lat === 'number' && Number.isFinite(alert.lat) ? alert.lat : 28.6139;
  const lng = typeof alert.lng === 'number' && Number.isFinite(alert.lng) ? alert.lng : 77.209;
  const riskLevel = normalizeRiskLevel(alert.risk_level);

  return {
    id: `alt-${alert.device_id}-${alert.timestamp}`,
    timestamp: formattedTime,
    date: formattedDate,
    severity: riskLevel,
    category: 'environmental',
    title: `${alert.risk_level.toUpperCase()} Risk Alert (${alert.device_id})`,
    message: `Environmental risk threshold trigger at (${lat.toFixed(3)}, ${lng.toFixed(3)}).`,
    status: alert.resolved ? 'resolved' : 'new',
    locationName: `Zone (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
  };
}

export function deviceToDeviceStatus(device: BackendDeviceDto): DeviceStatus {
  return {
    deviceId: device.device_id,
    deviceName: `AirGuard Inhaler Sleeve (${device.device_id})`,
    connected: true,
    esp32Connected: true,
    batteryLevel: 92,
    isCharging: false,
    firmwareVersion: 'v2.1.0-prod',
    lastSyncSecondsAgo: 5,
    connectionQuality: 'Excellent',
    rssi: -65,
    activeSensorsCount: 4,
    totalSensorsCount: 4,
    sensors: [
      { id: 's-optical', name: 'Laser PM2.5 Array', type: 'Optical', model: 'SPS30', status: 'active', unit: 'µg/m³', latestReading: 'Active' },
      { id: 's-voc', name: 'MOX VOC Sensor', type: 'Gas', model: 'SGP40', status: 'active', unit: 'ppb', latestReading: 'Active' },
      { id: 's-temp', name: 'Temperature & Humidity', type: 'Thermo', model: 'SHT31', status: 'active', unit: '°C / %', latestReading: 'Active' },
      { id: 's-baro', name: 'Barometric Array', type: 'Pressure', model: 'BMP390', status: 'active', unit: 'hPa', latestReading: 'Active' },
    ],
    bleState: 'connected',
    wifiState: 'connected',
    gpsLock: true,
  };
}
