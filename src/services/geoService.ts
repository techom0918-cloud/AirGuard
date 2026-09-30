import { EnvironmentalEvent, RiskLevel } from '../types';
import { fetchLiveTelemetry, calculateRiskFromPM25 } from './meteoService';

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  name?: string;
  source: 'gps' | 'preset' | 'default' | 'search';
}

export interface SearchPlaceResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

export interface LocationPreset {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const POPULAR_GLOBAL_HUBS: SearchPlaceResult[] = [
  // India Cities & Regions
  { id: 'hub-niet', name: 'NIET Greater Noida', displayName: 'NIET, Knowledge Park II, Greater Noida, Uttar Pradesh, India', lat: 28.4623, lng: 77.4904, type: 'campus' },
  { id: 'hub-noida', name: 'Greater Noida', displayName: 'Greater Noida, Uttar Pradesh, India', lat: 28.4744, lng: 77.5040, type: 'city' },
  { id: 'hub-delhi', name: 'New Delhi', displayName: 'New Delhi, Delhi, India', lat: 28.6139, lng: 77.2090, type: 'city' },
  { id: 'hub-dharwad', name: 'Dharwad', displayName: 'Dharwad, Karnataka, India', lat: 15.4589, lng: 75.0078, type: 'city' },
  { id: 'hub-hubballi', name: 'Hubballi (Hubli)', displayName: 'Hubballi, Karnataka, India', lat: 15.3647, lng: 75.1240, type: 'city' },
  { id: 'hub-prayagraj', name: 'Prayagraj (Allahabad)', displayName: 'Prayagraj, Uttar Pradesh, India', lat: 25.4358, lng: 81.8463, type: 'city' },
  { id: 'hub-varanasi', name: 'Varanasi', displayName: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lng: 82.9739, type: 'city' },
  { id: 'hub-lucknow', name: 'Lucknow', displayName: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lng: 80.9462, type: 'city' },
  { id: 'hub-kanpur', name: 'Kanpur', displayName: 'Kanpur, Uttar Pradesh, India', lat: 26.4499, lng: 80.3319, type: 'city' },
  { id: 'hub-mumbai', name: 'Mumbai', displayName: 'Mumbai, Maharashtra, India', lat: 19.0760, lng: 72.8777, type: 'city' },
  { id: 'hub-pune', name: 'Pune', displayName: 'Pune, Maharashtra, India', lat: 18.5204, lng: 73.8567, type: 'city' },
  { id: 'hub-blr', name: 'Bengaluru (Bangalore)', displayName: 'Bengaluru, Karnataka, India', lat: 12.9716, lng: 77.5946, type: 'city' },
  { id: 'hub-mysore', name: 'Mysuru (Mysore)', displayName: 'Mysuru, Karnataka, India', lat: 12.2958, lng: 76.6394, type: 'city' },
  { id: 'hub-hyd', name: 'Hyderabad', displayName: 'Hyderabad, Telangana, India', lat: 17.3850, lng: 78.4867, type: 'city' },
  { id: 'hub-chennai', name: 'Chennai', displayName: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707, type: 'city' },
  { id: 'hub-kolkata', name: 'Kolkata', displayName: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639, type: 'city' },
  { id: 'hub-patna', name: 'Patna', displayName: 'Patna, Bihar, India', lat: 25.5941, lng: 85.1376, type: 'city' },
  { id: 'hub-jaipur', name: 'Jaipur', displayName: 'Jaipur, Rajasthan, India', lat: 26.9124, lng: 75.7873, type: 'city' },
  { id: 'hub-ahmedabad', name: 'Ahmedabad', displayName: 'Ahmedabad, Gujarat, India', lat: 23.0225, lng: 72.5714, type: 'city' },
  { id: 'hub-surat', name: 'Surat', displayName: 'Surat, Gujarat, India', lat: 21.1702, lng: 72.8311, type: 'city' },
  { id: 'hub-indore', name: 'Indore', displayName: 'Indore, Madhya Pradesh, India', lat: 22.7196, lng: 75.8577, type: 'city' },
  { id: 'hub-bhopal', name: 'Bhopal', displayName: 'Bhopal, Madhya Pradesh, India', lat: 23.2599, lng: 77.4126, type: 'city' },
  { id: 'hub-kochi', name: 'Kochi (Cochin)', displayName: 'Kochi, Kerala, India', lat: 9.9312, lng: 76.2673, type: 'city' },
  { id: 'hub-chandigarh', name: 'Chandigarh', displayName: 'Chandigarh, India', lat: 30.7333, lng: 76.7794, type: 'city' },
  { id: 'hub-nagpur', name: 'Nagpur', displayName: 'Nagpur, Maharashtra, India', lat: 21.1458, lng: 79.0882, type: 'city' },
  { id: 'hub-ranchi', name: 'Ranchi', displayName: 'Ranchi, Jharkhand, India', lat: 23.3441, lng: 85.3096, type: 'city' },
  { id: 'hub-guwahati', name: 'Guwahati', displayName: 'Guwahati, Assam, India', lat: 26.1445, lng: 91.7362, type: 'city' },
  { id: 'hub-vizag', name: 'Visakhapatnam', displayName: 'Visakhapatnam, Andhra Pradesh, India', lat: 17.6868, lng: 83.2185, type: 'city' },

  // International Hubs
  { id: 'hub-sf', name: 'San Francisco', displayName: 'San Francisco, California, United States', lat: 37.7749, lng: -122.4194, type: 'city' },
  { id: 'hub-nyc', name: 'New York City', displayName: 'New York, United States', lat: 40.7128, lng: -74.0060, type: 'city' },
  { id: 'hub-london', name: 'London', displayName: 'London, England, United Kingdom', lat: 51.5074, lng: -0.1278, type: 'city' },
  { id: 'hub-paris', name: 'Paris', displayName: 'Paris, Île-de-France, France', lat: 48.8566, lng: 2.3522, type: 'city' },
  { id: 'hub-tokyo', name: 'Tokyo', displayName: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, type: 'city' },
  { id: 'hub-singapore', name: 'Singapore', displayName: 'Singapore, Singapore', lat: 1.3521, lng: 103.8198, type: 'city' },
  { id: 'hub-dubai', name: 'Dubai', displayName: 'Dubai, United Arab Emirates', lat: 25.2048, lng: 55.2708, type: 'city' },
];

export const LOCATION_PRESETS: LocationPreset[] = [
  {
    id: 'niet-g-noida',
    name: 'NIET Greater Noida',
    area: 'Knowledge Park II, Greater Noida',
    lat: 28.4623,
    lng: 77.4904,
  },
  {
    id: 'dharwad',
    name: 'Dharwad Urban',
    area: 'Jubilee Circle & Toll Naka',
    lat: 15.4589,
    lng: 75.0078,
  },
  {
    id: 'prayagraj',
    name: 'Prayagraj Junction',
    area: 'Civil Lines & Katra',
    lat: 25.4358,
    lng: 81.8463,
  },
  {
    id: 'delhi',
    name: 'New Delhi Metro',
    area: 'Connaught Place & Ring Road',
    lat: 28.6304,
    lng: 77.2177,
  },
  {
    id: 'sf',
    name: 'San Francisco Metro',
    area: 'Downtown & Financial District',
    lat: 37.7749,
    lng: -122.4194,
  },
];

const RECENT_SEARCHES_KEY = 'airguard_recent_locations_v1';

export function getRecentSearches(): SearchPlaceResult[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(place: SearchPlaceResult): void {
  try {
    const current = getRecentSearches().filter((p) => p.displayName !== place.displayName);
    const updated = [place, ...current].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Searches worldwide locations, cities, neighborhoods, and landmarks via Photon (OpenStreetMap engine).
 * Also queries Nominatim as fallback and merges with offline local hub index.
 */
export async function searchPlacesOnline(query: string): Promise<SearchPlaceResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 2) {
    return [];
  }

  const lowerQ = cleanQ.toLowerCase();
  const offlineMatches = POPULAR_GLOBAL_HUBS.filter(
    (h) => h.name.toLowerCase().includes(lowerQ) || h.displayName.toLowerCase().includes(lowerQ)
  );

  // 1. Try Photon Geocoding API (OpenStreetMap-powered, no rate limits, supports all global cities & towns)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=8`;

    const res = await fetch(photonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const liveResults: SearchPlaceResult[] = data.features.map((feat: any, idx: number) => {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates || [0, 0];
          const mainName = props.name || props.city || props.town || props.village || cleanQ;
          const detailParts = [
            props.name !== props.city ? props.name : '',
            props.city || props.town || props.district || props.county,
            props.state,
            props.country,
          ].filter(Boolean);

          const fullDisplay = detailParts.filter((v, i, a) => a.indexOf(v) === i).join(', ') || mainName;

          return {
            id: `photon-${props.osm_id || idx}-${Date.now()}`,
            name: mainName,
            displayName: fullDisplay,
            lat: coords[1],
            lng: coords[0],
            type: props.osm_value || 'location',
          };
        });

        // Merge with matching offline items
        const existingNames = new Set(liveResults.map((r) => r.displayName.toLowerCase()));
        const extraOffline = offlineMatches.filter((o) => !existingNames.has(o.displayName.toLowerCase()));
        return [...liveResults, ...extraOffline];
      }
    }
  } catch {
    // Photon unavailable — continue to Nominatim fallback
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQ
    )}&limit=6&addressdetails=1`;

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const liveResults: SearchPlaceResult[] = data.map((item: any, idx: number) => ({
          id: `nom-${item.place_id || idx}-${Date.now()}`,
          name: item.name || item.display_name.split(',')[0],
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'location',
        }));

        const existingNames = new Set(liveResults.map((r) => r.name.toLowerCase()));
        const extraOffline = offlineMatches.filter((o) => !existingNames.has(o.name.toLowerCase()));
        return [...liveResults, ...extraOffline];
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return offlineMatches;
}

/**
 * Calculates geodesic distance between two latitude/longitude points in kilometers using Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

/**
 * Formats a kilometer distance for display (meters for < 1km, km for >= 1km).
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Performs reverse geocoding for any given latitude and longitude coordinates.
 * Returns a clean, detailed address string (e.g., "Knowledge Park III, Greater Noida, Uttar Pradesh").
 */
export async function reverseGeocodeLatLng(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.residential ||
        addr.hamlet ||
        addr.road ||
        '';

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        '';

      const state = addr.state || '';

      const parts = [locality, city, state].filter(Boolean);
      // Remove exact duplicates
      const uniqueParts = parts.filter((item, pos) => parts.indexOf(item) === pos);

      if (uniqueParts.length > 0) {
        return uniqueParts.join(', ');
      } else if (data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
    }
  } catch {
    // Fallback if offline
  }
  return `Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
}

