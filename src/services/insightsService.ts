import { WeeklyInsight } from '../types';
import { mockWeeklyInsights } from '../data/mockInsights';

/**
 * Service abstraction for AI Environmental Insights.
 * Ready for backend / Gemini endpoint integration in future phases.
 */

export const insightsService = {
  async getWeeklyInsights(): Promise<WeeklyInsight[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...mockWeeklyInsights];
  },

  async requestSynthesisRefresh(): Promise<{ message: string; refreshedAt: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      message: 'Telemetry pattern correlation updated across past 7 days of sensor logs.',
      refreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
