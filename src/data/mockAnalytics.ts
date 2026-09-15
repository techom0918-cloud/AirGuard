import { 
  TrendDataPoint, 
  DailyFrequencyPoint, 
  RiskDistributionPoint, 
  TriggerCorrelation 
} from '../types';

export const mock24HourTrend: TrendDataPoint[] = [
  { time: '00:00', fullTime: '12:00 AM', pm25: 14, voc: 80, temperature: 21, humidity: 68, riskLevel: 'low' },
  { time: '02:00', fullTime: '02:00 AM', pm25: 12, voc: 75, temperature: 20, humidity: 70, riskLevel: 'low' },
  { time: '04:00', fullTime: '04:00 AM', pm25: 15, voc: 72, temperature: 20, humidity: 72, riskLevel: 'low' },
  { time: '06:00', fullTime: '06:00 AM', pm25: 22, voc: 90, temperature: 22, humidity: 66, riskLevel: 'low' },
  { time: '08:00', fullTime: '08:00 AM', pm25: 38, voc: 160, temperature: 24, humidity: 61, riskLevel: 'moderate' },
  { time: '10:00', fullTime: '10:00 AM', pm25: 58, voc: 340, temperature: 27, humidity: 57, riskLevel: 'moderate' },
  { time: '12:00', fullTime: '12:00 PM', pm25: 42, voc: 220, temperature: 28, humidity: 53, riskLevel: 'moderate' },
  { time: '14:00', fullTime: '02:00 PM', pm25: 34, voc: 150, temperature: 29, humidity: 50, riskLevel: 'low' },
  { time: '16:00', fullTime: '04:00 PM', pm25: 49, voc: 280, temperature: 28, humidity: 52, riskLevel: 'moderate' },
  { time: '18:00', fullTime: '06:00 PM', pm25: 94, voc: 680, temperature: 27, humidity: 55, riskLevel: 'high' },
  { time: '20:00', fullTime: '08:00 PM', pm25: 52, voc: 290, temperature: 25, humidity: 58, riskLevel: 'moderate' },
  { time: '22:00', fullTime: '10:00 PM', pm25: 28, voc: 120, temperature: 23, humidity: 64, riskLevel: 'low' },
];

export const mockDailyFrequency: DailyFrequencyPoint[] = [
  { day: 'Mon', totalEvents: 3, warningEvents: 1, inhalationEvents: 2 },
  { day: 'Tue', totalEvents: 2, warningEvents: 0, inhalationEvents: 2 },
  { day: 'Wed', totalEvents: 5, warningEvents: 3, inhalationEvents: 2 },
  { day: 'Thu', totalEvents: 1, warningEvents: 0, inhalationEvents: 1 },
  { day: 'Fri', totalEvents: 4, warningEvents: 2, inhalationEvents: 2 },
  { day: 'Sat', totalEvents: 6, warningEvents: 4, inhalationEvents: 2 },
  { day: 'Sun', totalEvents: 3, warningEvents: 1, inhalationEvents: 2 },
];

export const mockRiskDistribution: RiskDistributionPoint[] = [
  { name: 'Low Risk', value: 16, percentage: 67, color: '#10B981', level: 'low' },
  { name: 'Moderate Risk', value: 6, percentage: 25, color: '#F59E0B', level: 'moderate' },
  { name: 'High Risk', value: 2, percentage: 8, color: '#EF4444', level: 'high' },
];

export const mockTriggerCorrelations: TriggerCorrelation[] = [
  {
    id: 'cor-1',
    factor: 'PM2.5 + Low Humidity (<50%)',
    observedCorrelation: 'High',
    rate: '78% of elevated events',
    description: 'Dry air combined with particulate spikes coincided with increased airway sensitivity and event triggers.',
    coFactor: 'Dry Ambient Wind',
  },
  {
    id: 'cor-2',
    factor: 'VOC Peak + Evening Commute',
    observedCorrelation: 'High',
    rate: '64% of warning alerts',
    description: 'Transit corridors between 5:30 PM – 7:00 PM exhibit synchronized volatile organic and fine particle surges.',
    coFactor: 'Urban Traffic Inversion',
  },
  {
    id: 'cor-3',
    factor: 'Rapid Temperature Drops (>4°C/hr)',
    observedCorrelation: 'Moderate',
    rate: '42% co-occurrence',
    description: 'Transitioning from warm indoors to cold evening air frequently accompanied inhalation device actuations.',
    coFactor: 'Thermal Gradient',
  },
  {
    id: 'cor-4',
    factor: 'High Humidity (>70%) + Stagnant Air',
    observedCorrelation: 'Low',
    rate: '19% co-occurrence',
    description: 'Misty or high-moisture air showed slower particulate dispersion but minimal volatile organic elevation.',
    coFactor: 'Marine Fog Layer',
  },
];