/**
 * Requests the user's real-time geographic position via browser Geolocation API.
 */
export async function detectBrowserLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let placeName = await reverseGeocodeLatLng(latitude, longitude);

        if (placeName.startsWith('Location (')) {
          placeName = 'My Live Location';
        }

        resolve({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          name: placeName,
          source: 'gps',
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Offsets a coordinate point by distance in km (bearing in degrees 0-360).
 */
function offsetCoordinates(
  lat: number,
  lng: number,
  distanceKm: number,
  bearingDeg: number
): { lat: number; lng: number } {
  const R = 6371;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(brng)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lon2 * 180) / Math.PI,
  };
}

/**
 * Reverse-geocodes a single lat/lng to get the real locality/suburb name.
 * Returns a fallback label if the API is unavailable.
 */
async function reverseGeocodeName(
  lat: number,
  lng: number,
  fallbackName: string
): Promise<{ name: string; area: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const suburb =
        addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
      const road = addr.road || addr.pedestrian || addr.hamlet || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';

      // Build a real place name from the address components
      const primaryName = suburb || road || data.name || fallbackName;
      const areaName = [road && suburb ? road : '', city].filter(Boolean).join(', ') || city;

      return {
        name: primaryName,
        area: areaName || fallbackName,
      };
    }
  } catch {
    // Offline or rate-limited — use fallback
  }
  return { name: fallbackName, area: fallbackName };
}

