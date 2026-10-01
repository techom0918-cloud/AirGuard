import { EnvironmentalEvent, RiskLevel, EventType } from '../types';
import { backendTelemetryService } from './backendTelemetryService';

/**
 * Service abstraction for Environmental and Inhalation Events.
 * Now backed by real-time telemetry — events are auto-logged from sensor readings.
 */

export interface EventFilterCriteria {
  riskLevel?: RiskLevel | 'all';
  eventType?: EventType | 'all';
  searchQuery?: string;
  startDate?: string;
}

export const eventService = {
  /**
   * Retrieves events matching optional filters — from real telemetry log.
   */
  async getEvents(filters?: EventFilterCriteria): Promise<EnvironmentalEvent[]> {
    let results = backendTelemetryService.getEvents();

    if (!filters) return results;

    if (filters.riskLevel && filters.riskLevel !== 'all') {
      results = results.filter((evt) => evt.riskLevel === filters.riskLevel);
    }

    if (filters.eventType && filters.eventType !== 'all') {
      results = results.filter((evt) => evt.eventType === filters.eventType);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (evt) =>
          evt.location.name.toLowerCase().includes(q) ||
          evt.location.area.toLowerCase().includes(q) ||
          evt.notes?.toLowerCase().includes(q) ||
          evt.eventType.toLowerCase().includes(q)
      );
    }

    return results;
  },

  /**
   * Retrieves a single event by ID.
   */
  async getEventById(id: string): Promise<EnvironmentalEvent | null> {
    const events = backendTelemetryService.getEvents();
    return events.find((evt) => evt.id === id) || null;
  },

  /**
   * Adds a new event (used when manually logging an event).
   */
  async logSimulatedEvent(newEvent: Omit<EnvironmentalEvent, 'id'>): Promise<EnvironmentalEvent> {
    const created: EnvironmentalEvent = {
      ...newEvent,
      id: `evt-${Date.now().toString().slice(-4)}`,
    };
    return created;
  },
};
