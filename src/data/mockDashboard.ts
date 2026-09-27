import { EnvironmentSnapshot } from '../types';

export const initialEnvironmentSnapshot: EnvironmentSnapshot = {
  timestamp: new Date().toISOString(),
  lastUpdated: '12 seconds ago',
  riskLevel: 'low',
  riskScore: 24,
  riskExplanation: 'Environment currently looks safe. Particulate and volatile compound metrics are within stable baseline limits.',
  pm25: {
    value: 32,
    unit: 'µg/m³',
    status: 'optimal',
    trend: {
      direction: 'rising',
      delta: '+12% (15 min)',
      isPositive: false,
    },
  },
  voc: {
    value: 142,
    unit: 'ppb',
    status: 'optimal',
    trend: {
      direction: 'stable',
      delta: '±2% (1 hr)',
      isPositive: true,
    },
  },
  temperature: {
    value: 27,
    unit: '°C',
    status: 'comfortable',
    trend: {
      direction: 'stable',
      delta: '±0.5°C',
      isPositive: true,
    },
  },
  humidity: {
    value: 61,
    unit: '%',
    status: 'ideal',
    trend: {
      direction: 'falling',
      delta: '-3% (30 min)',
      isPositive: true,
    },
  },
  pressure: {
    value: 1013,
    unit: 'hPa',
    status: 'normal',
  },
  pm10: {
    value: 46,
    unit: 'µg/m³',
    status: 'optimal',
  },
  predictiveTrend: {
    status: 'Risk Rising',
    direction: 'rising',
    changeSummary: '+57% particulate incline over the last 15 minutes',
    explanation: 'Particulate density (PM2.5) has steadily accelerated across the last five consecutive 3-minute sensor telemetry intervals. While still below acute hazard thresholds, persistent micro-increases signal potential localized trigger buildup.',
    recentParticulateValues: [28, 31, 35, 39, 44],
    timeframe: 'Last 15 minutes',
  },
};

// Alternative state presets for demo/simulation capability (e.g. testing Moderate and High risk modes in Hackathon)
export const moderateRiskSnapshot: EnvironmentSnapshot = {
  ...initialEnvironmentSnapshot,
  riskLevel: 'moderate',
  riskScore: 62,
  riskExplanation: 'Potential trigger conditions detected. Elevated particulate density (PM2.5) and rising VOC levels detected in immediate environment.',
  pm25: {
    value: 58,
    unit: 'µg/m³',
    status: 'moderate',
    trend: {
      direction: 'rising',
      delta: '+24% (15 min)',
      isPositive: false,
    },
  },
  voc: {
    value: 380,
    unit: 'ppb',
    status: 'moderate',
    trend: {
      direction: 'rising',
      delta: '+18%',
      isPositive: false,
    },
  },
  predictiveTrend: {
    status: 'Risk Rising',
    direction: 'rising',
    changeSummary: '+82% particulate climb',
    explanation: 'Rapid particulate buildup observed. Moving indoors or ventilating surrounding air space is recommended to avoid sustained exposure.',
    recentParticulateValues: [38, 44, 49, 54, 58],
    timeframe: 'Last 15 minutes',
  },
};

export const highRiskSnapshot: EnvironmentSnapshot = {
  ...initialEnvironmentSnapshot,
  riskLevel: 'high',
  riskScore: 88,
  riskExplanation: 'Significant environmental anomaly detected. Severe particulate concentration observed in surrounding air zone.',
  pm25: {
    value: 94,
    unit: 'µg/m³',
    status: 'elevated',
    trend: {
      direction: 'rising',
      delta: '+64% (10 min)',
      isPositive: false,
    },
  },
  voc: {
    value: 740,
    unit: 'ppb',
    status: 'elevated',
    trend: {
      direction: 'rising',
      delta: '+45%',
      isPositive: false,
    },
  },
  predictiveTrend: {
    status: 'Risk Rising',
    direction: 'rising',
    changeSummary: 'Critical environmental spike',
    explanation: 'Particulate matter exceeds safe baseline parameters by 3.2x. Environmental anomaly identified in proximity.',
    recentParticulateValues: [48, 62, 74, 85, 94],
    timeframe: 'Last 15 minutes',
  },
};