/**
 * Generates localized environmental trigger stations distributed within a 1-10 km
 * radius around the given coordinates. Each pin is reverse-geocoded to show real
 * locality names (e.g. "Chowk", "George Town", "Civil Lines") from OpenStreetMap.
 */
export function generateLocalizedEvents(
  centerLat: number,
  centerLng: number,
  locationName: string = 'Current Vicinity'
): EnvironmentalEvent[] {
  const templates: Array<{
    fallbackName: string;
    fallbackArea: string;
    distance: number;
    bearing: number;
    riskLevel: RiskLevel;
    pm25: number;
    pm10: number;
    voc: number;
    temp: number;
    humidity: number;
    eventType: EnvironmentalEvent['eventType'];
    inhalationDetected: boolean;
    doses?: number;
    trend: string;
    notes: string;
    prompt?: string;
  }> = [
    {
      fallbackName: 'Nearby Transit Area',
      fallbackArea: 'Bus Stand / Railway Zone',
      distance: 1.4,
      bearing: 42,
      riskLevel: 'moderate',
      pm25: 56,
      pm10: 78,
      voc: 330,
      temp: 27,
      humidity: 58,
      eventType: 'Environmental Warning',
      inhalationDetected: false,
      trend: 'Rising (+26% dust density in 15 min)',
      notes:
        'Elevated diesel particulate matter and idling combustion exhaust concentrated along road.',
      prompt:
        'Moving to cross-ventilated area reduced particulate count within 4 minutes.',
    },
    {
      fallbackName: 'Park / Green Zone',
      fallbackArea: 'Canopy Walkway',
      distance: 2.3,
      bearing: 135,
      riskLevel: 'low',
      pm25: 21,
      pm10: 30,
      voc: 85,
      temp: 24,
      humidity: 64,
      eventType: 'Inhalation Event',
      inhalationDetected: true,
      doses: 1,
      trend: 'Optimal Clean Baseline',
      notes:
        'Vegetation canopy and open space provided optimal air filtration. Routine preventive dose logged.',
      prompt: 'Clean baseline zone suitable for aerobic exercise.',
    },
    {
      fallbackName: 'Market / Commercial Area',
      fallbackArea: 'Commercial Street',
      distance: 3.1,
      bearing: 210,
      riskLevel: 'moderate',
      pm25: 62,
      pm10: 84,
      voc: 420,
      temp: 28,
      humidity: 61,
      eventType: 'Environmental Warning',
      inhalationDetected: false,
      trend: 'Localized Volatile Spike',
      notes:
        'High volatile organic compounds from cooking smoke and commercial activity.',
    },
    {
      fallbackName: 'Industrial / Highway Area',
      fallbackArea: 'Freight Corridor',
      distance: 4.8,
      bearing: 315,
      riskLevel: 'high',
      pm25: 98,
      pm10: 135,
      voc: 690,
      temp: 31,
      humidity: 48,
      eventType: 'Environmental Anomaly',
      inhalationDetected: true,
      doses: 2,
      trend: 'Acute Spike (+92% in 8 min)',
      notes:
        'Heavy vehicle traffic combined with construction dust created high particulate density.',
      prompt:
        'Smart inhaler logged 2 actuations. Airflow alert triggered indoor relocation.',
    },
    {
      fallbackName: 'Central Business Area',
      fallbackArea: 'Main Road Crossing',
      distance: 6.2,
      bearing: 80,
      riskLevel: 'moderate',
      pm25: 51,
      pm10: 69,
      voc: 280,
      temp: 29,
      humidity: 53,
      eventType: 'Environmental Warning',
      inhalationDetected: false,
      trend: 'Moderate Sustained (+15%)',
      notes:
        'Vehicle congestion and thermal radiation increased airborne fine particulates.',
    },
    {
      fallbackName: 'Riverside / Open Ground',
      fallbackArea: 'Waterfront',
      distance: 7.4,
      bearing: 165,
      riskLevel: 'low',
      pm25: 26,
      pm10: 36,
      voc: 110,
      temp: 23,
      humidity: 71,
      eventType: 'Baseline Sync',
      inhalationDetected: false,
      trend: 'Stable Open-Air Flow',
      notes:
        'Persistent ambient breeze dispersing airborne triggers. Excellent ambient airway safety.',
    },
    {
      fallbackName: 'Highway Junction',
      fallbackArea: 'Multi-lane Interchange',
      distance: 8.6,
      bearing: 260,
      riskLevel: 'high',
      pm25: 92,
      pm10: 122,
      voc: 610,
      temp: 30,
      humidity: 47,
      eventType: 'Environmental Anomaly',
      inhalationDetected: true,
      doses: 1,
      trend: 'Elevated Particulate Plume',
      notes:
        'Braking dust, tire wear debris, and sustained exhaust build-up near highway ramps.',
    },
    {
      fallbackName: 'Outer Residential Colony',
      fallbackArea: 'Suburban Zone',
      distance: 9.3,
      bearing: 350,
      riskLevel: 'low',
      pm25: 18,
      pm10: 27,
      voc: 70,
      temp: 22,
      humidity: 60,
      eventType: 'Inhalation Event',
      inhalationDetected: true,
      doses: 1,
      trend: 'Optimal Low Risk',
      notes:
        'Low density residential area with clean air profile verified by GP2Y1010AU0F dust sensor.',
    },
  ];

  // Generate events synchronously first with fallback names
  const events = templates.map((t, idx) => {
    const coords = offsetCoordinates(centerLat, centerLng, t.distance, t.bearing);
    const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);

    return {
      id: `evt-geo-${idx + 101}`,
      timestamp: idx % 2 === 0 ? '10:42 AM' : '02:15 PM',
      date: idx < 3 ? 'Today' : 'Yesterday',
      eventType: t.eventType,
      riskLevel: t.riskLevel,
      pm25: t.pm25,
      pm10: t.pm10,
      voc: t.voc,
      temperature: t.temp,
      humidity: t.humidity,
      pressure: 1013,
      location: {
        name: t.fallbackName,
        area: `${t.fallbackArea} (~${formatDistance(dist)} from ${locationName})`,
        lat: coords.lat,
        lng: coords.lng,
      },
      inhalationDetected: t.inhalationDetected,
      inhalationDoseCount: t.doses,
      environmentalTrend: t.trend,
      notes: t.notes,
      recommendationPrompt: t.prompt,
      distanceKm: dist,
    };
  });

  return events;
}

