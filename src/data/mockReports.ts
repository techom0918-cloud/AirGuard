import { DoctorReport } from '../types';
import { mockEvents } from './mockEvents';

export const mockDefaultDoctorReport: DoctorReport = {
  id: 'rep-airguard-2026-09',
  userIdentifier: 'AG-PT-88219',
  userName: 'Rishabh Shishodiya',
  dateRange: {
    start: '2026-09-08',
    end: '2026-09-15',
  },
  generatedAt: 'September 15, 2026 at 09:30 AM PST',
  totalEvents: 8,
  averagePm25: 38.4,
  peakPm25: 96.0,
  inhalationCount: 3,
  riskDistributionSummary: {
    safePercentage: 67,
    moderatePercentage: 25,
    elevatedPercentage: 8,
  },
  dominantExposureZones: [
    'Downtown Transit Corridor (58 µg/m³ avg)',
    'Industrial Intersection & 5th (96 µg/m³ peak)',
    'Yerba Buena Gardens (31 µg/m³ avg - Clean Baseline)',
  ],
  aiEnvironmentalSummary:
    'During the 7-day observation cycle, the user’s AirGuard system logged 8 total environmental events. Elevated particulate readings consistently clustered between 5:30 PM and 7:00 PM along outdoor urban transit routes. Smart inhaler actuations were recorded on 3 occasions, each preceded by a sustained 15-minute rise in ambient PM2.5 and VOC concentrations. Home baseline air quality remained consistently optimal (<20 µg/m³).',
  recommendedPhysicianQuestions: [
    'Does the patient commute during peak roadway exhaust hours (5:30 PM - 7:00 PM)?',
    'Could preventative pre-transit dosing be evaluated for observed urban corridors with sustained PM2.5 > 50 µg/m³?',
    'Are indoor workplace VOC levels (385 ppb peak) contributing to cumulative airway sensitivity?',
  ],
  selectedMetrics: ['PM2.5', 'VOC', 'Temperature', 'Humidity', 'Inhalation Timestamps', 'GPS Clusters'],
  eventsIncluded: mockEvents,
};
