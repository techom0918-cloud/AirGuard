import { getFirestore } from '../config/firebase.js';
import { DeviceDocument, ReadingDocument, AlertDocument, RiskLevel } from '../types/schema.js';

export const COLLECTIONS = {
  DEVICES: 'devices',
  READINGS: 'readings',
  ALERTS: 'alerts',
} as const;

export const getDb = () => {
  return getFirestore();
};

export const VALID_RISK_LEVELS: Set<RiskLevel> = new Set(['SAFE', 'WARNING', 'DANGER']);

export const validateDevice = (device: any): void => {
  if (!device || typeof device !== 'object') {
    throw new Error('INVALID_DEVICE_PAYLOAD: Device payload must be an object.');
  }
  if (!device.device_id || typeof device.device_id !== 'string' || device.device_id.trim() === '') {
    throw new Error('INVALID_DEVICE_ID: device_id must be a non-empty string.');
  }
};

export const validateReading = (reading: any): void => {
  if (!reading || typeof reading !== 'object') {
    throw new Error('INVALID_READING_PAYLOAD: Reading payload must be an object.');
  }
  if (!reading.device_id || typeof reading.device_id !== 'string' || reading.device_id.trim() === '') {
    throw new Error('INVALID_DEVICE_ID: device_id must be a non-empty string.');
  }
  if (typeof reading.pm25 !== 'number' || !Number.isFinite(reading.pm25) || reading.pm25 < 0) {
    throw new Error('INVALID_PM25: pm25 must be a non-negative finite number.');
  }
  if (typeof reading.temp !== 'number' || !Number.isFinite(reading.temp) || reading.temp < -50 || reading.temp > 100) {
    throw new Error('INVALID_TEMPERATURE: temp must be a finite number between -50 and 100.');
  }
  if (typeof reading.humidity !== 'number' || !Number.isFinite(reading.humidity) || reading.humidity < 0 || reading.humidity > 100) {
    throw new Error('INVALID_HUMIDITY: humidity must be a finite number between 0 and 100.');
  }
  if (typeof reading.lat !== 'number' || !Number.isFinite(reading.lat) || reading.lat < -90 || reading.lat > 90) {
    throw new Error('INVALID_LOCATION: lat must be a finite number between -90 and 90.');
  }
  if (typeof reading.lng !== 'number' || !Number.isFinite(reading.lng) || reading.lng < -180 || reading.lng > 180) {
    throw new Error('INVALID_LOCATION: lng must be a finite number between -180 and 180.');
  }
  if (!VALID_RISK_LEVELS.has(reading.risk_level)) {
    if (['low', 'moderate', 'high'].includes(reading.risk_level)) {
      throw new Error(`INVALID_RISK_LEVEL: Legacy risk level '${reading.risk_level}' is not supported. Must be SAFE, WARNING, or DANGER.`);
    }
    throw new Error(`INVALID_RISK_LEVEL: risk_level must be one of: SAFE, WARNING, DANGER. Received: '${reading.risk_level}'`);
  }
};

export const validateAlert = (alert: any): void => {
  if (!alert || typeof alert !== 'object') {
    throw new Error('INVALID_ALERT_PAYLOAD: Alert payload must be an object.');
  }
  if (!alert.device_id || typeof alert.device_id !== 'string' || alert.device_id.trim() === '') {
    throw new Error('INVALID_DEVICE_ID: device_id must be a non-empty string.');
  }
  if (typeof alert.lat !== 'number' || !Number.isFinite(alert.lat) || alert.lat < -90 || alert.lat > 90) {
    throw new Error('INVALID_LOCATION: lat must be a finite number between -90 and 90.');
  }
  if (typeof alert.lng !== 'number' || !Number.isFinite(alert.lng) || alert.lng < -180 || alert.lng > 180) {
    throw new Error('INVALID_LOCATION: lng must be a finite number between -180 and 180.');
  }
  if (!VALID_RISK_LEVELS.has(alert.risk_level)) {
    if (['low', 'moderate', 'high'].includes(alert.risk_level)) {
      throw new Error(`INVALID_RISK_LEVEL: Legacy risk level '${alert.risk_level}' is not supported. Must be SAFE, WARNING, or DANGER.`);
    }
    throw new Error(`INVALID_RISK_LEVEL: risk_level must be one of: SAFE, WARNING, DANGER. Received: '${alert.risk_level}'`);
  }
  if (typeof alert.resolved !== 'boolean') {
    throw new Error('INVALID_ALERT_PAYLOAD: resolved must be a boolean.');
  }
};

export const validateDevicePayload = validateDevice;
export const validateReadingPayload = validateReading;
export const validateAlertPayload = validateAlert;