/**
 * Enriches events with real locality names from Nominatim/Photon reverse geocoding
 * AND real-time Open-Meteo Air Quality & Weather API readings.
 */
export async function resolveRealPlaceNames(
  events: EnvironmentalEvent[],
  locationName: string
): Promise<EnvironmentalEvent[]> {
  const enriched = [...events];

  // 1. Fetch live Open-Meteo telemetry for anchor location
  let liveMeteo: any = null;
  if (events.length > 0) {
    try {
      liveMeteo = await fetchLiveTelemetry(events[0].location.lat, events[0].location.lng, locationName);
    } catch {
      // Keep fallbacks if network fails
    }
  }

  for (let i = 0; i < enriched.length; i++) {
    const evt = enriched[i];
    try {
      const realPlace = await reverseGeocodeName(
        evt.location.lat,
        evt.location.lng,
        evt.location.name
      );
      const dist = evt.distanceKm ?? 0;

      // Apply live Open-Meteo telemetry offset by distance
      let pm25 = evt.pm25;
      let pm10 = evt.pm10;
      let voc = evt.voc;
      let temp = evt.temperature;
      let humidity = evt.humidity;
      let pressure = evt.pressure;
      let riskLevel = evt.riskLevel;

      if (liveMeteo) {
        // Vary readings naturally across 5-10km distance radius
        const offset = Math.sin(i * 1.5) * 6;
        pm25 = Math.max(5, Math.round(liveMeteo.pm25 + offset));
        pm10 = Math.max(10, Math.round(liveMeteo.pm10 + offset * 1.3));
        voc = Math.max(40, Math.round(liveMeteo.voc + offset * 10));
        temp = Math.round(liveMeteo.temperature + (i % 2 === 0 ? 1 : -1));
        humidity = Math.round(liveMeteo.humidity);
        pressure = liveMeteo.pressure;
        riskLevel = calculateRiskFromPM25(pm25, liveMeteo.usAqi);
      }

      enriched[i] = {
        ...evt,
        pm25,
        pm10,
        voc,
        temperature: temp,
        humidity,
        pressure,
        riskLevel,
        location: {
          ...evt.location,
          name: realPlace.name,
          area: `${realPlace.area} (~${formatDistance(dist)} from ${locationName})`,
        },
      };
    } catch {
      // Keep fallback if error
    }

    if (i < enriched.length - 1) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  return enriched;
}

