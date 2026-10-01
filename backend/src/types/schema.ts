/**
 * Firestore Database Schema Definitions
 * Strictly matches Rishabh's database contract specifications.
 */

export type RiskLevel = 'SAFE' | 'WARNING' | 'DANGER';

export interface DeviceDocument {
  device_id: string;
  owner: string;
  registered_at: string | Date;
  lat?: number;
  lng?: number;
}

export interface ReadingDocument {
  device_id: string;
  pm25?: number | null;
  temp: number;
  humidity: number;
  risk_level: RiskLevel;
  lat: number;
  lng: number;
  timestamp: string | Date;
  mq135_raw?: number;
  sensor_voltage?: number;
  air_quality_score?: number;
}

export interface AlertDocument {
  device_id: string;
  risk_level: RiskLevel;
  lat: number;
  lng: number;
  timestamp: string | Date;
  resolved: boolean;
}

export interface HeatmapPoint {
  device_id: string;
  lat: number;
  lng: number;
  pm25?: number | null;
  risk_level: RiskLevel;
  timestamp: string | Date;
  air_quality_score?: number;
}
