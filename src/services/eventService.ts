import { EnvironmentalEvent, RiskLevel, EventType } from '../types';
import { mockEnvironmentalEvents } from '../data/mockEvents';
import { apiClient } from './apiClient';
import { readingToEvent, BackendReadingDto } from './adapters';

let eventStore: EnvironmentalEvent[] = [...mockEnvironmentalEvents];

export interface EventFilterCriteria {
  riskLevel?: RiskLevel | 'all';
  eventType?: EventType | 'all';
  searchQuery?: string;
  startDate?: string;
}

export const eventService = {
  /**
   * Fetches real environmental telemetry points from backend REST API heatmap endpoint.
   */
  async fetchEventsFromApi(): Promise<EnvironmentalEvent[]> {
    try {
      const dtos = await apiClient.get<BackendReadingDto[]>(
        '/heatmap?minLat=28.5&maxLat=28.7&minLng=77.1&maxLng=77.4&limit=100'
      );
      if (Array.isArray(dtos) && dtos.length > 0) {
        eventStore = dtos.map((dto) => readingToEvent(dto));
      }
    } catch {
      // Graceful fallback to mockEnvironmentalEvents if backend API server is unreachable
    }
    return eventStore;
  },

  /**
   * Retrieves events matching optional filters.
   */
  async getEvents(filters?: EventFilterCriteria): Promise<EnvironmentalEvent[]> {
    await this.fetchEventsFromApi();
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
    await this.fetchEventsFromApi();
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
