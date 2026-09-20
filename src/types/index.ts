export type RiskLevel = 'low' | 'moderate' | 'high';

export interface MetricTrend {
  direction: 'rising' | 'stable' | 'falling';
  delta: string;
  isPositive: boolean; // positive in health context (e.g. falling pollution is positive)
}

export interface EnvironmentSnapshot {
  timestamp: string;
  lastUpdated: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  riskExplanation: string;
  pm25: {
    value: number;
    unit: string;
    status: 'optimal' | 'moderate' | 'elevated';
    trend: MetricTrend;
  };
  voc: {
    value: number;
    unit: string;
    status: 'optimal' | 'moderate' | 'elevated';
    trend: MetricTrend;
  };
  temperature: {
    value: number;
    unit: string;
    status: 'comfortable' | 'warm' | 'cool';
    trend: MetricTrend;
  };
  humidity: {
    value: number;
    unit: string;
    status: 'ideal' | 'elevated' | 'dry';
    trend: MetricTrend;
  };
  pressure: {
    value: number;
    unit: string;
    status: 'normal';
  };
  pm10: {
    value: number;
    unit: string;
    status: 'optimal' | 'moderate';
  };
  predictiveTrend: {
    status: 'Risk Rising' | 'Conditions Stable' | 'Risk Decreasing';
    direction: 'rising' | 'stable' | 'falling';
    changeSummary: string;
    explanation: string;
    recentParticulateValues: number[]; // e.g. [28, 31, 35, 39, 44]
    timeframe: string;
  };
}

export type EventType = 
  | 'Environmental Warning'
  | 'Inhalation Event'
  | 'Environmental Anomaly'
  | 'Baseline Sync';

export interface EventLocation {
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export interface EnvironmentalEvent {
  id: string;
  timestamp: string;
  date: string;
  eventType: EventType;
  riskLevel: RiskLevel;
  pm25: number;
  pm10: number;
  voc: number;
  temperature: number;
  humidity: number;
  pressure?: number;
  location: EventLocation;
  inhalationDetected: boolean;
  inhalationDoseCount?: number;
  environmentalTrend: string;
  notes?: string;
  recommendationPrompt?: string;
}

export interface DeviceSensor {
  id: string;
  name: string;
  type: string;
  model: string;
  status: 'active' | 'calibrating' | 'offline' | 'standby';
  unit: string;
  latestReading: string | number;
}

export interface DeviceStatus {
  deviceId: string;
  deviceName: string;
  connected: boolean;
  esp32Connected: boolean;
  batteryLevel: number;
  isCharging: boolean;
  firmwareVersion: string;
  lastSyncSecondsAgo: number;
  connectionQuality:
    | 'Excellent'
    | 'Good'
    | 'Fair'
    | 'Poor'
    | 'Waiting for device'
    | 'Connected (Simulated)';
  rssi: number; // in dBm
  activeSensorsCount: number;
  totalSensorsCount: number;
  sensors: DeviceSensor[];
  bleState: 'connected' | 'pairing' | 'disconnected';
  wifiState: 'connected' | 'disconnected';
  gpsLock: boolean;
}

export interface TrendDataPoint {
  time: string;
  fullTime?: string;
  pm25: number;
  voc: number;
  temperature: number;
  humidity: number;
  riskLevel: RiskLevel;
}

export interface DailyFrequencyPoint {
  day: string;
  totalEvents: number;
  warningEvents: number;
  inhalationEvents: number;
}

export interface RiskDistributionPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
  level: RiskLevel;
}

export interface TriggerCorrelation {
  id: string;
  factor: string;
  observedCorrelation: 'High' | 'Moderate' | 'Low';
  rate: string;
  description: string;
  coFactor: string;
}

export interface WeeklyInsight {
  id: string;
  section: 'Weekly Summary' | 'Environmental Pattern' | 'Risk Pattern' | 'Potential Pattern' | 'Notable Changes' | 'Recommended Questions for Doctor';
  headline: string;
  detail: string;
  highlightStat: string;
  severity: 'safe' | 'caution' | 'warning';
  observedDateRange: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  accountCreatedAt: string;
  deviceAssignedId?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}

export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type AlertCategory = 'environmental' | 'device' | 'sensor' | 'connection';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface RiskAlert {
  id: string;
  timestamp: string;
  date: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  relatedReadings?: {
    metric: string;
    value: string | number;
    threshold?: string | number;
  }[];
  status: AlertStatus;
  locationName?: string;
}

export interface RiskEngineEvaluation {
  riskLevel: RiskLevel;
  environmentalTrend: 'RISING' | 'STABLE' | 'FALLING';
  anomalyScore: number; // 0.00 to 1.00 Edge AI Environmental Anomaly Score
  detectionReason: string;
  thresholdStatus: 'Normal Baseline' | 'Moderate Warning' | 'Elevated Caution';
  trendVelocity: string;
  edgeAiConfidence: number; // 0 to 100%
}

export interface DoctorReport {
  id: string;
  userIdentifier: string;
  userName: string;
  dateRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
  totalEvents: number;
  averagePm25: number;
  peakPm25: number;
  inhalationCount: number;
  riskDistributionSummary: {
    safePercentage: number;
    moderatePercentage: number;
    elevatedPercentage: number;
  };
  dominantExposureZones: string[];
  aiEnvironmentalSummary: string;
  recommendedPhysicianQuestions: string[];
  selectedMetrics: string[];
  eventsIncluded: EnvironmentalEvent[];
}

export interface UserSettings {
  notifications: {
    inAppAlerts: boolean;
    soundEnabled: boolean;
    highRiskAlerts: boolean;
    earlyEnvironmentalWarnings?: boolean;
    dailySummary?: boolean;
    deviceDisconnectionNotice: boolean;
    deviceDisconnectedAlert?: boolean;
    weeklyDigestEmail: boolean;
  };
  devicePreferences: {
    syncFrequencySeconds: number;
    ledIndicatorMode: 'ambient' | 'subtle' | 'off';
    ledBrightness?: number;
    buzzerEnabled?: boolean;
    samplingFrequencySeconds?: number;
    temperatureUnit?: 'C' | 'F';
    vibrationFeedback: boolean;
    gpsTrackingEnabled: boolean;
  };
  dataSharing: {
    doctorSharingActive: boolean;
    shareCode: string;
    anonymousEnvironmentalResearch: boolean;
    anonymousResearchSharing?: boolean;
    physicianReportGeneration?: boolean;
  };
  appearance: {
    theme: 'light';
    compactMode: boolean;
  };
}

