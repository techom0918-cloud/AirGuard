import { getFirestore } from '../config/firebase.js';
import { logger } from '../utils/logger.js';
import { DeviceDocument, ReadingDocument, AlertDocument, RiskLevel } from '../types/schema.js';

export const COLLECTIONS = {
  DEVICES: 'devices',
  READINGS: 'readings',
  ALERTS: 'alerts',
} as const;

export const getDb = () => {
  const db = getFirestore();
  if (!db) {
    logger.error('Firestore is not initialized. Ensure valid Firebase credentials are configured in environment.');
    throw new Error('Firestore database connection is not initialized.');
  }
  return db;
};

const VALID_RISK_LEVELS: Set<RiskLevel> = new Set(['low', 'moderate', 'high']);

export const validateDevice = (device: DeviceDocument): void => {
  if (!device.device_id || typeof device.device_id !== 'string' || device.device_id.trim() === '') {
    throw new Error('Invalid device payload: device_id must be a non-empty string.');
  }
  if (!device.owner || typeof device.owner !== 'string' || device.owner.trim() === '') {
    throw new Error('Invalid device payload: owner must be a non-empty string.');
  }
};

export const validateReading = (reading: ReadingDocument): void => {
  if (!reading.device_id || typeof reading.device_id !== 'string' || reading.device_id.trim() === '') {
    throw new Error('Invalid reading payload: device_id must be a non-empty string.');
  }
  if (typeof reading.pm25 !== 'number' || !Number.isFinite(reading.pm25)) {
    throw new Error('Invalid reading payload: pm25 must be a finite number.');
  }
  if (typeof reading.temp !== 'number' || !Number.isFinite(reading.temp)) {
    throw new Error('Invalid reading payload: temp must be a finite number.');
  }
  if (typeof reading.humidity !== 'number' || !Number.isFinite(reading.humidity)) {
    throw new Error('Invalid reading payload: humidity must be a finite number.');
  }
  if (typeof reading.lat !== 'number' || !Number.isFinite(reading.lat)) {
    throw new Error('Invalid reading payload: lat must be a finite number.');
  }
  if (typeof reading.lng !== 'number' || !Number.isFinite(reading.lng)) {
    throw new Error('Invalid reading payload: lng must be a finite number.');
  }
  if (!VALID_RISK_LEVELS.has(reading.risk_level)) {
    throw new Error(`Invalid reading payload: risk_level must be one of 'low', 'moderate', 'high'. Received: ${reading.risk_level}`);
  }
};

export const validateAlert = (alert: AlertDocument): void => {
  if (!alert.device_id || typeof alert.device_id !== 'string' || alert.device_id.trim() === '') {
    throw new Error('Invalid alert payload: device_id must be a non-empty string.');
  }
  if (typeof alert.lat !== 'number' || !Number.isFinite(alert.lat)) {
    throw new Error('Invalid alert payload: lat must be a finite number.');
  }
  if (typeof alert.lng !== 'number' || !Number.isFinite(alert.lng)) {
    throw new Error('Invalid alert payload: lng must be a finite number.');
  }
  if (!VALID_RISK_LEVELS.has(alert.risk_level)) {
    throw new Error(`Invalid alert payload: risk_level must be one of 'low', 'moderate', 'high'. Received: ${alert.risk_level}`);
  }
  if (typeof alert.resolved !== 'boolean') {
    throw new Error('Invalid alert payload: resolved must be a boolean.');
  }
};
