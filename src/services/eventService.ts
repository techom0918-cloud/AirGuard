import { EnvironmentalEvent, RiskLevel, EventType } from '../types';
import { mockEnvironmentalEvents } from '../data/mockEvents';

/**
 * Service abstraction for Environmental and Inhalation Events.
 * Easily interchangeable with Firebase Realtime Database / Firestore queries.
 */

let eventStore: EnvironmentalEvent[] = [...mockEnvironmentalEvents];

export interface EventFilterCriteria {
  riskLevel?: RiskLevel | 'all';
  eventType?: EventType | 'all';
  searchQuery?: string;
  startDate?: string;
}

export const eventService = {
  /**
   * Retrieves events matching optional filters.
   */
  async getEvents(filters?: EventFilterCriteria): Promise<EnvironmentalEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    let results = [...eventStore];

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
    await new Promise((resolve) => setTimeout(resolve, 50));
    return eventStore.find((evt) => evt.id === id) || null;
  },

  /**
   * Adds a new event (used when simulating an event from hardware trigger).
   */
  async logSimulatedEvent(newEvent: Omit<EnvironmentalEvent, 'id'>): Promise<EnvironmentalEvent> {
    const created: EnvironmentalEvent = {
      ...newEvent,
      id: `evt-${Date.now().toString().slice(-4)}`,
    };
    eventStore = [created, ...eventStore];
    return created;
  },
};
