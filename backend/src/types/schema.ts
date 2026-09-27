/**
 * Firestore Database Schema Definitions
 * Strictly matches the team contract specifications.
 */

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface DeviceDocument {
  device_id: string;
  owner: string;
  registered_at: string | Date;
}

export interface ReadingDocument {
  device_id: string;
  pm25: number;
  temp: number;
  humidity: number;
  risk_level: RiskLevel;
  lat: number;
  lng: number;
  timestamp: string | Date;
}

export interface AlertDocument {
  device_id: string;
  risk_level: RiskLevel;
  lat: number;
  lng: number;
  timestamp: string | Date;
  resolved: boolean;
}
